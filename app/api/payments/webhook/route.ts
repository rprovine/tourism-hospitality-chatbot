import { NextRequest, NextResponse } from 'next/server'
import { handlePaymentWebhook } from '@/lib/payments/hubspot'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// Verify HubSpot webhook signature
function verifyHubSpotSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')
  
  return hash === signature
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-hubspot-signature')
    
    // Verify webhook signature if secret is configured
    if (process.env.HUBSPOT_WEBHOOK_SECRET && signature) {
      const isValid = verifyHubSpotSignature(
        body,
        signature,
        process.env.HUBSPOT_WEBHOOK_SECRET
      )
      
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    const data = JSON.parse(body)
    
    // Handle different webhook events
    switch (data.eventType) {
      case 'payment.succeeded':
        await handlePaymentSuccess(data)
        break
      
      case 'payment.failed':
        await handlePaymentFailed(data)
        break
      
      case 'subscription.created':
        await handleSubscriptionCreated(data)
        break
      
      case 'subscription.updated':
        await handleSubscriptionUpdated(data)
        break
      
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(data)
        break
      
      default:
        console.log('Unhandled webhook event:', data.eventType)
    }

    // Process webhook through HubSpot handler
    const result = await handlePaymentWebhook(data)

    return NextResponse.json({
      success: true,
      message: result.message
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentSuccess(data: any) {
  const { contactEmail, planId, subscriptionId } = data
  
  // Find business by email
  const business = await prisma.business.findUnique({
    where: { email: contactEmail }
  })
  
  if (business) {
    // Update subscription status
    await prisma.subscription.updateMany({
      where: {
        businessId: business.id,
        status: 'pending'
      },
      data: {
        status: 'active',
        paymentStatus: 'paid',
        metadata: {
          hubspotSubscriptionId: subscriptionId,
          lastPaymentDate: new Date().toISOString()
        }
      }
    })
    
    // Update business tier
    const tierMap: Record<string, string> = {
      'starter_monthly': 'starter',
      'professional_monthly': 'professional',
      'premium_monthly': 'premium',
      'enterprise_monthly': 'enterprise'
    }
    
    await prisma.business.update({
      where: { id: business.id },
      data: {
        tier: tierMap[planId] as any,
        subscriptionStatus: 'active'
      }
    })
  }
}

async function handlePaymentFailed(data: any) {
  const { contactEmail, reason } = data
  
  const business = await prisma.business.findUnique({
    where: { email: contactEmail }
  })
  
  if (business) {
    await prisma.subscription.updateMany({
      where: {
        businessId: business.id,
        status: 'pending'
      },
      data: {
        paymentStatus: 'failed',
        metadata: {
          failureReason: reason,
          failedAt: new Date().toISOString()
        }
      }
    })
  }
}

async function handleSubscriptionCreated(data: any) {
  const { contactEmail, planId, subscriptionId, startDate, endDate } = data
  
  const business = await prisma.business.findUnique({
    where: { email: contactEmail }
  })
  
  if (business) {
    await prisma.subscription.create({
      data: {
        businessId: business.id,
        tier: planId.replace('_monthly', ''),
        status: 'active',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        paymentMethod: 'hubspot',
        paymentStatus: 'paid',
        metadata: {
          hubspotSubscriptionId: subscriptionId
        }
      }
    })
  }
}

async function handleSubscriptionUpdated(data: any) {
  const { subscriptionId, newPlanId, contactEmail } = data
  
  const business = await prisma.business.findUnique({
    where: { email: contactEmail }
  })
  
  if (business) {
    await prisma.subscription.updateMany({
      where: {
        businessId: business.id,
        metadata: {
          path: ['hubspotSubscriptionId'],
          equals: subscriptionId
        }
      },
      data: {
        tier: newPlanId.replace('_monthly', ''),
        metadata: {
          updatedAt: new Date().toISOString(),
          planId: newPlanId
        }
      }
    })
    
    await prisma.business.update({
      where: { id: business.id },
      data: {
        tier: newPlanId.replace('_monthly', '') as any
      }
    })
  }
}

async function handleSubscriptionCancelled(data: any) {
  const { subscriptionId, contactEmail, cancellationDate } = data
  
  const business = await prisma.business.findUnique({
    where: { email: contactEmail }
  })
  
  if (business) {
    await prisma.subscription.updateMany({
      where: {
        businessId: business.id,
        metadata: {
          path: ['hubspotSubscriptionId'],
          equals: subscriptionId
        }
      },
      data: {
        status: 'cancelled',
        endDate: new Date(cancellationDate),
        metadata: {
          cancelledAt: new Date().toISOString()
        }
      }
    })
    
    await prisma.business.update({
      where: { id: business.id },
      data: {
        subscriptionStatus: 'cancelled'
      }
    })
  }
}