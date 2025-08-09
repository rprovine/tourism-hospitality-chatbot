import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth/jwt'

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

    // Get current month's start and end dates
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Count conversations for this month
    const conversations = await prisma.conversation.count({
      where: {
        businessId: payload.businessId,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    })

    // Count messages for token estimation
    const messages = await prisma.message.findMany({
      where: {
        conversation: {
          businessId: payload.businessId
        },
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      select: {
        content: true,
        role: true
      }
    })

    // Estimate tokens (rough approximation: 1 token ≈ 4 characters)
    let totalTokens = 0
    messages.forEach(message => {
      totalTokens += Math.ceil(message.content.length / 4)
    })

    // Estimate costs based on model pricing
    // Claude Haiku: $0.25 per million input tokens, $1.25 per million output tokens
    // GPT-3.5: $0.50 per million input tokens, $1.50 per million output tokens
    // Using average for estimation
    const estimatedCost = (totalTokens / 1000000) * 0.75 // Average cost per million tokens

    // Calculate budget usage percentage
    // Assume budget based on tier: starter=$20, professional=$50, premium=$100
    const business = await prisma.business.findUnique({
      where: { id: payload.businessId },
      select: { tier: true }
    })

    const budgets: Record<string, number> = {
      starter: 20,
      professional: 50,
      premium: 100,
      enterprise: 500
    }

    const monthlyBudget = budgets[business?.tier || 'starter']
    const usagePercentage = Math.min(100, Math.round((estimatedCost / monthlyBudget) * 100))

    return NextResponse.json({
      requests: conversations,
      tokensUsed: totalTokens,
      estimatedCost: estimatedCost.toFixed(2),
      monthlyBudget,
      usagePercentage,
      period: {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString()
      }
    })
  } catch (error) {
    console.error('Usage tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    )
  }
}