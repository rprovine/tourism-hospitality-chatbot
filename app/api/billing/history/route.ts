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
        subscription: true
      }
    })
    
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }
    
    // For now, return mock data
    // In production, this would fetch from your payment processor (Stripe, HubSpot, etc.)
    const mockInvoices = generateMockInvoices(business)
    
    return NextResponse.json({
      invoices: mockInvoices,
      summary: {
        totalSpent: mockInvoices
          .filter(inv => inv.status === 'paid')
          .reduce((sum, inv) => sum + inv.amount, 0),
        totalRefunded: mockInvoices
          .filter(inv => inv.status === 'refunded')
          .reduce((sum, inv) => sum + (inv.refundAmount || 0), 0),
        invoiceCount: mockInvoices.length
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

function generateMockInvoices(business: any) {
  const invoices: any[] = []
  const today = new Date()
  const tierPrices: Record<string, number> = {
    starter: 29,
    professional: 149,
    premium: 299,
    enterprise: 999
  }
  
  const currentPrice = tierPrices[business.tier] || 29
  const interval = business.subscription?.interval || 'monthly'
  
  // Generate last 6 months of invoices
  for (let i = 0; i < 6; i++) {
    const invoiceDate = new Date(today)
    invoiceDate.setMonth(today.getMonth() - i)
    
    const invoice: any = {
      id: `inv_${Date.now()}_${i}`,
      date: invoiceDate.toISOString(),
      amount: currentPrice,
      status: i === 0 ? 'pending' : 'paid',
      description: `${business.tier.charAt(0).toUpperCase() + business.tier.slice(1)} Plan - ${interval.charAt(0).toUpperCase() + interval.slice(1)}`,
      invoiceNumber: `INV-${invoiceDate.getFullYear()}-${String(invoiceDate.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
      paymentMethod: 'Visa •••• 4242',
      dueDate: new Date(invoiceDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }
    
    // Add some variety to the data
    if (i === 4 && business.tier !== 'starter') {
      // Show an upgrade from starter
      invoice.amount = 29
      invoice.description = 'Starter Plan - Monthly'
    }
    
    if (i === 5 && Math.random() > 0.7) {
      // Sometimes show a refund
      invoice.status = 'refunded'
      invoice.refundAmount = invoice.amount
      invoice.refundDate = new Date(invoiceDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString()
      invoice.refundReason = 'Customer request'
    }
    
    invoices.push(invoice)
  }
  
  return invoices
}