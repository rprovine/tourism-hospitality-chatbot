import { Client } from '@hubspot/api-client'
import axios from 'axios'

// Initialize HubSpot client
const hubspotClient = new Client({ 
  accessToken: process.env.HUBSPOT_ACCESS_TOKEN 
})

export interface HubSpotPaymentConfig {
  portalId: string
  formId?: string
  paymentLinkId?: string
  webhookUrl?: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  tier: 'starter' | 'professional' | 'premium' | 'enterprise'
  price: number
  interval: 'monthly' | 'yearly'
  features: string[]
}

// Subscription plans mapping
export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  starter_monthly: {
    id: 'starter_monthly',
    name: 'Starter Plan',
    tier: 'starter',
    price: 29,
    interval: 'monthly',
    features: [
      '1,000 conversations/month',
      'Claude Haiku AI',
      'Basic analytics dashboard',
      'Email support'
    ]
  },
  professional_monthly: {
    id: 'professional_monthly',
    name: 'Professional Plan',
    tier: 'professional',
    price: 149,
    interval: 'monthly',
    features: [
      '5,000 conversations/month',
      'Dual AI: Claude + GPT-4',
      'Advanced analytics',
      '24/7 priority support'
    ]
  },
  premium_monthly: {
    id: 'premium_monthly',
    name: 'Premium Plan',
    tier: 'premium',
    price: 299,
    interval: 'monthly',
    features: [
      'Unlimited conversations',
      'Enhanced Dual AI + Self-Learning',
      '5 languages',
      'Dedicated success manager'
    ]
  },
  enterprise_monthly: {
    id: 'enterprise_monthly',
    name: 'Enterprise Plan',
    tier: 'enterprise',
    price: 999, // Starting price
    interval: 'monthly',
    features: [
      'Custom AI Blend',
      'Multi-property support',
      '10+ languages',
      'Enterprise API'
    ]
  },
  // Yearly plans with discounts
  starter_yearly: {
    id: 'starter_yearly',
    name: 'Starter Plan (Annual)',
    tier: 'starter',
    price: 290, // Save $58
    interval: 'yearly',
    features: [
      '1,000 conversations/month',
      'Claude Haiku AI',
      'Basic analytics dashboard',
      'Email support',
      '💰 Save $58/year'
    ]
  },
  professional_yearly: {
    id: 'professional_yearly',
    name: 'Professional Plan (Annual)',
    tier: 'professional',
    price: 1490, // Save $298
    interval: 'yearly',
    features: [
      '5,000 conversations/month',
      'Dual AI: Claude + GPT-4',
      'Advanced analytics',
      '24/7 priority support',
      '💰 Save $298/year'
    ]
  },
  premium_yearly: {
    id: 'premium_yearly',
    name: 'Premium Plan (Annual)',
    tier: 'premium',
    price: 2990, // Save $598
    interval: 'yearly',
    features: [
      'Unlimited conversations',
      'Enhanced Dual AI + Self-Learning',
      '5 languages',
      'Dedicated success manager',
      '💰 Save $598/year'
    ]
  }
}

// Create or update contact in HubSpot
export async function createOrUpdateContact(data: {
  email: string
  firstname?: string
  lastname?: string
  company?: string
  phone?: string
  tier?: string
}) {
  try {
    // Only use standard HubSpot properties
    const contactObj = {
      properties: {
        email: data.email,
        firstname: data.firstname || '',
        lastname: data.lastname || '',
        company: data.company || '',
        phone: data.phone || '',
        // Use notes field to store tier info if custom properties don't exist
        hs_lead_status: data.tier || 'starter',
        lifecyclestage: 'customer' // Standard property name
      }
    }

    // Try to update existing contact first
    try {
      const response = await hubspotClient.crm.contacts.basicApi.update(
        data.email,
        contactObj
      )
      return response
    } catch (error) {
      // If contact doesn't exist, create new one
      const response = await hubspotClient.crm.contacts.basicApi.create(contactObj)
      return response
    }
  } catch (error) {
    console.error('Error creating/updating HubSpot contact:', error)
    throw error
  }
}

// Create a deal for subscription
export async function createSubscriptionDeal(data: {
  contactId: string
  planId: string
  amount: number
  businessName: string
}) {
  try {
    const plan = SUBSCRIPTION_PLANS[data.planId]
    
    const dealObj = {
      properties: {
        dealname: `${data.businessName} - ${plan.name}`,
        amount: data.amount.toString(),
        pipeline: 'default',
        dealstage: 'contractsent',
        subscription_type: plan.tier,
        subscription_interval: plan.interval,
        closedate: new Date().toISOString()
      }
    }

    const deal = await hubspotClient.crm.deals.basicApi.create(dealObj)

    // Associate deal with contact
    await hubspotClient.crm.deals.associationsApi.create(
      deal.id,
      'contacts',
      data.contactId,
      'deal_to_contact'
    )

    return deal
  } catch (error) {
    console.error('Error creating HubSpot deal:', error)
    throw error
  }
}

