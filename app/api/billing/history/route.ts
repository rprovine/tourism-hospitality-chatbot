import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    // Get business and subscription info
    const business = await prisma.business.findUnique({
      where: { id: decoded.businessId },
      include: { 
        subscription: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 12 // Last 12 payments
        }
      }
    })
    
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }
    
    // Check if we have real payment data
    let invoices = []
    
    if (business.payments && business.payments.length > 0) {
      // Map real payment data to invoice format
      invoices = business.payments.map(payment => ({
        id: payment.id,
        date: payment.createdAt.toISOString(),
        amount: Number(payment.amount),
        status: payment.status,
        description: payment.description,
        invoiceNumber: payment.invoiceNumber,
        paymentMethod: payment.paymentMethod,
        refundAmount: payment.refundAmount ? Number(payment.refundAmount) : undefined,
        refundDate: payment.refundedAt?.toISOString(),
        refundReason: payment.refundReason,
        dueDate: payment.dueDate?.toISOString(),
        paidAt: payment.paidAt?.toISOString()
      }))
    } else {
      // No payments exist - determine what to do based on account type
      const isDemoAccount = business.email?.endsWith('@demo.com')
      
      if (isDemoAccount) {
        // Only generate sample payments for demo accounts
        await generateSamplePaymentsForDemo(business)
        
        // Fetch the newly created payments
        const updatedBusiness = await prisma.business.findUnique({
          where: { id: decoded.businessId },
          include: {
            payments: {
              orderBy: { createdAt: 'desc' },
              take: 12
            }
          }
        })
        
        if (updatedBusiness?.payments) {
          invoices = updatedBusiness.payments.map(payment => ({
            id: payment.id,
            date: payment.createdAt.toISOString(),
            amount: Number(payment.amount),
            status: payment.status,
            description: payment.description,
            invoiceNumber: payment.invoiceNumber,
            paymentMethod: payment.paymentMethod,
            refundAmount: payment.refundAmount ? Number(payment.refundAmount) : undefined,
            refundDate: payment.refundedAt?.toISOString(),
            refundReason: payment.refundReason,
            dueDate: payment.dueDate?.toISOString(),
            paidAt: payment.paidAt?.toISOString()
          }))
        }
      }
      // For all real accounts (trial, active, cancelled, etc.), invoices array stays empty if no real payments exist
      // Real payments should only be created through actual payment processing (Stripe, HubSpot, etc.)
    }
    
    return NextResponse.json({
      invoices,
      summary: {
        totalSpent: invoices
          .filter(inv => inv.status === 'paid')
          .reduce((sum, inv) => sum + inv.amount, 0),
        totalRefunded: invoices
          .filter(inv => inv.status === 'refunded')
          .reduce((sum, inv) => sum + (inv.refundAmount || 0), 0),
        invoiceCount: invoices.length
      }
    })
    
  } catch (error) {
    console.error('Billing history error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch billing history' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

async function generateSamplePaymentsForDemo(business: any) {
  // Only generate sample data for demo accounts
  if (!business.email?.endsWith('@demo.com')) {
    return
  }
  
  const tierPrices: Record<string, number> = {
    starter: 29,
    professional: 149,
    premium: 299,
    enterprise: 999
  }
  
  const currentPrice = tierPrices[business.tier] || 29
  const today = new Date()
  
  // Generate last 6 months of payment history for demo
  const payments = []
  
  for (let i = 5; i >= 0; i--) {
    const billingDate = new Date(today)
    billingDate.setMonth(today.getMonth() - i)
    billingDate.setDate(1) // First of the month
    
    const billingEndDate = new Date(billingDate)
    billingEndDate.setMonth(billingEndDate.getMonth() + 1)
    billingEndDate.setDate(0) // Last day of the month
    
    const paymentData = {
      businessId: business.id,
      amount: currentPrice,
      currency: 'USD',
      status: i === 0 ? 'pending' : 'paid',
      description: `${business.tier.charAt(0).toUpperCase() + business.tier.slice(1)} Plan - Monthly`,
      invoiceNumber: `DEMO-${billingDate.getFullYear()}-${String(billingDate.getMonth() + 1).padStart(2, '0')}-${String(business.id.slice(-4)).toUpperCase()}`,
      paymentMethod: 'Demo Card •••• 1234',
      billingPeriodStart: billingDate,
      billingPeriodEnd: billingEndDate,
      dueDate: new Date(billingDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      paidAt: i === 0 ? null : new Date(billingDate.getTime() + 2 * 24 * 60 * 60 * 1000),
      createdAt: billingDate
    }
    
    // Add some variety - show an upgrade from starter plan
    if (i === 4 && business.tier !== 'starter') {
      paymentData.amount = 29
      paymentData.description = 'Starter Plan - Monthly (Upgraded)'
    }
    
    payments.push(paymentData)
  }
  
  // Create all payments in the database
  for (const payment of payments) {
    try {
      await prisma.payment.create({
        data: payment
      })
    } catch (error) {
      console.error('Error creating demo payment:', error)
    }
  }
}