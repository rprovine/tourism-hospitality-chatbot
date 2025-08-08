import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }
    
    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)
    
    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }
    
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    // Get user statistics
    const totalUsers = await prisma.business.count()
    const newUsersThisMonth = await prisma.business.count({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    })
    
    // Get users by tier
    const usersByTier = await prisma.business.groupBy({
      by: ['tier'],
      _count: true
    })
    
    // Get subscription statistics
    const subscriptionStats = await prisma.subscription.groupBy({
      by: ['status'],
      _count: true
    })
    
    // Get active subscribers (paid tiers)
    const activeSubscribers = await prisma.business.count({
      where: {
        tier: { in: ['professional', 'premium', 'enterprise'] },
        subscriptionStatus: 'active'
      }
    })
    
    // Calculate MRR (Monthly Recurring Revenue) accounting for billing cycles
    // Get all active subscriptions with their billing details
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        business: {
          tier: { in: ['professional', 'premium', 'enterprise'] }
        }
      },
      include: {
        business: {
          select: { tier: true }
        }
      }
    })
    
    // Define pricing (monthly rates)
    const monthlyPricing: Record<string, number> = {
      professional: 299,
      premium: 599,
      enterprise: 1499 // Custom pricing, using placeholder
    }
    
    // Annual discount (20% off = 80% of monthly * 12)
    const annualMultiplier = 0.8
    
    // Calculate MRR
    let mrr = 0
    activeSubscriptions.forEach(sub => {
      const tier = sub.business.tier
      const monthlyRate = monthlyPricing[tier] || 0
      
      if (sub.billingCycle === 'annual') {
        // For annual subscriptions, calculate the monthly equivalent
        // Annual price = monthly * 12 * 0.8 (20% discount)
        // MRR = annual price / 12
        mrr += monthlyRate * annualMultiplier
      } else {
        // Monthly subscriptions contribute full monthly rate
        mrr += monthlyRate
      }
    })
    
    mrr = Math.round(mrr)
    
    // Calculate ARR (Annual Recurring Revenue)
    const arr = mrr * 12
    
    // Calculate breakdown by billing cycle
    const monthlySubscribers = activeSubscriptions.filter(s => s.billingCycle === 'monthly').length
    const annualSubscribers = activeSubscriptions.filter(s => s.billingCycle === 'annual').length
    
    // Get conversation statistics
    const totalConversations = await prisma.conversation.count()
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    const conversationsToday = await prisma.conversation.count({
      where: {
        createdAt: { gte: todayStart }
      }
    })
    
    // Get dormant users (no activity in 30 days)
    const activeBusinessIds = await prisma.conversation.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      select: { businessId: true },
      distinct: ['businessId']
    })
    
    const activeBusinessIdList = activeBusinessIds.map(c => c.businessId)
    const dormantUsers = await prisma.business.count({
      where: {
        id: { notIn: activeBusinessIdList },
        createdAt: { lt: thirtyDaysAgo }
      }
    })
    
    // Get payment issues
    const failedPayments = await prisma.subscription.count({
      where: {
        paymentFailedAt: { gte: sevenDaysAgo }
      }
    })
    
    const inGracePeriod = await prisma.subscription.count({
      where: {
        gracePeriodEnds: { gte: now },
        paymentFailedAt: { not: null }
      }
    })
    
    const accessRevoked = await prisma.subscription.count({
      where: {
        accessRevokedAt: { not: null }
      }
    })
    
    // Get API errors (last 24 hours)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const apiErrors = await prisma.apiLog.count({
      where: {
        statusCode: { gte: 400 },
        createdAt: { gte: oneDayAgo }
      }
    })
    
    // Get activity metrics
    const dailyActiveUsers = activeBusinessIds.filter(c => {
      const conv = prisma.conversation.findFirst({
        where: { 
          businessId: c.businessId,
          createdAt: { gte: todayStart }
        }
      })
      return conv
    }).length
    
    const weeklyActiveUsers = await prisma.conversation.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo }
      },
      select: { businessId: true },
      distinct: ['businessId']
    }).then(results => results.length)
    
    const monthlyActiveUsers = activeBusinessIdList.length
    
    // Get API calls today
    const apiCallsToday = await prisma.apiLog.count({
      where: {
        createdAt: { gte: todayStart }
      }
    })
    
    // Calculate average response time
    const avgResponseTimeData = await prisma.apiLog.aggregate({
      _avg: { responseTime: true },
      where: {
        createdAt: { gte: oneDayAgo }
      }
    })
    
    const stats = {
      // User metrics
      totalUsers,
      newUsersThisMonth,
      dormantUsers,
      usersByTier: usersByTier.reduce((acc: any, curr) => {
        acc[curr.tier] = curr._count
        return acc
      }, {}),
      
      // Subscription metrics
      activeSubscribers,
      monthlyRevenue: mrr,
      mrr,
      arr,
      monthlySubscribers,
      annualSubscribers,
      arpu: activeSubscribers > 0 ? Math.round(mrr / activeSubscribers) : 0,
      subscriptionStatus: subscriptionStats.reduce((acc: any, curr) => {
        acc[curr.status] = curr._count
        return acc
      }, {}),
      
      // Conversation metrics
      totalConversations,
      conversationsToday,
      
      // Activity metrics
      dailyActiveUsers,
      weeklyActiveUsers,
      monthlyActiveUsers,
      apiCallsToday,
      
      // Performance metrics
      avgResponseTime: Math.round(avgResponseTimeData._avg.responseTime || 0),
      responseTimeChange: 0, // TODO: Calculate week-over-week change
      
      // Issue metrics
      failedPayments,
      inGracePeriod,
      accessRevoked,
      apiErrors,
      failedConversations: 0, // TODO: Implement conversation failure tracking
      uptime: 99.9 // TODO: Implement real uptime monitoring
    }
    
    return NextResponse.json(stats)
    
  } catch (error: any) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}