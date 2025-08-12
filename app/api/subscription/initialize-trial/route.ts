import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'
import { sendWelcomeEmail } from '@/lib/email/sendgrid'

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
    const { tier = 'starter' } = body
    
    // Get business
    const business = await prisma.business.findUnique({
      where: { id: decoded.businessId },
      include: { subscription: true }
    })
    
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }
    
    // Check if subscription already exists
    if (business.subscription) {
      return NextResponse.json(
        { error: 'Subscription already exists' },
        { status: 400 }
      )
    }
    
    // Create trial subscription
    const trialStartDate = new Date()
    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + 14) // 14-day trial
    
    const subscription = await prisma.subscription.create({
      data: {
        businessId: business.id,
        tier: tier,
        status: 'trial',
        billingCycle: 'monthly',
        startDate: trialStartDate,
        endDate: trialEndDate,
        paymentMethod: 'pending',
        paymentStatus: 'trial',
        metadata: {
          trialStartDate: trialStartDate.toISOString(),
          trialEndDate: trialEndDate.toISOString(),
          originalTier: tier
        }
      }
    })
    
    // Update business with trial info
    await prisma.business.update({
      where: { id: business.id },
      data: {
        tier: tier,
        subscriptionStatus: 'trial',
        subscriptionTier: tier,
        trialStartDate: trialStartDate,
        trialEndDate: trialEndDate
      }
    })
    
    // Send welcome email
    try {
      await sendWelcomeEmail(business.email, business.name, tier)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
    }
    
    return NextResponse.json({
      message: 'Trial started successfully',
      subscription: {
        tier: tier,
        status: 'trial',
        startDate: trialStartDate,
        endDate: trialEndDate,
        daysRemaining: 14
      }
    })
    
  } catch (error: any) {
    console.error('Initialize trial error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize trial' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}