/**
 * HubSpot Contact Synchronization and Deduplication
 * Handles existing contacts, merging, and subscription history
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const HUBSPOT_API_KEY = process.env.HUBSPOT_ACCESS_TOKEN
const HUBSPOT_API_URL = 'https://api.hubapi.com'

interface HubSpotContact {
  id?: string
  properties: {
    email: string
    firstname?: string
    lastname?: string
    company?: string
    phone?: string
    lifecyclestage?: string
    hs_lead_status?: string
    subscription_tier?: string
    subscription_status?: string
    subscription_history?: string
    total_lifetime_value?: number
    churned_date?: string
    churned_reason?: string
    upgrade_count?: number
    downgrade_count?: number
    cancellation_count?: number
  }
}

/**
 * Search for existing contact by email
 */
export async function findContactByEmail(email: string): Promise<HubSpotContact | null> {
  try {
    const response = await fetch(
      `${HUBSPOT_API_URL}/crm/v3/objects/contacts/search`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'email',
                  operator: 'EQ',
                  value: email
                }
              ]
            }
          ],
          properties: [
            'email', 'firstname', 'lastname', 'company', 'phone',
            'lifecyclestage', 'hs_lead_status', 'subscription_tier',
            'subscription_status', 'subscription_history', 'total_lifetime_value',
            'churned_date', 'churned_reason', 'upgrade_count', 'downgrade_count',
            'cancellation_count'
          ]
        })
      }
    )

    if (!response.ok) {
      console.error('HubSpot search failed:', await response.text())
      return null
    }

    const data = await response.json()
    if (data.results && data.results.length > 0) {
      return data.results[0]
    }

    return null
  } catch (error) {
    console.error('Error searching HubSpot contact:', error)
    return null
  }
}

/**
 * Create or update contact with deduplication
 */
