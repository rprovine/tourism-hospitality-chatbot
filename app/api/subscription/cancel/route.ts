import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'
import { handleCancellation } from '@/lib/payments/hubspot-sync'

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
    const { immediate = false, reason = '' } = body
    
    // Get business and subscription
    const business = await prisma.business.findUnique({
      where: { id: decoded.businessId },
      include: { subscription: true }
    })
    
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }
    
    // Handle trial accounts (no subscription record)
    if (!business.subscription) {
      // For trial accounts without subscription, mark as cancelled but keep access until trial end
      const trialEndDate = business.trialEndDate || new Date()
      
      await prisma.business.update({
        where: { id: business.id },
        data: {
          subscriptionStatus: 'cancelling'  // Mark as cancelling, not cancelled yet
        }
      })
      
      return NextResponse.json({
        message: 'Trial will end on scheduled date',
        accessUntil: trialEndDate,
        willDowngradeTo: 'starter'
      })
    }
    
    const subscription = business.subscription
    
    // Check if this is a trial subscription
    const isTrial = subscription.status === 'trial'
    
    // Update subscription based on cancellation type
    if (immediate && !isTrial) {
      // Immediate cancellation for paid subscriptions only - revoke access now
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
          accessRevokedAt: new Date(),
          cancelAtPeriodEnd: false,
          cancelReason: reason
        }
      })
      
      // Downgrade to starter tier
      await prisma.business.update({
        where: { id: business.id },
        data: {
          tier: 'starter',
          subscriptionStatus: 'cancelled'
        }
      })
      
      // Sync cancellation to HubSpot
      try {
        await handleCancellation(business.email, business.tier, reason)
      } catch (hubspotError) {
        console.error('HubSpot sync failed:', hubspotError)
      }
      
      return NextResponse.json({
        message: 'Subscription cancelled immediately',
        accessRevokedAt: new Date()
      })
    } else {
      // Cancel at period end - maintain access until end date (default for trials)
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          cancelAtPeriodEnd: true,
          cancelledAt: new Date(),
          status: 'cancelling',
          cancelReason: reason
        }
      })
      
      await prisma.business.update({
        where: { id: business.id },
        data: {
          subscriptionStatus: 'cancelling'
        }
      })
      
      // Sync pending cancellation to HubSpot
      try {
        await handleCancellation(business.email, business.tier, reason)
      } catch (hubspotError) {
        console.error('HubSpot sync failed:', hubspotError)
      }
      
      return NextResponse.json({
        message: isTrial ? 'Trial will end on scheduled date' : 'Subscription will cancel at period end',
        accessUntil: subscription.endDate,
        willDowngradeTo: 'starter'
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