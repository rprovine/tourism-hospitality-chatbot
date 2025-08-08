import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    const business = await prisma.business.findUnique({
      where: { id: decoded.businessId },
      include: { subscription: true }
    })
    
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }
    
    const subscription = business.subscription
    
    if (!subscription) {
      // No subscription record - treat as trial account if it has a tier
      const isTrialAccount = business.tier && business.tier !== 'none'
      return NextResponse.json({
        tier: business.tier,
        status: isTrialAccount ? 'trial' : 'none',
        startDate: business.createdAt?.toISOString() || null,
        endDate: null,
        cancelAtPeriodEnd: false,
        paymentMethod: null,
        nextBillingDate: null,
        amount: 0,
        interval: 'monthly'
      })
    }
    
    // Check for payment issues
    let warning = null
    let gracePeriodEnds = null
    
    if (subscription.paymentFailedAt) {
      gracePeriodEnds = subscription.gracePeriodEnds || 
        new Date(subscription.paymentFailedAt.getTime() + 5 * 24 * 60 * 60 * 1000)
      
      if (new Date() < gracePeriodEnds) {
        warning = 'payment_failed'
      }
    }
    
    return NextResponse.json({
      tier: business.tier,
      status: subscription.status,
      interval: subscription.billingCycle || 'monthly',
      paymentMethod: subscription.paymentMethod,
      paymentStatus: subscription.paymentStatus,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      nextBillingDate: subscription.endDate, // Use endDate as nextBillingDate for simplicity
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      cancelledAt: subscription.cancelledAt,
      amount: 0,
      warning,
      gracePeriodEnds
    })
    
  } catch (error: any) {
    console.error('Get subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}