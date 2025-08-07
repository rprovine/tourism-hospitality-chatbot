import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { LearningEngine } from '@/lib/ai/learning-engine'
import { getOpenAIService } from '@/lib/ai/openai-service'
import { SentimentAnalyzer } from '@/lib/ai/sentiment-analyzer'

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
    const { action, conversationId, feedback, question } = body
    
    // Initialize Prisma
    prisma = new PrismaClient()
    
    // Initialize learning engine
    const openAI = getOpenAIService()
    const sentimentAnalyzer = new SentimentAnalyzer(openAI)
    const learningEngine = new LearningEngine(prisma, openAI, sentimentAnalyzer)
    
    switch (action) {
      case 'feedback':
        if (!conversationId || !feedback) {
          return NextResponse.json(
            { error: 'conversationId and feedback required' },
            { status: 400 }
          )
        }
        
        await learningEngine.learnFromFeedback(
          conversationId,
          feedback,
          { businessId }
        )
        
        return NextResponse.json({ success: true, message: 'Feedback recorded' })
      
      case 'suggest':
        if (!question) {
          return NextResponse.json(
            { error: 'question required' },
            { status: 400 }
          )
        }
        
        const suggestion = await learningEngine.getSuggestedResponse(question)
        return NextResponse.json({ suggestion })
      
      case 'insights':
        const insights = await learningEngine.generateInsights()
        
        // Store insights in database
        for (const insight of insights) {
          await prisma.aIInsight.create({
            data: {
              businessId,
              type: insight.type,
              title: insight.title,
              description: insight.description,
              impact: insight.impact,
              recommendation: insight.recommendation,
              metrics: insight.metrics || {}
            }
          })
        }
        
        return NextResponse.json({ insights })
      
      case 'statistics':
        const stats = await learningEngine.getStatistics()
        return NextResponse.json({ statistics: stats })
      
      case 'export':
        const exportData = await learningEngine.exportForFineTuning()
        return NextResponse.json({ data: exportData })
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: feedback, suggest, insights, statistics, or export' },
          { status: 400 }
        )
    }
    
  } catch (error: any) {
    console.error('Learning engine error:', error)
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    return NextResponse.json(
      { error: 'Learning operation failed', details: error.message },
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
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    prisma = new PrismaClient()
    
    if (type === 'insights') {
      // Fetch recent insights
      const insights = await prisma.aIInsight.findMany({
        where: { 
          businessId,
          status: 'active'
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
      
      return NextResponse.json({ insights })
    } else if (type === 'patterns') {
      // Fetch learning patterns
      const patterns = await prisma.learningPattern.findMany({
        where: { businessId },
        orderBy: { frequency: 'desc' },
        take: 20
      })
      
      return NextResponse.json({ patterns })
    } else if (type === 'feedback') {
      // Fetch recent feedback
      const feedback = await prisma.conversationFeedback.findMany({
        where: { businessId },
        orderBy: { timestamp: 'desc' },
        take: 50,
        include: {
          conversation: {
            select: {
              id: true,
              sessionId: true,
              createdAt: true
            }
          }
        }
      })
      
      return NextResponse.json({ feedback })
    } else {
      // Return learning capabilities
      return NextResponse.json({
        capabilities: {
          patternRecognition: true,
          responseSuggestions: true,
          insightGeneration: true,
          feedbackLearning: true,
          fineTuningExport: true,
          sentimentTracking: true
        },
        models: {
          openAI: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured'
        }
      })
    }
    
  } catch (error: any) {
    console.error('Learning query error:', error)
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch learning data', details: error.message },
      { status: 500 }
    )
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}