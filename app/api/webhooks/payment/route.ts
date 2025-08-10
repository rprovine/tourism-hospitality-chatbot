import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Schema for incoming payment webhook data
const paymentWebhookSchema = z.object({
  businessId: z.string().optional(),
  businessEmail: z.string().optional(),
  amount: z.number(),
  currency: z.string().default('USD'),
  status: z.enum(['paid', 'pending', 'failed', 'refunded']),
  description: z.string(),
  invoiceNumber: z.string(),
  paymentMethod: z.string().optional(),
  stripeInvoiceId: z.string().optional(),
  hubspotInvoiceId: z.string().optional(),
  billingPeriodStart: z.string(),
  billingPeriodEnd: z.string(),
  paidAt: z.string().optional(),
  failedAt: z.string().optional(),
  refundedAt: z.string().optional(),
  refundAmount: z.number().optional(),
  refundReason: z.string().optional(),
  metadata: z.any().optional()
})

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature if needed (e.g., Stripe webhook signature)
    // const signature = request.headers.get('stripe-signature')
    // ... verify signature ...
    
    const body = await request.json()
    const validatedData = paymentWebhookSchema.parse(body)
    
    // Find the business
    let business
    if (validatedData.businessId) {
      business = await prisma.business.findUnique({
        where: { id: validatedData.businessId },
        include: { subscription: true }
      })
    } else if (validatedData.businessEmail) {
      business = await prisma.business.findUnique({
        where: { email: validatedData.businessEmail },
        include: { subscription: true }
      })
    }
    
    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }
    
    // Check if payment already exists (prevent duplicates)
    const existingPayment = await prisma.payment.findUnique({
      where: { invoiceNumber: validatedData.invoiceNumber }
    })
    
    if (existingPayment) {
      // Update existing payment
      const updatedPayment = await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: validatedData.status,
          paidAt: validatedData.paidAt ? new Date(validatedData.paidAt) : undefined,
          failedAt: validatedData.failedAt ? new Date(validatedData.failedAt) : undefined,
          refundedAt: validatedData.refundedAt ? new Date(validatedData.refundedAt) : undefined,
          refundAmount: validatedData.refundAmount,
          refundReason: validatedData.refundReason,
          metadata: validatedData.metadata
        }
      })
      
      return NextResponse.json({
        message: 'Payment updated',
        payment: updatedPayment
      })
    }
    
    // Create new payment record
    const payment = await prisma.payment.create({
      data: {
        businessId: business.id,
        amount: validatedData.amount,
        currency: validatedData.currency,
        status: validatedData.status,
        description: validatedData.description,
        invoiceNumber: validatedData.invoiceNumber,
        paymentMethod: validatedData.paymentMethod,
        stripeInvoiceId: validatedData.stripeInvoiceId,
        hubspotInvoiceId: validatedData.hubspotInvoiceId,
        billingPeriodStart: new Date(validatedData.billingPeriodStart),
        billingPeriodEnd: new Date(validatedData.billingPeriodEnd),
        dueDate: new Date(validatedData.billingPeriodStart), // Due on start of billing period
        paidAt: validatedData.paidAt ? new Date(validatedData.paidAt) : null,
        failedAt: validatedData.failedAt ? new Date(validatedData.failedAt) : null,
        refundedAt: validatedData.refundedAt ? new Date(validatedData.refundedAt) : null,
        refundAmount: validatedData.refundAmount,
        refundReason: validatedData.refundReason,
        metadata: validatedData.metadata
      }
    })
    
    // Update subscription status if payment is successful
    if (validatedData.status === 'paid' && business.subscription) {
      await prisma.subscription.update({
        where: { businessId: business.id },
        data: {
          status: 'active',
          paymentStatus: 'paid',
          paymentFailedAt: null,
          paymentAttempts: 0
        }
      })
      
      // Update business subscription status
      await prisma.business.update({
        where: { id: business.id },
        data: {
          subscriptionStatus: 'active'
        }
      })
    }
    
    // Handle failed payments
    if (validatedData.status === 'failed' && business.subscription) {
      await prisma.subscription.update({
        where: { businessId: business.id },
        data: {
          paymentStatus: 'failed',
          paymentFailedAt: new Date(),
          paymentAttempts: { increment: 1 },
          lastPaymentAttempt: new Date()
        }
      })
    }
    
    return NextResponse.json({
      message: 'Payment recorded successfully',
      payment: {
        id: payment.id,
        invoiceNumber: payment.invoiceNumber,
        amount: payment.amount,
        status: payment.status
      }
    })
    
  } catch (error) {
    console.error('Payment webhook error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid payment data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to process payment webhook' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}