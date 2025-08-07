import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { DynamicPricingEngine } from '@/lib/revenue/dynamic-pricing'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  let prisma: PrismaClient | null = null
  
  try {
    // Verify JWT token
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const businessId = decoded.businessId
    
    const body = await request.json()
    const {
      productId,
      productType,
      checkInDate,
      checkOutDate,
      guestCount,
      isRepeatCustomer,
      customerSegment,
      promoCode
    } = body
    
    if (!productId || !productType) {
      return NextResponse.json(
        { error: 'productId and productType required' },
        { status: 400 }
      )
    }
    
    // Initialize Prisma and pricing engine
    prisma = new PrismaClient()
    const pricingEngine = new DynamicPricingEngine(prisma)
    
    // Calculate dynamic price
    const dynamicPrice = await pricingEngine.calculateDynamicPrice(
      productId,
      productType as any,
      new Date(),
      {
        checkInDate: checkInDate ? new Date(checkInDate) : undefined,
        checkOutDate: checkOutDate ? new Date(checkOutDate) : undefined,
        guestCount,
        isRepeatCustomer,
        customerSegment,
        promoCode
      }
    )
    
    return NextResponse.json(dynamicPrice)
    
  } catch (error: any) {
    console.error('Dynamic pricing error:', error)
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    return NextResponse.json(
      { error: 'Failed to calculate pricing', details: error.message },
      { status: 500 }
    )
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}

export async function GET(request: NextRequest) {
  let prisma: PrismaClient | null = null
  
  try {
    // Verify JWT token
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const businessId = decoded.businessId
    
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    prisma = new PrismaClient()
    const pricingEngine = new DynamicPricingEngine(prisma)
    
    if (action === 'recommendations') {
      // Get pricing recommendations
      const recommendations = await pricingEngine.getPricingRecommendations(businessId)
      return NextResponse.json(recommendations)
      
    } else if (action === 'metrics') {
      // Get revenue metrics
      const period = searchParams.get('period') as any || 'month'
      const metrics = await pricingEngine.calculateRevenueMetrics(businessId, period)
      return NextResponse.json(metrics)
      
    } else if (action === 'competitors') {
      // Get competitor pricing
      const productType = searchParams.get('productType') || 'room'
      const date = searchParams.get('date') 
        ? new Date(searchParams.get('date')!) 
        : new Date()
      const competitors = await pricingEngine.getCompetitorPricing(productType, date)
      return NextResponse.json({ competitors })
      
    } else {
      // Return pricing capabilities
      return NextResponse.json({
        capabilities: {
          dynamicPricing: true,
          demandForecasting: true,
          seasonalAdjustments: true,
          competitorMonitoring: true,
          eventBasedPricing: true,
          lastMinuteDeals: true,
          advanceBookingDiscounts: true,
          loyaltyPricing: true,
          groupDiscounts: true
        },
        factors: [
          'Base price',
          'Demand multiplier',
          'Seasonal adjustments',
          'Local events',
          'Competitor pricing',
          'Booking timing',
          'Customer loyalty',
          'Group size'
        ]
      })
    }
    
  } catch (error: any) {
    console.error('Pricing query error:', error)
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch pricing data', details: error.message },
      { status: 500 }
    )
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}