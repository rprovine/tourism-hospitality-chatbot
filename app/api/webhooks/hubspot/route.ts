import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// Verify HubSpot webhook signature
function verifyHubSpotSignature(request: NextRequest, body: string): boolean {
  const signature = request.headers.get('x-hubspot-signature')
  if (!signature || !process.env.HUBSPOT_WEBHOOK_SECRET) {
    return false
  }
  
  const hash = crypto
    .createHmac('sha256', process.env.HUBSPOT_WEBHOOK_SECRET)
    .update(body)
    .digest('hex')
  
  return signature === hash
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const data = JSON.parse(body)
    
    // Optionally verify signature (requires webhook secret setup in HubSpot)
    // if (!verifyHubSpotSignature(request, body)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }
    
    // Handle different webhook events
    const eventType = data.eventType || data[0]?.subscriptionType
    
    switch (eventType) {
      case 'payment.succeeded':
      case 'deal.propertyChange':
        // Handle payment success or deal updates
        await handlePaymentSuccess(data)
        break
        
      case 'subscription.create':
        // Handle new subscription with trial
        await handleSubscriptionCreate(data)
        break
        
      case 'subscription.update':
        // Handle subscription status changes (trial to active, etc)
        await handleSubscriptionUpdate(data)
        break
        
      case 'subscription.cancel':
        // Handle cancellation
        await handleSubscriptionCancel(data)
        break
        
      default:
        console.log('Unhandled webhook event:', eventType, data)
    }
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentSuccess(data: any) {
  const email = data.properties?.email || data.email
  const tier = data.properties?.tier || data.tier
  const dealId = data.objectId || data.dealId
  
  if (!email) return
  
  // Update business subscription status
  await prisma.business.updateMany({
    where: { email },
    data: {
      subscriptionStatus: 'active',
      subscriptionTier: tier,
      subscriptionStartDate: new Date(),
      hubspotDealId: dealId
    }
  })
}

async function handleSubscriptionCreate(data: any) {
  const email = data.properties?.email || data.email
  const tier = data.properties?.tier || data.tier
  const trialEndDate = data.properties?.trial_end_date || data.trialEndDate
  
  if (!email) return
  
  // Create or update business with trial status
  await prisma.business.upsert({
    where: { email },
    update: {
      subscriptionStatus: 'trialing',
      subscriptionTier: tier,
      trialStartDate: new Date(),
      trialEndDate: trialEndDate ? new Date(trialEndDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    },
    create: {
      email,
      name: data.properties?.company || data.properties?.firstname || 'Guest Business',
      password: '', // Will be set when user activates account
      type: 'hotel', // Default type
      tier: tier || 'starter',
      subscriptionStatus: 'trialing',
      subscriptionTier: tier,
      trialStartDate: new Date(),
      trialEndDate: trialEndDate ? new Date(trialEndDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    }
  })
}

async function handleSubscriptionUpdate(data: any) {
  const email = data.properties?.email || data.email
  const status = data.properties?.status || data.status
  
  if (!email) return
  
  const statusMap: Record<string, string> = {
    'active': 'active',
    'past_due': 'past_due',
    'canceled': 'canceled',
    'trialing': 'trialing',
    'paused': 'paused'
  }
  
  await prisma.business.updateMany({
    where: { email },
    data: {
      subscriptionStatus: statusMap[status] || status,
      updatedAt: new Date()
    }
  })
}

async function handleSubscriptionCancel(data: any) {
  const email = data.properties?.email || data.email
  
  if (!email) return
  
  await prisma.business.updateMany({
    where: { email },
    data: {
      subscriptionStatus: 'canceled',
      subscriptionEndDate: new Date()
    }
  })
}