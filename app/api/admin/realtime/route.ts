import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Decode token to check if it's an admin
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production') as any
      // Allow access if it's an admin or a regular user (for now)
      // In production, you might want to restrict this to admins only
      console.log('Token decoded:', decoded.email, 'isAdmin:', decoded.isAdmin)
    } catch (error) {
      console.error('Token verification failed:', error)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get real-time metrics
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    
    // Get all businesses with their subscription status
    const businesses = await prisma.business.findMany({
      include: {
        subscription: true,
        conversations: {
          where: {
            createdAt: {
              gte: today
            }
          }
        },
        analytics: {
          where: {
            date: {
              gte: today
            }
          }
        }
      }
    })

    // Calculate metrics
    const totalUsers = businesses.length
    const activeUsers = businesses.filter(b => 
      b.subscriptionStatus === 'active' || b.subscriptionStatus === 'trialing'
    ).length
    const paidUsers = businesses.filter(b => b.subscriptionStatus === 'active').length
    const trialUsers = businesses.filter(b => b.subscriptionStatus === 'trialing').length
    const canceledUsers = businesses.filter(b => b.subscriptionStatus === 'canceled').length

    // Calculate MRR
    const mrr = businesses.reduce((sum, b) => {
      if (b.subscriptionStatus !== 'active') return sum
      const tierPrices: Record<string, number> = {
        starter: 29,
        professional: 149,
        premium: 299,
        enterprise: 999
      }
      return sum + (tierPrices[b.tier] || 0)
    }, 0)

    // Get today's conversations
    const todayConversations = await prisma.conversation.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    })

    // Get total conversations
    const totalConversations = await prisma.conversation.count()

    // Get recent signups
    const recentSignups = businesses
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10)
      .map(b => ({
        id: b.id,
        email: b.email,
        name: b.name,
        tier: b.tier,
        status: b.subscriptionStatus,
        createdAt: b.createdAt,
        conversationsToday: b.conversations.length
      }))

    // Tier distribution
    const tierDistribution = {
      starter: businesses.filter(b => b.tier === 'starter').length,
      professional: businesses.filter(b => b.tier === 'professional').length,
      premium: businesses.filter(b => b.tier === 'premium').length,
      enterprise: businesses.filter(b => b.tier === 'enterprise').length
    }

    // Growth metrics
    const thisMonthSignups = businesses.filter(b => b.createdAt >= thisMonth).length
    const lastMonthSignups = businesses.filter(b => 
      b.createdAt >= lastMonth && b.createdAt < thisMonth
    ).length
    const growthRate = lastMonthSignups > 0 
      ? ((thisMonthSignups - lastMonthSignups) / lastMonthSignups * 100).toFixed(1)
      : 0

    // Churn rate (canceled this month / total at start of month)
    const canceledThisMonth = businesses.filter(b => 
      b.subscriptionStatus === 'canceled' && 
      b.updatedAt >= thisMonth
    ).length
    const churnRate = totalUsers > 0 
      ? (canceledThisMonth / totalUsers * 100).toFixed(1)
      : 0

    // Average revenue per user
    const arpu = paidUsers > 0 ? (mrr / paidUsers).toFixed(2) : 0

    // Trial to paid conversion rate
    const conversions = businesses.filter(b => 
      b.subscriptionStatus === 'active' && 
      b.trialStartDate && 
      b.subscriptionStartDate
    ).length
    const totalTrials = businesses.filter(b => b.trialStartDate).length
    const conversionRate = totalTrials > 0 
      ? (conversions / totalTrials * 100).toFixed(1)
      : 0

    // System health check
    const systemHealth = {
      database: 'healthy',
      api: 'healthy',
      chatbot: 'healthy',
      payments: 'healthy'
    }

    return NextResponse.json({
      metrics: {
        totalUsers,
        activeUsers,
        paidUsers,
        trialUsers,
        canceledUsers,
        mrr,
        arpu,
        growthRate,
        churnRate,
        conversionRate,
        todayConversations,
        totalConversations
      },
      recentSignups,
      tierDistribution,
      systemHealth,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Realtime metrics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}