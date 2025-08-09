import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function GET(request: NextRequest) {
  try {
    // Get auth token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const token = authHeader.replace('Bearer ', '')
    let businessId: string
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      businessId = decoded.businessId
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    
    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || '7d'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    // Get date range (default to last 30 days)
    const end = endDate ? new Date(endDate) : new Date()
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    // Try to get analytics data (may not exist yet)
    let analytics: any[] = []
    let conversations: any[] = []
    
    try {
      analytics = await prisma.analytics.findMany({
        where: {
          businessId,
          date: {
            gte: start,
            lte: end
          }
        },
        orderBy: { date: 'asc' }
      })
    } catch (e) {
      console.log('No analytics data yet')
    }
    
    try {
      // Get conversation stats
      conversations = await prisma.conversation.findMany({
        where: {
          businessId,
          createdAt: {
            gte: start,
            lte: end
          }
        },
        include: {
          messages: true,
          _count: {
            select: { messages: true }
          }
        }
      })
    } catch (e) {
      console.log('No conversation data yet')
    }
    
    // Calculate metrics
    const totalConversations = conversations.length
    const totalMessages = conversations.reduce((sum, conv) => sum + conv._count.messages, 0)
    const avgMessagesPerConversation = totalConversations > 0 ? totalMessages / totalConversations : 0
    const satisfactionRatings = conversations.filter(c => c.satisfactionScore !== null)
    const avgSatisfaction = satisfactionRatings.length > 0
      ? satisfactionRatings.reduce((sum, c) => sum + (c.satisfactionScore || 0), 0) / satisfactionRatings.length
      : 0
    const resolvedConversations = conversations.filter(c => c.satisfactionScore !== null).length // Consider rated as resolved
    const resolutionRate = totalConversations > 0 ? (resolvedConversations / totalConversations) * 100 : 0
    
    // Get top questions
    const allMessages = conversations.flatMap((c: any) => 
      c.messages.filter((m: any) => m.role === 'user').map((m: any) => m.content)
    )
    const questionFrequency: Record<string, number> = {}
    allMessages.forEach((msg: string) => {
      const normalized = msg.toLowerCase().trim()
      questionFrequency[normalized] = (questionFrequency[normalized] || 0) + 1
    })
    const topQuestions = Object.entries(questionFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([question, count]) => ({ question, count }))
    
    return NextResponse.json({
      analytics,
      summary: {
        totalConversations,
        totalMessages,
        avgMessagesPerConversation: Math.round(avgMessagesPerConversation * 10) / 10,
        avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
        resolutionRate: Math.round(resolutionRate * 10) / 10,
        topQuestions
      },
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    })
    
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessId, date } = body
    
    if (!businessId) {
      return NextResponse.json(
        { error: 'businessId required' },
        { status: 400 }
      )
    }
    
    const targetDate = date ? new Date(date) : new Date()
    targetDate.setHours(0, 0, 0, 0)
    
    // Calculate daily analytics
    const startOfDay = new Date(targetDate)
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)
    
    const conversations = await prisma.conversation.findMany({
      where: {
        businessId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        messages: true
      }
    })
    
    // Calculate metrics
    const totalConversations = conversations.length
    const uniqueUsers = new Set(conversations.map((c: any) => c.sessionId)).size
    const satisfactionRatings = conversations.filter((c: any) => c.satisfactionScore !== null)
    const avgSatisfaction = satisfactionRatings.length > 0
      ? satisfactionRatings.reduce((sum: number, c: any) => sum + (c.satisfactionScore || 0), 0) / satisfactionRatings.length
      : 0
    
    // Upsert analytics record
    const analytics = await prisma.analytics.upsert({
      where: {
        businessId_date: {
          businessId,
          date: targetDate
        }
      },
      update: {
        totalConversations,
        uniqueUsers,
        avgSatisfaction
      },
      create: {
        businessId,
        date: targetDate,
        totalConversations,
        uniqueUsers,
        avgSatisfaction
      }
    })
    
    return NextResponse.json(analytics)
    
  } catch (error) {
    console.error('Analytics creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}