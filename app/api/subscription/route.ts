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
      // No subscription, return basic info
      return NextResponse.json({
        tier: business.tier,
        status: 'none',
        billingCycle: null,
        endDate: null
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
      billingCycle: subscription.billingCycle,
      paymentMethod: subscription.paymentMethod,
      paymentStatus: subscription.paymentStatus,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      cancelledAt: subscription.cancelledAt,
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