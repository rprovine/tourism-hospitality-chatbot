import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createOrUpdateContact, createPaymentLink, SUBSCRIPTION_PLANS } from '@/lib/payments/hubspot'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const checkoutSchema = z.object({
  businessId: z.string(),
  planId: z.enum(['starter_monthly', 'professional_monthly', 'premium_monthly', 'enterprise_monthly']),
  email: z.string().email(),
  businessName: z.string(),
  contactName: z.string().optional(),
  phone: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = checkoutSchema.parse(body)

    // Get business from database
    const business = await prisma.business.findUnique({
      where: { id: validatedData.businessId }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Create or update contact in HubSpot
    const contact = await createOrUpdateContact({
      email: validatedData.email,
      firstname: validatedData.contactName?.split(' ')[0],
      lastname: validatedData.contactName?.split(' ').slice(1).join(' '),
      company: validatedData.businessName,
      phone: validatedData.phone,
      tier: SUBSCRIPTION_PLANS[validatedData.planId].tier
    })

    // Create payment link
    const paymentLink = await createPaymentLink({
      planId: validatedData.planId,
      businessEmail: validatedData.email,
      businessName: validatedData.businessName,
      redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`
    })

    // Store payment intent in database
    await prisma.subscription.create({
      data: {
        businessId: validatedData.businessId,
        tier: SUBSCRIPTION_PLANS[validatedData.planId].tier,
        status: 'pending',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
        paymentMethod: 'hubspot',
        paymentStatus: 'pending',
        metadata: {
          hubspotContactId: contact.id,
          planId: validatedData.planId
        }
      }
    })

    return NextResponse.json({
      success: true,
      checkoutUrl: paymentLink.url,
      isCustomQuote: paymentLink.isCustomQuote
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