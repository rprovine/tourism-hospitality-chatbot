import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createOrUpdateContact, SUBSCRIPTION_PLANS } from '@/lib/payments/hubspot'
import { getCheckoutUrl } from '@/lib/payments/payment-links'
import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

const checkoutSchema = z.object({
  planId: z.string(), // Accept any plan ID including yearly
  email: z.string().email(),
  businessName: z.string(),
  contactName: z.string().optional(),
  phone: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated (for registered users)
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    let businessId: string | undefined = undefined
    let business: any = null
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any
        businessId = decoded.businessId
        business = await prisma.business.findUnique({
          where: { id: businessId }
        })
      } catch (error) {
        console.log('Token verification failed, proceeding as new signup')
      }
    }
    
    const body = await request.json()
    const validatedData = checkoutSchema.parse(body)

    // Check if plan exists
    const plan = SUBSCRIPTION_PLANS[validatedData.planId]
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    // Create or update contact in HubSpot
    const contact = await createOrUpdateContact({
      email: validatedData.email,
      firstname: validatedData.contactName?.split(' ')[0],
      lastname: validatedData.contactName?.split(' ').slice(1).join(' '),
      company: validatedData.businessName,
      phone: validatedData.phone,
      tier: plan.tier
    })

    // Create a unique session ID
    const sessionId = nanoid()
    
    // If no existing business, create one (for new signups)
    if (!business) {
      // Check if email already exists
      const existingBusiness = await prisma.business.findUnique({
        where: { email: validatedData.email }
      })
      
      if (existingBusiness) {
        business = existingBusiness
        businessId = existingBusiness.id
      } else {
        // Create new business for checkout
        business = await prisma.business.create({
          data: {
            email: validatedData.email,
            name: validatedData.businessName,
            password: '', // Will be set during account activation
            type: 'hotel',
            tier: 'starter',
            subscriptionStatus: 'pending'
          }
        })
        businessId = business.id
      }
    }
    
    // Get checkout URL with session ID embedded
    const baseCheckoutUrl = getCheckoutUrl(
      validatedData.planId,
      validatedData.email,
      validatedData.businessName
    )
    
    // Add session ID to the checkout URL
    const checkoutUrl = baseCheckoutUrl.includes('?') 
      ? `${baseCheckoutUrl}&session_id=${sessionId}`
      : `${baseCheckoutUrl}?session_id=${sessionId}`
    
    // Create checkout session record
    await prisma.checkoutSession.create({
      data: {
        businessId: businessId!,
        sessionId,
        planId: validatedData.planId,
        email: validatedData.email,
        businessName: validatedData.businessName,
        contactName: validatedData.contactName,
        phone: validatedData.phone,
        paymentUrl: checkoutUrl,
        status: 'pending',
        metadata: {
          hubspotContactId: contact.id,
          source: token ? 'dashboard' : 'landing',
          timestamp: new Date().toISOString()
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutUrl,
      sessionId: sessionId,
      isCustomQuote: checkoutUrl.includes('contact-sales')
    })
  } catch (error) {
    console.error('Checkout error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}