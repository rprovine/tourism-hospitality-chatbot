import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createOrUpdateContact, SUBSCRIPTION_PLANS } from '@/lib/payments/hubspot'
import { getCheckoutUrl } from '@/lib/payments/payment-links'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const checkoutSchema = z.object({
  planId: z.string(), // Accept any plan ID including yearly
  email: z.string().email(),
  businessName: z.string(),
  contactName: z.string().optional(),
  phone: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
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

    // Get checkout URL from payment links configuration
    const checkoutUrl = getCheckoutUrl(
      validatedData.planId,
      validatedData.email,
      validatedData.businessName
    )

    // Note: We'll create the subscription after payment is confirmed via webhook
    // For now, just track the contact in HubSpot

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutUrl,
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