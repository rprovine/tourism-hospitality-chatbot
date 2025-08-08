import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { SentimentAnalyzer } from '@/lib/ai/sentiment-analyzer'
import { getOpenAIService } from '@/lib/ai/openai-service'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    // Verify JWT token
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const businessId = decoded.businessId
    
    const body = await request.json()
    const { message, messages } = body
    
    if (!message && !messages) {
      return NextResponse.json(
        { error: 'Message or messages array required' },
        { status: 400 }
      )
    }
    
    // Initialize services
    const openAI = getOpenAIService()
    const analyzer = new SentimentAnalyzer(openAI)
    
    // Analyze single message or conversation
    if (message) {
      const analysis = await analyzer.analyzeMessage(message)
      return NextResponse.json({ analysis })
    } else {
      const trend = await analyzer.analyzeConversationTrend(messages)
      return NextResponse.json({ trend })
    }
    
  } catch (error: any) {
    console.error('Sentiment analysis error:', error)
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    return NextResponse.json(
      { error: 'Failed to analyze sentiment', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    jwt.verify(token, JWT_SECRET)
    
    // Return sentiment analysis capabilities
    return NextResponse.json({
      capabilities: {
        singleMessage: true,
        conversationTrend: true,
        realTimeMonitoring: true,
        emotions: ['joy', 'anger', 'sadness', 'fear', 'surprise', 'disgust'],
        urgencyDetection: true,
        topicExtraction: true,
        intentRecognition: true
      },
      models: {
        openAI: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured',
        fallback: 'keyword_based'
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}