export async function syncContactToHubSpot(data: {
  email: string
  firstname?: string
  lastname?: string
  company?: string
  phone?: string
  tier?: string
  status?: string
  action?: 'signup' | 'upgrade' | 'downgrade' | 'cancel' | 'reactivate'
}) {
  try {
    // Check if contact exists
    const existingContact = await findContactByEmail(data.email)
    
    // Prepare subscription history entry
    const historyEntry = {
      date: new Date().toISOString(),
      action: data.action || 'update',
      tier: data.tier,
      status: data.status
    }

    // Calculate metrics
    let upgradeCount = 0
    let downgradeCount = 0
    let cancellationCount = 0
    let subscriptionHistory: any[] = []

    if (existingContact?.properties?.subscription_history) {
      try {
        subscriptionHistory = JSON.parse(existingContact.properties.subscription_history)
      } catch {
        subscriptionHistory = []
      }
      
      // Count actions
      upgradeCount = existingContact.properties.upgrade_count || 0
      downgradeCount = existingContact.properties.downgrade_count || 0
      cancellationCount = existingContact.properties.cancellation_count || 0
    }

    // Add new history entry
    subscriptionHistory.push(historyEntry)
    
    // Update counts based on action
    if (data.action === 'upgrade') upgradeCount++
    if (data.action === 'downgrade') downgradeCount++
    if (data.action === 'cancel') cancellationCount++

    // Prepare properties
    const properties: any = {
      email: data.email,
      subscription_tier: data.tier || 'starter',
      subscription_status: data.status || 'active',
      subscription_history: JSON.stringify(subscriptionHistory.slice(-10)), // Keep last 10 entries
      upgrade_count: upgradeCount,
      downgrade_count: downgradeCount,
      cancellation_count: cancellationCount
    }

    // Only update name/company/phone if provided and not already set
    if (data.firstname && (!existingContact || !existingContact.properties.firstname)) {
      properties.firstname = data.firstname
    }
    if (data.lastname && (!existingContact || !existingContact.properties.lastname)) {
      properties.lastname = data.lastname
    }
    if (data.company && (!existingContact || !existingContact.properties.company)) {
      properties.company = data.company
    }
    if (data.phone && (!existingContact || !existingContact.properties.phone)) {
      properties.phone = data.phone
    }

    // Set lifecycle stage based on action
    if (data.action === 'signup') {
      properties.lifecyclestage = 'customer'
      properties.hs_lead_status = 'NEW'
    } else if (data.action === 'cancel') {
      properties.lifecyclestage = 'other'
      properties.hs_lead_status = 'CHURNED'
      properties.churned_date = new Date().toISOString()
    } else if (data.action === 'reactivate') {
      properties.lifecyclestage = 'customer'
      properties.hs_lead_status = 'REACTIVATED'
      properties.churned_date = '' // Clear churned date
    }

    if (existingContact) {
      // Update existing contact
      const response = await fetch(
        `${HUBSPOT_API_URL}/crm/v3/objects/contacts/${existingContact.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ properties })
        }
      )

      if (!response.ok) {
        console.error('HubSpot update failed:', await response.text())
        return { success: false, error: 'Failed to update contact' }
      }

      return { 
        success: true, 
        contactId: existingContact.id,
        isExisting: true,
        previousTier: existingContact.properties.subscription_tier,
        previousStatus: existingContact.properties.subscription_status
      }
    } else {
      // Create new contact
      const response = await fetch(
        `${HUBSPOT_API_URL}/crm/v3/objects/contacts`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ properties })
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        
        // Check if it's a duplicate email error
        if (errorText.includes('DUPLICATE') || errorText.includes('already exists')) {
          // Try to find and update instead
          const existingContact = await findContactByEmail(data.email)
          if (existingContact) {
            return syncContactToHubSpot(data) // Recursive call to update
          }
        }
        
        console.error('HubSpot create failed:', errorText)
        return { success: false, error: 'Failed to create contact' }
      }

      const newContact = await response.json()
      return { 
        success: true, 
        contactId: newContact.id,
        isExisting: false
      }
    }
  } catch (error) {
    console.error('HubSpot sync error:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Handle subscription changes
 */
export async function handleSubscriptionChange(
  email: string,
  oldTier: string,
  newTier: string,
  reason?: string
) {
  const tierRank: Record<string, number> = {
    starter: 1,
    professional: 2,
    premium: 3,
    enterprise: 4
  }

  const action = tierRank[newTier] > tierRank[oldTier] ? 'upgrade' : 'downgrade'
  
  return await syncContactToHubSpot({
    email,
    tier: newTier,
    status: 'active',
    action
  })
}

/**
 * Handle cancellation
 */
export async function handleCancellation(
  email: string,
  tier: string,
  reason?: string
) {
  // Store cancellation reason in database
  const business = await prisma.business.findUnique({
    where: { email }
  })

  if (business) {
    await prisma.subscription.update({
      where: { businessId: business.id },
      data: {
        cancelReason: reason,
        cancelDate: new Date()
      }
    })
  }

  // Sync to HubSpot
  return await syncContactToHubSpot({
    email,
    tier,
    status: 'cancelled',
    action: 'cancel'
  })
}

/**
 * Check if contact can reactivate (not too many cancellations)
 */
export async function canReactivate(email: string): Promise<{
  canReactivate: boolean
  reason?: string
  previousCancellations?: number
}> {
  const contact = await findContactByEmail(email)
  
  if (!contact) {
    return { canReactivate: true }
  }

  const cancellationCount = contact.properties.cancellation_count || 0
  
  // Business rules
  if (cancellationCount >= 3) {
    return {
      canReactivate: false,
      reason: 'Too many previous cancellations. Please contact support.',
      previousCancellations: cancellationCount
    }
  }

  // Check if recently cancelled (within 24 hours)
  if (contact.properties.churned_date) {
    const churnedDate = new Date(contact.properties.churned_date)
    const hoursSinceChurn = (Date.now() - churnedDate.getTime()) / (1000 * 60 * 60)
    
    if (hoursSinceChurn < 24) {
      return {
        canReactivate: false,
        reason: 'Please wait 24 hours after cancellation before reactivating.',
        previousCancellations: cancellationCount
      }
    }
  }

  return {
    canReactivate: true,
    previousCancellations: cancellationCount
  }
}

/**
 * Get contact's subscription history
 */
export async function getSubscriptionHistory(email: string) {
  const contact = await findContactByEmail(email)
  
  if (!contact) {
    return null
  }

  let history: any[] = []
  if (contact.properties.subscription_history) {
    try {
      history = JSON.parse(contact.properties.subscription_history)
    } catch {
      history = []
    }
  }

  return {
    currentTier: contact.properties.subscription_tier,
    currentStatus: contact.properties.subscription_status,
    history,
    metrics: {
      upgradeCount: contact.properties.upgrade_count || 0,
      downgradeCount: contact.properties.downgrade_count || 0,
      cancellationCount: contact.properties.cancellation_count || 0,
      lifetimeValue: contact.properties.total_lifetime_value || 0
    }
  }
}

/**
 * Merge duplicate contacts
 */
export async function mergeDuplicateContacts(primaryEmail: string, duplicateEmail: string) {
  try {
    const [primary, duplicate] = await Promise.all([
      findContactByEmail(primaryEmail),
      findContactByEmail(duplicateEmail)
    ])

    if (!primary || !duplicate) {
      return { success: false, error: 'One or both contacts not found' }
    }

    // Merge subscription histories
    let primaryHistory: any[] = []
    let duplicateHistory: any[] = []
    
    try {
      if (primary.properties.subscription_history) {
        primaryHistory = JSON.parse(primary.properties.subscription_history)
      }
      if (duplicate.properties.subscription_history) {
        duplicateHistory = JSON.parse(duplicate.properties.subscription_history)
      }
    } catch {}

    const mergedHistory = [...primaryHistory, ...duplicateHistory]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Combine metrics
    const mergedProperties = {
      subscription_history: JSON.stringify(mergedHistory),
      upgrade_count: (primary.properties.upgrade_count || 0) + (duplicate.properties.upgrade_count || 0),
      downgrade_count: (primary.properties.downgrade_count || 0) + (duplicate.properties.downgrade_count || 0),
      cancellation_count: (primary.properties.cancellation_count || 0) + (duplicate.properties.cancellation_count || 0),
      total_lifetime_value: (primary.properties.total_lifetime_value || 0) + (duplicate.properties.total_lifetime_value || 0)
    }

    // Update primary contact
    await fetch(
      `${HUBSPOT_API_URL}/crm/v3/objects/contacts/${primary.id}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties: mergedProperties })
      }
    )

    // Delete duplicate
    await fetch(
      `${HUBSPOT_API_URL}/crm/v3/objects/contacts/${duplicate.id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
        }
      }
    )

    return { success: true, mergedContactId: primary.id }
  } catch (error) {
    console.error('Merge error:', error)
    return { success: false, error: String(error) }
  }
}