import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { AbandonmentRecoveryEngine } from '@/lib/revenue/abandonment-recovery'
import { UnifiedMessagingService } from '@/lib/channels/unified-messaging'
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
    const { action, conversationId, strategyId, revenue } = body
    
    // Initialize services
    prisma = new PrismaClient()
    const messaging = new UnifiedMessagingService(prisma)
    const openAI = getOpenAIService()
    const recoveryEngine = new AbandonmentRecoveryEngine(prisma, messaging, openAI)
    
    switch (action) {
      case 'detect':
        // Detect abandonment
        if (!conversationId) {
          return NextResponse.json(
            { error: 'conversationId required' },
            { status: 400 }
          )
        }
        
        const abandonmentContext = await recoveryEngine.detectAbandonment(conversationId)
        
        if (abandonmentContext) {
          // Generate recovery strategies
          const strategies = await recoveryEngine.generateRecoveryStrategy(abandonmentContext)
          
          return NextResponse.json({
            abandoned: true,
            context: abandonmentContext,
            strategies
          })
        } else {
          return NextResponse.json({ abandoned: false })
        }
      
      case 'execute':
        // Execute recovery strategy
        if (!body.strategy || !body.recipientId) {
          return NextResponse.json(
            { error: 'strategy and recipientId required' },
            { status: 400 }
          )
        }
        
        const success = await recoveryEngine.executeRecovery(
          body.strategy,
          body.recipientId
        )
        
        return NextResponse.json({ success })
      
      case 'track_success':
        // Track recovery success
        if (!conversationId || !strategyId) {
          return NextResponse.json(
            { error: 'conversationId and strategyId required' },
            { status: 400 }
          )
        }
        
        await recoveryEngine.trackRecoverySuccess(
          conversationId,
          strategyId,
          revenue
        )
        
        return NextResponse.json({ success: true })
      
      case 'automate':
        // Run automated recovery for all abandoned conversations
        await recoveryEngine.runAutomatedRecovery(businessId)
        
        return NextResponse.json({ 
          success: true,
          message: 'Automated recovery process initiated'
        })
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: detect, execute, track_success, or automate' },
          { status: 400 }
        )
    }
    
  } catch (error: any) {
    console.error('Recovery error:', error)
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    return NextResponse.json(
      { error: 'Recovery operation failed', details: error.message },
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
    const messaging = new UnifiedMessagingService(prisma)
    const openAI = getOpenAIService()
    const recoveryEngine = new AbandonmentRecoveryEngine(prisma, messaging, openAI)
    
    if (type === 'metrics') {
      // Get recovery metrics
      const period = searchParams.get('period') as any || 'month'
      const metrics = await recoveryEngine.getRecoveryMetrics(businessId, period)
      return NextResponse.json(metrics)
      
    } else if (type === 'triggers') {
      // Get recovery triggers
      const triggers = await prisma.triggerMessage.findMany({
        where: {
          businessId,
          triggerType: 'abandonment'
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      })
      
      return NextResponse.json({ triggers })
      
    } else {
      // Return recovery capabilities
      return NextResponse.json({
        capabilities: {
          abandonmentDetection: true,
          automatedRecovery: true,
          multiChannelOutreach: true,
          personalizedMessaging: openAI.isConfigured(),
          incentiveManagement: true,
          performanceTracking: true
        },
        strategies: [
          'Immediate booking recovery',
          'Last chance offers',
          'Service recovery',
          'Question follow-ups',
          'Multi-touch campaigns',
          'Personalized incentives'
        ],
        channels: [
          'Email',
          'SMS',
          'WhatsApp',
          'Push notifications',
          'Retargeting ads'
        ],
        incentiveTypes: [
          'Percentage discounts',
          'Fixed amount off',
          'Free upgrades',
          'Bonus amenities',
          'Loyalty points'
        ]
      })
    }
    
  } catch (error: any) {
    console.error('Recovery query error:', error)
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch recovery data', details: error.message },
      { status: 500 }
    )
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}