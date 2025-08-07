import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth/jwt'
import { TIER_LIMITS } from '@/lib/tier-limits'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get business details
    const business = await prisma.business.findUnique({
      where: { id: payload.businessId }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Get tier limits
    const tierLimits = TIER_LIMITS[business.tier] || TIER_LIMITS.starter

    // Count conversations this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const conversationCount = await prisma.conversation.count({
      where: {
        businessId: business.id,
        createdAt: {
          gte: startOfMonth
        }
      }
    })

    // Count knowledge base items
    const knowledgeBaseCount = await prisma.knowledgeBase.count({
      where: { businessId: business.id }
    })

    // Calculate days remaining in billing cycle
    const now = new Date()
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const daysRemaining = Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    // Get recent activity for charts
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentConversations = await prisma.conversation.findMany({
      where: {
        businessId: business.id,
        createdAt: {
          gte: last7Days
        }
      },
      select: {
        createdAt: true
      }
    })

    // Group conversations by day
    const dailyStats = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)
      
      const count = recentConversations.filter(conv => 
        conv.createdAt >= date && conv.createdAt < nextDate
      ).length
      
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count
      }
    })

    // Check if approaching limits
    const conversationLimitWarning = tierLimits.conversationsPerMonth && 
      conversationCount >= tierLimits.conversationsPerMonth * 0.8

    const knowledgeBaseLimitWarning = tierLimits.knowledgeBaseItems && 
      knowledgeBaseCount >= tierLimits.knowledgeBaseItems * 0.8

    return NextResponse.json({
      tier: business.tier,
      conversationsUsed: conversationCount,
      conversationLimit: tierLimits.conversationsPerMonth,
      knowledgeBaseItems: knowledgeBaseCount,
      knowledgeBaseLimit: tierLimits.knowledgeBaseItems,
      languagesSupported: tierLimits.languagesSupported,
      daysRemaining,
      dailyStats,
      warnings: {
        conversationLimit: conversationLimitWarning,
        knowledgeBaseLimit: knowledgeBaseLimitWarning
      },
      features: tierLimits.features,
      subscriptionStatus: business.subscriptionStatus
    })
  } catch (error) {
    console.error('Usage API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    )
  }
}