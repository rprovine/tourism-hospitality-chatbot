import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function checkSubscriptionStatus(businessId: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { subscription: true }
  })
  
  if (!business || !business.subscription) {
    return { hasAccess: false, reason: 'no_subscription' }
  }
  
  const subscription = business.subscription
  const now = new Date()
  
  // Check if access is already revoked
  if (subscription.accessRevokedAt && subscription.accessRevokedAt <= now) {
    return { hasAccess: false, reason: 'access_revoked' }
  }
  
  // Check if subscription is cancelled
  if (subscription.status === 'cancelled') {
    return { hasAccess: false, reason: 'cancelled' }
  }
  
  // Check if in grace period
  if (subscription.paymentFailedAt) {
    const gracePeriodEnds = subscription.gracePeriodEnds || 
      new Date(subscription.paymentFailedAt.getTime() + 5 * 24 * 60 * 60 * 1000) // 5 days
    
    if (now > gracePeriodEnds) {
      // Grace period expired, revoke access
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          accessRevokedAt: now,
          status: 'suspended'
        }
      })
      
      await prisma.business.update({
        where: { id: businessId },
        data: {
          tier: 'starter',
          subscriptionStatus: 'suspended'
        }
      })
      
      return { hasAccess: false, reason: 'grace_period_expired' }
    }
    
    // Still in grace period
    return { 
      hasAccess: true, 
      warning: 'payment_failed',
      gracePeriodEnds 
    }
  }
  
  // Check if subscription expired
  if (subscription.endDate < now && subscription.cancelAtPeriodEnd) {
    // Subscription expired, revoke access
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        accessRevokedAt: now,
        status: 'expired'
      }
    })
    
    await prisma.business.update({
      where: { id: businessId },
      data: {
        tier: 'starter',
        subscriptionStatus: 'expired'
      }
    })
    
    return { hasAccess: false, reason: 'expired' }
  }
  
  // Active subscription
  return { hasAccess: true, status: subscription.status }
}

export async function handlePaymentFailure(businessId: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { subscription: true }
  })
  
  if (!business?.subscription) {
    return
  }
  
  const subscription = business.subscription
  const now = new Date()
  
  // First payment failure - start grace period
  if (!subscription.paymentFailedAt) {
    const gracePeriodEnds = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000) // 5 days
    
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        paymentFailedAt: now,
        gracePeriodEnds,
        lastPaymentAttempt: now,
        paymentAttempts: 1,
        paymentStatus: 'failed',
        status: 'past_due'
      }
    })
    
    await prisma.business.update({
      where: { id: businessId },
      data: {
        subscriptionStatus: 'past_due'
      }
    })
    
    // TODO: Send email notification about payment failure and grace period
    
    return { gracePeriodEnds }
  }
  
  // Subsequent payment failure
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      lastPaymentAttempt: now,
      paymentAttempts: subscription.paymentAttempts + 1
    }
  })
}

export async function handlePaymentSuccess(businessId: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { subscription: true }
  })
  
  if (!business?.subscription) {
    return
  }
  
  // Clear payment failure status
  await prisma.subscription.update({
    where: { id: business.subscription.id },
    data: {
      paymentFailedAt: null,
      gracePeriodEnds: null,
      lastPaymentAttempt: new Date(),
      paymentAttempts: 0,
      paymentStatus: 'succeeded',
      status: 'active'
    }
  })
  
  await prisma.business.update({
    where: { id: businessId },
    data: {
      subscriptionStatus: 'active'
    }
  })
}