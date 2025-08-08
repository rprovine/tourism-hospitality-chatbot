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
    
    // Get query parameters for filtering and pagination
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const tier = searchParams.get('tier') || 'all'
    const status = searchParams.get('status') || 'all'
    
    // Build where clause for filtering
    const where: any = {}
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (tier !== 'all') {
      where.tier = tier
    }
    
    if (status !== 'all') {
      where.subscriptionStatus = status
    }
    
    // Get total count for pagination
    const totalCount = await prisma.business.count({ where })
    
    // Get users with related data
    const users = await prisma.business.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        subscription: true,
        conversations: {
          select: {
            id: true
          }
        },
        _count: {
          select: {
            conversations: true,
            guestProfiles: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // Get last activity for each user
    const userIds = users.map(u => u.id)
    const lastActivities = await prisma.conversation.groupBy({
      by: ['businessId'],
      where: {
        businessId: { in: userIds }
      },
      _max: {
        createdAt: true
      }
    })
    
    const lastActivityMap = lastActivities.reduce((acc: any, curr) => {
      acc[curr.businessId] = curr._max.createdAt
      return acc
    }, {})
    
    // Format users data
    const formattedUsers = users.map(user => {
      const lastActive = lastActivityMap[user.id]
      const monthlySpend = calculateMonthlySpend(user.tier, user.subscription?.billingCycle)
      
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        tier: user.tier,
        subscriptionStatus: user.subscriptionStatus,
        billingCycle: user.subscription?.billingCycle || 'monthly',
        createdAt: user.createdAt,
        lastActive: lastActive || user.createdAt,
        totalConversations: user._count.conversations,
        totalGuests: user._count.guestProfiles,
        monthlySpend,
        subscription: user.subscription ? {
          startDate: user.subscription.startDate,
          endDate: user.subscription.endDate,
          cancelledAt: user.subscription.cancelledAt,
          paymentFailedAt: user.subscription.paymentFailedAt,
          gracePeriodEnds: user.subscription.gracePeriodEnds
        } : null
      }
    })
    
    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
    
  } catch (error: any) {
    console.error('Admin users API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function PATCH(request: NextRequest) {
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
    
    const body = await request.json()
    const { userId, updates } = body
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // Update user
    const updatedUser = await prisma.business.update({
      where: { id: userId },
      data: updates,
      include: {
        subscription: true
      }
    })
    
    // If subscription tier was changed, update subscription record
    if (updates.tier && updatedUser.subscription) {
      await prisma.subscription.update({
        where: { id: updatedUser.subscription.id },
        data: { tier: updates.tier }
      })
    }
    
    return NextResponse.json({
      success: true,
      user: updatedUser
    })
    
  } catch (error: any) {
    console.error('Admin user update error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(request: NextRequest) {
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
    
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // Delete user and all related data (cascade delete)
    await prisma.business.delete({
      where: { id: userId }
    })
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })
    
  } catch (error: any) {
    console.error('Admin user delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

function calculateMonthlySpend(tier: string, billingCycle?: string): number {
  const monthlyPricing: Record<string, number> = {
    starter: 0,
    professional: 299,
    premium: 599,
    enterprise: 1499
  }
  
  const basePrice = monthlyPricing[tier] || 0
  
  if (billingCycle === 'annual') {
    // Annual billing with 20% discount
    return Math.round(basePrice * 0.8)
  }
  
  return basePrice
}