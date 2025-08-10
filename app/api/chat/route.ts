import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { generateClaudeResponse } from '@/lib/ai/claude'
import { searchKnowledgeBase } from '@/lib/ai/knowledge-base-search'
import { checkConversationLimit, isLanguageSupported } from '@/lib/tier-limits'

const prisma = new PrismaClient()

const messageSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string(),
  businessId: z.string().optional(),
  tier: z.enum(['starter', 'professional', 'premium', 'enterprise']).default('starter'),
  conversationId: z.string().nullable().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = messageSchema.parse(body)
    
    // Get or create conversation
    let conversation
    if (validatedData.conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: validatedData.conversationId },
        include: { business: true }
      })
      
      // Check conversation limits for existing conversations
      if (conversation?.business) {
        const limitCheck = await checkConversationLimit(
          conversation.business.id,
          conversation.business.tier,
          prisma
        )
        
        if (!limitCheck.allowed) {
          return NextResponse.json({
            message: `Your ${conversation.business.tier} plan has reached its monthly conversation limit of ${limitCheck.limit}. Please upgrade to continue.`,
            limitReached: true,
            tier: conversation.business.tier
          })
        }
      }
    } else {
      // For demo purposes, use a default business or create one
      let business = validatedData.businessId 
        ? await prisma.business.findUnique({ where: { id: validatedData.businessId } })
        : await prisma.business.findFirst({ where: { email: 'demo@example.com' } })
      
      if (!business) {
        // Create demo business if it doesn't exist
        business = await prisma.business.create({
          data: {
            email: 'demo@example.com',
            password: 'demo',
            name: 'Demo Resort Hawaii',
            type: 'hotel',
            tier: validatedData.tier
          }
        })
      }
      
      conversation = await prisma.conversation.create({
        data: {
          businessId: business.id,
          sessionId: validatedData.sessionId,
          metadata: {
            tier: validatedData.tier,
            timestamp: new Date().toISOString()
          }
        },
        include: { business: true }
      })
    }
    
    if (!conversation) {
      return NextResponse.json(
        { error: 'Failed to create or retrieve conversation' },
        { status: 500 }
      )
    }
    
    // Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: validatedData.message
      }
    })
    
    // Get conversation history for context
    const previousMessages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: 10 // Last 10 messages for context
    })
    
    // Search knowledge base for relevant information
    const knowledgeMatches = await searchKnowledgeBase(
      conversation.business.id,
      validatedData.message,
      'en', // TODO: Get language from conversation metadata
      3
    )
    
    // Get AI settings to determine which provider to use
    const aiSettings = conversation.business.aiSettings as any || { provider: 'claude' }
    
    let aiResponse: string
    
    if (aiSettings.provider === 'chatgpt') {
      // Use OpenAI/ChatGPT
      const { getOpenAIService } = await import('@/lib/ai/openai-service')
      const openAI = getOpenAIService()
      
      if (openAI.isConfigured()) {
        try {
          // Prepare messages for OpenAI format
          const messages = [
            {
              role: 'system' as const,
              content: `You are an AI assistant for ${conversation.business.name}, a ${conversation.business.type} in Hawaii. ${aiSettings.customPrompt || ''}`
            },
            ...previousMessages.map(m => ({
              role: m.role as 'user' | 'assistant',
              content: m.content
            })),
            {
              role: 'user' as const,
              content: validatedData.message
            }
          ]
          
          const response = await openAI.createChatCompletion(messages, {
            model: aiSettings.chatgptSettings?.modelPreference || 'gpt-3.5-turbo',
            temperature: aiSettings.temperature || 0.7,
            maxTokens: aiSettings.maxTokens || 500
          })
          
          aiResponse = response || 'I apologize, but I encountered an issue processing your request.'
        } catch (error) {
          console.error('OpenAI error:', error)
          // Fall back to Claude if OpenAI fails
          aiResponse = await generateClaudeResponse(validatedData.message, {
            businessName: conversation.business.name,
            businessType: conversation.business.type,
            tier: conversation.business.tier as 'starter' | 'professional' | 'premium' | 'enterprise',
            welcomeMessage: conversation.business.welcomeMessage,
            businessInfo: conversation.business.businessInfo,
            previousMessages: previousMessages.map(m => ({
              role: m.role as 'user' | 'assistant',
              content: m.content
            })),
            knowledgeBase: knowledgeMatches
          }, aiSettings.claudeSettings?.modelPreference)
        }
      } else {
        // OpenAI not configured, fall back to Claude
        aiResponse = await generateClaudeResponse(validatedData.message, {
          businessName: conversation.business.name,
          businessType: conversation.business.type,
          tier: conversation.business.tier as 'starter' | 'professional' | 'premium' | 'enterprise',
          welcomeMessage: conversation.business.welcomeMessage,
          businessInfo: conversation.business.businessInfo,
          previousMessages: previousMessages.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content
          })),
          knowledgeBase: knowledgeMatches
        }, aiSettings.claudeSettings?.modelPreference)
      }
    } else {
      // Default to Claude
      aiResponse = await generateClaudeResponse(
        validatedData.message,
        {
          businessName: conversation.business.name,
          businessType: conversation.business.type,
          tier: conversation.business.tier as 'starter' | 'professional' | 'premium' | 'enterprise',
          welcomeMessage: conversation.business.welcomeMessage,
          businessInfo: conversation.business.businessInfo,
          previousMessages: previousMessages.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content
          })),
          knowledgeBase: knowledgeMatches
        },
        aiSettings.claudeSettings?.modelPreference
      )
    }
    
    // Save AI response
    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: aiResponse
      }
    })
    
    return NextResponse.json({
      conversationId: conversation.id,
      message: assistantMessage.content,
      tier: conversation.business.tier
    })
    
  } catch (error) {
    console.error('Chat API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

