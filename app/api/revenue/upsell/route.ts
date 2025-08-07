import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { UpsellingEngine } from '@/lib/revenue/upselling-engine'
import { getOpenAIService } from '@/lib/ai/openai-service'

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
    const { action, context, offerId, customerId } = body
    
    // Initialize services
    prisma = new PrismaClient()
    const openAI = getOpenAIService()
    const upsellingEngine = new UpsellingEngine(prisma, openAI)
    
    switch (action) {
      case 'generate':
        // Generate upsell offers
        const offers = await upsellingEngine.generateUpsellOffers(
          context || {},
          body.maxOffers || 3
        )
        
        // Generate personalized messages for each offer
        const offersWithMessages = await Promise.all(
          offers.map(async (offer) => ({
            ...offer,
            message: await upsellingEngine.generateUpsellMessage(offer, context || {})
          }))
        )
        
        return NextResponse.json({ offers: offersWithMessages })
      
      case 'track':
        // Track offer interaction
        if (!offerId || !customerId || !body.interaction) {
          return NextResponse.json(
            { error: 'offerId, customerId, and interaction required' },
            { status: 400 }
          )
        }
        
        await upsellingEngine.trackOfferInteraction(
          offerId,
          customerId,
          body.interaction,
          body.revenue
        )
        
        return NextResponse.json({ success: true })
      
      case 'crosssell':
        // Get cross-sell recommendations
        if (!body.purchasedItem) {
          return NextResponse.json(
            { error: 'purchasedItem required' },
            { status: 400 }
          )
        }
        
        const crossSells = await upsellingEngine.getCrossSellRecommendations(
          body.purchasedItem,
          context || {}
        )
        
        return NextResponse.json({ recommendations: crossSells })
      
      case 'bundle':
        // Generate bundle recommendations
        if (!body.items || !Array.isArray(body.items)) {
          return NextResponse.json(
            { error: 'items array required' },
            { status: 400 }
          )
        }
        
        const bundles = await upsellingEngine.generateBundleRecommendations(
          body.items,
          context || {}
        )
        
        return NextResponse.json(bundles)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: generate, track, crosssell, or bundle' },
          { status: 400 }
        )
    }
    
  } catch (error: any) {
    console.error('Upselling error:', error)
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    return NextResponse.json(
      { error: 'Upselling operation failed', details: error.message },
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
    const type = searchParams.get('type')
    
    prisma = new PrismaClient()
    const openAI = getOpenAIService()
    const upsellingEngine = new UpsellingEngine(prisma, openAI)
    
    if (type === 'metrics') {
      // Get upselling metrics
      const period = searchParams.get('period') as any || 'month'
      const metrics = await upsellingEngine.getUpsellMetrics(businessId, period)
      return NextResponse.json(metrics)
      
    } else {
      // Return upselling capabilities
      return NextResponse.json({
        capabilities: {
          personalizedOffers: true,
          aiGeneratedMessages: openAI.isConfigured(),
          crossSelling: true,
          bundleRecommendations: true,
          dynamicIncentives: true,
          performanceTracking: true
        },
        offerTypes: [
          'Room upgrades',
          'Extended stays',
          'Experience packages',
          'Dining packages',
          'Spa and wellness',
          'Adventure activities',
          'Transportation',
          'Romance packages'
        ],
        strategies: [
          'Segment-based targeting',
          'Behavior-driven offers',
          'Time-sensitive incentives',
          'Bundle optimization',
          'Cross-sell recommendations'
        ]
      })
    }
    
  } catch (error: any) {
    console.error('Upselling query error:', error)
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch upselling data', details: error.message },
      { status: 500 }
    )
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}