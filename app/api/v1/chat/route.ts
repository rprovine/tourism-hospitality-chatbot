import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { generateClaudeResponse } from '@/lib/ai/claude'
import { searchKnowledgeBase } from '@/lib/ai/knowledge-base-search'
import { checkConversationLimit, checkApiRateLimit, isLanguageSupported } from '@/lib/tier-limits'

const prisma = new PrismaClient()

const apiChatSchema = z.object({
  message: z.string().min(1).max(1000),
  sessionId: z.string(),
  language: z.string().default('en'),
  metadata: z.record(z.any()).optional()
})

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const apiKey = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required' },
        { status: 401 }
      )
    }

    // Find business by API key
    const business = await prisma.business.findUnique({
      where: { apiKey }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }

    // Check tier has API access
    if (business.tier === 'starter') {
      return NextResponse.json(
        { error: 'API access not available for Starter plan' },
        { status: 403 }
      )
    }

    // Check rate limits
    const rateLimit = await checkApiRateLimit(business.id, business.tier, prisma)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          limit: rateLimit.limit,
          resetIn: '1 hour'
        },
        { status: 429 }
      )
    }

    // Log API request
    await prisma.apiLog.create({
      data: {
        businessId: business.id,
        endpoint: '/api/v1/chat',
        method: 'POST',
        statusCode: 200,
        responseTime: 0
      }
    })

    // Parse and validate request body
    const body = await request.json()
    const validatedData = apiChatSchema.parse(body)

    // Check language support
    if (!isLanguageSupported(business.tier, validatedData.language)) {
      return NextResponse.json(
        { 
          error: `Language '${validatedData.language}' not supported in ${business.tier} plan`,
          supportedLanguages: business.tier === 'professional' ? ['en', 'ja'] :
                            business.tier === 'premium' ? ['en', 'ja', 'zh', 'es', 'ko'] :
                            ['en', 'ja', 'zh', 'es', 'ko', 'fr', 'de', 'pt', 'ru', 'ar']
        },
        { status: 400 }
      )
    }

    // Check conversation limits
    const conversationLimit = await checkConversationLimit(business.id, business.tier, prisma)
    if (!conversationLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Monthly conversation limit reached',
          limit: conversationLimit.limit,
          used: conversationLimit.limit
        },
        { status: 429 }
      )
    }

    // Create or get conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        businessId: business.id,
        sessionId: validatedData.sessionId
      }
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          businessId: business.id,
          sessionId: validatedData.sessionId,
          metadata: validatedData.metadata || {}
        }
      })
    }

    // Store user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: validatedData.message,
        language: validatedData.language || 'en'
      }
    })

    // Search knowledge base
    const knowledgeResults = await searchKnowledgeBase(
      business.id,
      validatedData.message,
      validatedData.language
    )

    // Generate AI response
    const aiResponse = await generateClaudeResponse(
      validatedData.message,
      {
        businessName: business.name,
        businessType: business.type,
        tier: business.tier as 'starter' | 'professional' | 'premium' | 'enterprise',
        welcomeMessage: business.welcomeMessage,
        knowledgeBase: knowledgeResults
      }
    )

    // Store assistant message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: aiResponse,
        language: validatedData.language || 'en'
      }
    })

    // Update analytics
    await prisma.analytics.upsert({
      where: {
        businessId_date: {
          businessId: business.id,
          date: new Date(new Date().toDateString())
        }
      },
      update: {
        totalConversations: { increment: 1 }
      },
      create: {
        businessId: business.id,
        date: new Date(new Date().toDateString()),
        totalConversations: 1,
        avgSatisfaction: 0
      }
    })

    return NextResponse.json({
      success: true,
      response: aiResponse,
      conversationId: conversation.id,
      usage: {
        conversationsRemaining: conversationLimit.remaining,
        rateLimit: {
          remaining: rateLimit.remaining,
          limit: rateLimit.limit
        }
      }
    })
  } catch (error) {
    console.error('API chat error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}