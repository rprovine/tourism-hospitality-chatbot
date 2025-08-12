import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'
import { sendPaymentSuccessEmail } from '@/lib/email/sendgrid'
import { syncContactToHubSpot } from '@/lib/payments/hubspot-sync'

const prisma = new PrismaClient()

// Pricing tiers (monthly)
const PRICING = {
  starter: 299,
  professional: 699,
  premium: 2499,
  enterprise: 9999
}

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
    const { 
      newTier,
      billingCycle = 'monthly',
      paymentMethodId // Stripe payment method ID or similar
    } = body
    
    // Validate tier
    if (!['starter', 'professional', 'premium', 'enterprise'].includes(newTier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }
    
    // Get business
    const business = await prisma.business.findUnique({
      where: { id: decoded.businessId },
      include: { subscription: true }
    })
    
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }
    
    const currentTier = business.tier
    const isUpgrade = PRICING[newTier as keyof typeof PRICING] > PRICING[currentTier as keyof typeof PRICING]
    
    // Calculate dates
    const startDate = new Date()
    const endDate = new Date()
    
    if (billingCycle === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
    }
    
    // Update or create subscription
    if (business.subscription) {
      // Update existing subscription
      await prisma.subscription.update({
        where: { id: business.subscription.id },
        data: {
          tier: newTier,
          status: 'active',
          billingCycle: billingCycle,
          startDate: startDate,
          endDate: endDate,
          paymentMethod: paymentMethodId || 'hubspot',
          paymentStatus: 'active',
          cancelAtPeriodEnd: false,
          cancelledAt: null,
          paymentFailedAt: null,
          metadata: {
            ...((business.subscription.metadata as any) || {}),
            previousTier: currentTier,
            upgradedAt: new Date().toISOString(),
            isUpgrade: isUpgrade
          }
        }
      })
    } else {
      // Create new subscription (converting from trial or no subscription)
      await prisma.subscription.create({
        data: {
          businessId: business.id,
          tier: newTier,
          status: 'active',
          billingCycle: billingCycle,
          startDate: startDate,
          endDate: endDate,
          paymentMethod: paymentMethodId || 'hubspot',
          paymentStatus: 'active',
          metadata: {
            previousTier: currentTier,
            upgradedAt: new Date().toISOString(),
            isUpgrade: isUpgrade,
            convertedFromTrial: business.subscriptionStatus === 'trial'
          }
        }
      })
    }
    
    // Update business tier and status
    await prisma.business.update({
      where: { id: business.id },
      data: {
        tier: newTier,
        subscriptionStatus: 'active',
        subscriptionTier: newTier,
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate
      }
    })
    
    // Create payment record
    const amount = PRICING[newTier as keyof typeof PRICING]
    const finalAmount = billingCycle === 'annual' ? amount * 10 : amount // 2 months free on annual
    
    await prisma.payment.create({
      data: {
        businessId: business.id,
        amount: finalAmount,
        currency: 'USD',
        status: 'paid',
        description: `${newTier} Plan - ${billingCycle} billing`,
        invoiceNumber: `INV-${Date.now()}`,
        paymentMethod: paymentMethodId ? 'Card' : 'HubSpot',
        billingPeriodStart: startDate,
        billingPeriodEnd: endDate,
        paidAt: new Date()
      }
    })
    
    // Sync to HubSpot
    try {
      await syncContactToHubSpot({
        email: business.email,
        company: business.name,
        tier: newTier,
        status: 'active',
        action: isUpgrade ? 'upgrade' : 'downgrade'
      })
    } catch (hubspotError) {
      console.error('HubSpot sync failed:', hubspotError)
    }
    
    // Send confirmation email
    try {
      await sendPaymentSuccessEmail(
        business.email,
        business.name,
        newTier,
        `$${finalAmount}`
      )
    } catch (emailError) {
      console.error('Failed to send payment email:', emailError)
    }
    
    return NextResponse.json({
      message: isUpgrade ? 'Subscription upgraded successfully' : 'Subscription changed successfully',
      subscription: {
        tier: newTier,
        status: 'active',
        billingCycle: billingCycle,
        startDate: startDate,
        endDate: endDate,
        amount: finalAmount
      }
    })
    
  } catch (error: any) {
    console.error('Upgrade subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}