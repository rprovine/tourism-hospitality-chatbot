import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const businessId = searchParams.get('businessId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    if (!businessId) {
      return NextResponse.json(
        { error: 'businessId required' },
        { status: 400 }
      )
    }
    
    // Get date range (default to last 30 days)
    const end = endDate ? new Date(endDate) : new Date()
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    // Get analytics data
    const analytics = await prisma.analytics.findMany({
      where: {
        businessId,
        date: {
          gte: start,
          lte: end
        }
      },
      orderBy: { date: 'asc' }
    })
    
    // Get conversation stats
    const conversations = await prisma.conversation.findMany({
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
    
    // Calculate metrics
    const totalConversations = conversations.length
    const totalMessages = conversations.reduce((sum, conv) => sum + conv._count.messages, 0)
    const avgMessagesPerConversation = totalConversations > 0 ? totalMessages / totalConversations : 0
    const satisfactionRatings = conversations.filter(c => c.satisfaction !== null)
    const avgSatisfaction = satisfactionRatings.length > 0
      ? satisfactionRatings.reduce((sum, c) => sum + (c.satisfaction || 0), 0) / satisfactionRatings.length
      : 0
    const resolvedConversations = conversations.filter(c => c.resolved).length
    const resolutionRate = totalConversations > 0 ? (resolvedConversations / totalConversations) * 100 : 0
    
    // Get top questions
    const allMessages = conversations.flatMap(c => 
      c.messages.filter(m => m.role === 'user').map(m => m.content)
    )
    const questionFrequency: Record<string, number> = {}
    allMessages.forEach(msg => {
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
    const uniqueUsers = new Set(conversations.map(c => c.sessionId)).size
    const satisfactionRatings = conversations.filter(c => c.satisfaction !== null)
    const avgSatisfaction = satisfactionRatings.length > 0
      ? satisfactionRatings.reduce((sum, c) => sum + (c.satisfaction || 0), 0) / satisfactionRatings.length
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