// Create payment link for checkout
export async function createPaymentLink(data: {
  planId: string
  businessEmail: string
  businessName: string
  redirectUrl?: string
}) {
  const plan = SUBSCRIPTION_PLANS[data.planId]
  
  if (plan.tier === 'enterprise') {
    // For enterprise, create a custom quote request
    return {
      url: `/contact-sales?plan=enterprise&business=${encodeURIComponent(data.businessName)}`,
      isCustomQuote: true
    }
  }

  // Generate HubSpot payment link
  // Note: This requires HubSpot Payments to be configured in your portal
  const paymentLinkUrl = `https://app.hubspot.com/payments/checkout/${process.env.HUBSPOT_PORTAL_ID}/${process.env.HUBSPOT_PAYMENT_LINK_ID}?` + 
    new URLSearchParams({
      amount: plan.price.toString(),
      recurring: plan.interval,
      email: data.businessEmail,
      description: `${plan.name} Subscription`,
      metadata: JSON.stringify({
        planId: data.planId,
        businessName: data.businessName,
        tier: plan.tier
      })
    }).toString()

  return {
    url: paymentLinkUrl,
    isCustomQuote: false
  }
}

// Handle webhook from HubSpot for payment events
export async function handlePaymentWebhook(data: any) {
  try {
    const { subscriptionId, contactId, status, planId } = data

    if (status === 'active') {
      // Update contact's subscription status
      await hubspotClient.crm.contacts.basicApi.update(contactId, {
        properties: {
          subscription_status: 'active',
          subscription_id: subscriptionId,
          subscription_plan: planId,
          subscription_start_date: new Date().toISOString()
        }
      })

      // Create or update the subscription in your database
      // This would integrate with your Prisma models
      return {
        success: true,
        message: 'Subscription activated'
      }
    } else if (status === 'cancelled') {
      // Handle cancellation
      await hubspotClient.crm.contacts.basicApi.update(contactId, {
        properties: {
          subscription_status: 'cancelled',
          subscription_end_date: new Date().toISOString()
        }
      })

      return {
        success: true,
        message: 'Subscription cancelled'
      }
    }

    return {
      success: false,
      message: 'Unknown webhook status'
    }
  } catch (error) {
    console.error('Error handling payment webhook:', error)
    throw error
  }
}

// Create custom quote request for enterprise
export async function createEnterpriseQuoteRequest(data: {
  businessName: string
  contactName: string
  email: string
  phone: string
  estimatedRooms: number
  properties: number
  requirements: string
}) {
  try {
    // Create contact
    const contact = await createOrUpdateContact({
      email: data.email,
      firstname: data.contactName.split(' ')[0],
      lastname: data.contactName.split(' ').slice(1).join(' '),
      company: data.businessName,
      phone: data.phone,
      tier: 'enterprise'
    })

    // Create a high-value deal
    const deal = await hubspotClient.crm.deals.basicApi.create({
      properties: {
        dealname: `Enterprise Quote - ${data.businessName}`,
        amount: (data.estimatedRooms * 10).toString(), // Rough estimate
        pipeline: 'default',
        dealstage: 'qualifiedtobuy',
        subscription_type: 'enterprise',
        num_properties: data.properties.toString(),
        num_rooms: data.estimatedRooms.toString(),
        custom_requirements: data.requirements,
        closedate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      }
    })

    // Associate deal with contact
    await hubspotClient.crm.deals.associationsApi.create(
      deal.id,
      'contacts',
      contact.id,
      'deal_to_contact'
    )

    // Create a task for sales team follow-up
    await hubspotClient.crm.tasks.basicApi.create({
      properties: {
        subject: `Follow up on Enterprise Quote - ${data.businessName}`,
        notes: `Properties: ${data.properties}, Rooms: ${data.estimatedRooms}, Requirements: ${data.requirements}`,
        status: 'NOT_STARTED',
        priority: 'HIGH',
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
      }
    })

    return {
      success: true,
      contactId: contact.id,
      dealId: deal.id
    }
  } catch (error) {
    console.error('Error creating enterprise quote request:', error)
    throw error
  }
}

// Get subscription status for a business
export async function getSubscriptionStatus(email: string) {
  try {
    const searchResults = await hubspotClient.crm.contacts.searchApi.doSearch({
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
        'subscription_status',
        'subscription_plan',
        'subscription_start_date',
        'subscription_end_date',
        'subscription_tier'
      ]
    })

    if (searchResults.results.length > 0) {
      const contact = searchResults.results[0]
      return {
        isActive: contact.properties.subscription_status === 'active',
        plan: contact.properties.subscription_plan,
        tier: contact.properties.subscription_tier,
        startDate: contact.properties.subscription_start_date,
        endDate: contact.properties.subscription_end_date
      }
    }

    return {
      isActive: false,
      plan: null,
      tier: null
    }
  } catch (error) {
    console.error('Error getting subscription status:', error)
    throw error
  }
}

// Cancel subscription
export async function cancelSubscription(email: string, reason?: string) {
  try {
    const contact = await hubspotClient.crm.contacts.searchApi.doSearch({
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
      ]
    })

    if (contact.results.length > 0) {
      await hubspotClient.crm.contacts.basicApi.update(contact.results[0].id, {
        properties: {
          subscription_status: 'cancelled',
          subscription_end_date: new Date().toISOString(),
          cancellation_reason: reason || 'Customer requested'
        }
      })

      return {
        success: true,
        message: 'Subscription cancelled successfully'
      }
    }

    throw new Error('Contact not found')
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    throw error
  }
}