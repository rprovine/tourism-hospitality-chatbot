import { NextRequest, NextResponse } from 'next/server'
import { getSubscriptionStatus, cancelSubscription } from '@/lib/payments/hubspot'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth/jwt'

const prisma = new PrismaClient()

// GET subscription status
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Get business
    const business = await prisma.business.findUnique({
      where: { id: payload.businessId },
      include: {
        subscriptions: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Get status from HubSpot
    const hubspotStatus = await getSubscriptionStatus(business.email)

    // Sync with local database if needed
    if (hubspotStatus.isActive && business.subscriptions.length === 0) {
      // Create subscription record if HubSpot shows active but we don't have it
      await prisma.subscription.create({
        data: {
          businessId: business.id,
          tier: hubspotStatus.tier || 'starter',
          status: 'active',
          startDate: new Date(hubspotStatus.startDate || Date.now()),
          endDate: hubspotStatus.endDate ? new Date(hubspotStatus.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          paymentMethod: 'hubspot',
          paymentStatus: 'paid'
        }
      })
    }

    return NextResponse.json({
      isActive: hubspotStatus.isActive,
      plan: hubspotStatus.plan,
      tier: hubspotStatus.tier,
      startDate: hubspotStatus.startDate,
      endDate: hubspotStatus.endDate,
      subscription: business.subscriptions[0] || null
    })
  } catch (error) {
    console.error('Error getting subscription status:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    )
  }
}

// DELETE - Cancel subscription
export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { reason } = await request.json()

    // Get business
    const business = await prisma.business.findUnique({
      where: { id: payload.businessId }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Cancel in HubSpot
    const result = await cancelSubscription(business.email, reason)

    // Update local database
    await prisma.subscription.updateMany({
      where: {
        businessId: business.id,
        status: 'active'
      },
      data: {
        status: 'cancelled',
        endDate: new Date(),
        metadata: {
          cancellationReason: reason,
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

    return NextResponse.json({
      success: true,
      message: result.message
    })
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}