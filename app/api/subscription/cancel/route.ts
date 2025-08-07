import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    const body = await request.json()
    const { immediate = false } = body
    
    // Get business and subscription
    const business = await prisma.business.findUnique({
      where: { id: decoded.businessId },
      include: { subscription: true }
    })
    
    if (!business || !business.subscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }
    
    const subscription = business.subscription
    
    // Update subscription based on cancellation type
    if (immediate) {
      // Immediate cancellation - revoke access now
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
          accessRevokedAt: new Date(),
          cancelAtPeriodEnd: false
        }
      })
      
      // Downgrade to free tier
      await prisma.business.update({
        where: { id: business.id },
        data: {
          tier: 'starter',
          subscriptionStatus: 'cancelled'
        }
      })
      
      return NextResponse.json({
        message: 'Subscription cancelled immediately',
        accessRevokedAt: new Date()
      })
    } else {
      // Cancel at period end - maintain access until end date
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          cancelAtPeriodEnd: true,
          cancelledAt: new Date(),
          status: 'cancelling'
        }
      })
      
      await prisma.business.update({
        where: { id: business.id },
        data: {
          subscriptionStatus: 'cancelling'
        }
      })
      
      return NextResponse.json({
        message: 'Subscription will cancel at period end',
        accessUntil: subscription.endDate
      })
    }
    
  } catch (error: any) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}