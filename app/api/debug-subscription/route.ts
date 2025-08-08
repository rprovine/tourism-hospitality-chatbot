import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Find the trial account
    const business = await prisma.business.findFirst({
      where: { email: 'shaypro2000@gmail.com' },
      include: { subscription: true }
    })
    
    if (!business) {
      return NextResponse.json({ error: 'Business not found' })
    }

    return NextResponse.json({
      business: {
        id: business.id,
        email: business.email,
        tier: business.tier,
        createdAt: business.createdAt
      },
      subscription: business.subscription ? {
        id: business.subscription.id,
        status: business.subscription.status,
        tier: business.subscription.tier,
        billingCycle: business.subscription.billingCycle,
        paymentStatus: business.subscription.paymentStatus,
        startDate: business.subscription.startDate,
        endDate: business.subscription.endDate,
        cancelAtPeriodEnd: business.subscription.cancelAtPeriodEnd,
        createdAt: business.subscription.createdAt
      } : null,
      debugInfo: {
        hasSubscription: !!business.subscription,
        subscriptionStatus: business.subscription?.status || 'none',
        businessTier: business.tier
      }
    })
  } catch (error) {
    console.error('Debug subscription error:', error)
    return NextResponse.json({ error: 'Failed to debug subscription', details: error })
  } finally {
    await prisma.$disconnect()
  }
}