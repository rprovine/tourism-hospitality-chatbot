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
  const { contactEmail, planId, subscriptionId, sessionId, metadata } = data
  
  // First try to find by session ID if provided
  let business: any = null
  let checkoutSession: any = null
  
  if (sessionId || metadata?.session_id) {
    const sid = sessionId || metadata?.session_id
    checkoutSession = await prisma.checkoutSession.findUnique({
      where: { sessionId: sid },
      include: { business: true }
    })
    
    if (checkoutSession) {
      business = checkoutSession.business
      
      // Update checkout session status
      await prisma.checkoutSession.update({
        where: { id: checkoutSession.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          hubspotSubscriptionId: subscriptionId,
          metadata: {
            ...checkoutSession.metadata,
            paymentSuccessData: data
          }
        }
      })
    }
  }
  
  // Fallback to email lookup if no session found
  if (!business) {
    business = await prisma.business.findUnique({
      where: { email: contactEmail }
    })
  }
  
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
  const { contactEmail, planId, subscriptionId, startDate, endDate, sessionId, metadata } = data
  
  // First try to find by session ID
  let business: any = null
  
  if (sessionId || metadata?.session_id) {
    const sid = sessionId || metadata?.session_id
    const checkoutSession = await prisma.checkoutSession.findUnique({
      where: { sessionId: sid },
      include: { business: true }
    })
    
    if (checkoutSession) {
      business = checkoutSession.business
      
      // Update session with subscription ID
      await prisma.checkoutSession.update({
        where: { id: checkoutSession.id },
        data: {
          hubspotSubscriptionId: subscriptionId,
          metadata: {
            ...checkoutSession.metadata,
            subscriptionCreated: true
          }
        }
      })
    }
  }
  
  // Fallback to email lookup
  if (!business) {
    business = await prisma.business.findUnique({
      where: { email: contactEmail }
    })
  }
  
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
  
  // Try to find business by subscription ID first
  let business: any = null
  
  // Check if we have a checkout session with this subscription ID
  const checkoutSession = await prisma.checkoutSession.findFirst({
    where: { hubspotSubscriptionId: subscriptionId },
    include: { business: true }
  })
  
  if (checkoutSession) {
    business = checkoutSession.business
  }
  
  // Try finding by existing subscription
  if (!business) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        metadata: {
          path: ['hubspotSubscriptionId'],
          equals: subscriptionId
        }
      },
      include: { business: true }
    })
    
    if (subscription) {
      business = subscription.business
    }
  }
  
  // Final fallback to email
  if (!business) {
    business = await prisma.business.findUnique({
      where: { email: contactEmail }
    })
  }
  
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