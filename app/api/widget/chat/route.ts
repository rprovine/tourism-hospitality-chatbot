import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { generateClaudeResponse } from '@/lib/ai/claude'
import { searchKnowledgeBase } from '@/lib/ai/knowledge-base-search'

const prisma = new PrismaClient()

const messageSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string(),
  businessId: z.string(),
  conversationId: z.string().nullable().optional()
})

// CORS headers for widget
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = messageSchema.parse(body)
    
    // Get business details
    const business = await prisma.business.findUnique({
      where: { id: validatedData.businessId }
    })
    
    if (!business) {
      return NextResponse.json(
        { error: 'Invalid business ID' },
        { status: 404, headers: corsHeaders }
      )
    }
    
    // Get or create conversation
    let conversation
    if (validatedData.conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: validatedData.conversationId }
      })
    }
    
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          businessId: business.id,
          sessionId: validatedData.sessionId,
          userLanguage: 'en'
        }
      })
    }
    
    // Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: validatedData.message
      }
    })
    
    // Get knowledge base context
    const knowledgeBase = await prisma.knowledgeBase.findMany({
      where: { 
        businessId: business.id,
        isActive: true
      }
    })
    
    console.log(`Found ${knowledgeBase.length} knowledge base items for business ${business.id}`)
    
    // Convert knowledge base to the format expected by searchKnowledgeBase
    const kbItems = knowledgeBase.map(item => ({
      question: item.question,
      answer: item.answer,
      category: item.category,
      keywords: item.keywords
    }))
    
    // Search for relevant Q&As - call the correct function signature
    const relevantQAs = await searchKnowledgeBase(business.id, validatedData.message)
    
    console.log(`Found ${relevantQAs.length} relevant Q&As`)
    if (relevantQAs.length > 0) {
      console.log(`Top match: "${relevantQAs[0].question}" with score ${relevantQAs[0].score}`)
    }
    
    // Prepare data for AI response generation
    const isDemo = validatedData.businessId === 'demo' || validatedData.businessId === 'demo-business-id'
    const businessInfo = business.businessInfo as any || {}
    const contactPhone = businessInfo.phone || '815-641-6689'
    const contactEmail = businessInfo.contactEmail || business.email || 'info@lenilani.com'
    
    // Get AI settings
    const aiSettings = business.aiSettings as any || {}
    
    // Get previous messages for context
    const previousMessages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: 10
    })
    
    // Build comprehensive context for AI
    const businessContext = {
      businessName: business.name,
      businessType: business.type,
      tier: business.tier as 'starter' | 'professional' | 'premium' | 'enterprise',
      businessInfo: businessInfo, // Full business profile
      customPrompt: aiSettings.customPrompt,
      knowledgeBase: relevantQAs, // All relevant knowledge base entries
      isDemo: isDemo,
      previousMessages: previousMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))
    }
    
    let response = ''
    
    // For ALL tiers (including starter), try to use AI if available
    // AI will intelligently combine business profile + knowledge base
    try {
      response = await generateClaudeResponse(
        validatedData.message,
        businessContext,
        aiSettings.claudeSettings?.modelPreference
      )
    } catch (aiError) {
      console.error('AI generation error:', aiError)
      
      // Only fall back to basic responses if AI is truly unavailable
      // This ensures consistent, high-quality responses when AI is available
      if (business.tier === 'starter' && (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === '')) {
        // For starter tier with no AI, provide best effort response from knowledge base
        if (relevantQAs.length > 0 && relevantQAs[0].score > 70) {
          response = relevantQAs[0].answer
          if (relevantQAs.length > 1 && relevantQAs[1].score > 70) {
            response += `\n\n${relevantQAs[1].answer}`
          }
        } else {
          // Generic fallback only when no AI and no good knowledge base match
          response = `I'd be happy to help you with that. 

For assistance, please:
• Call us at ${contactPhone}
• Email us at ${contactEmail}
• Visit our front desk

Our team will provide you with detailed information.`
        }
      } else {
        // For higher tiers or when AI should be available, provide helpful fallback
        response = `I apologize for the technical difficulty. Let me help you directly.

Please contact us:
• Phone: ${contactPhone}
• Email: ${contactEmail}
${businessInfo.frontDeskHours ? `• Front desk hours: ${businessInfo.frontDeskHours}` : ''}

Our team will assist you immediately with your question about: "${validatedData.message}"`
      }
    }
    
    // Save assistant response
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: response
      }
    })
    
    // Update conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { 
        updatedAt: new Date()
      }
    })
    
    return NextResponse.json(
      {
        message: response,
        conversationId: conversation.id,
        tier: business.tier
      },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Widget chat error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400, headers: corsHeaders }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to process message',
        message: "I apologize, but I'm experiencing technical difficulties. Please try again later or contact our staff directly."
      },
      { status: 500, headers: corsHeaders }
    )
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const businessId = searchParams.get('businessId')
  
  if (!businessId) {
    return NextResponse.json(
      { error: 'Business ID required' },
      { status: 400, headers: corsHeaders }
    )
  }
  
  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        name: true,
        tier: true,
        welcomeMessage: true,
        primaryColor: true,
        businessInfo: true
      }
    })
    
    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404, headers: corsHeaders }
      )
    }
    
    const businessInfo = business.businessInfo as any || {}
    
    return NextResponse.json(
      {
        businessId: business.id,
        businessName: business.name,
        tier: business.tier || 'starter', // Default to starter if null
        businessInfo: businessInfo, // Include real business data
        settings: {
          welcomeMessage: business.welcomeMessage || 'Aloha! How can I help you today?',
          primaryColor: business.primaryColor || '#0891b2',
          position: 'bottom-right'
        }
      },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Widget config error:', error)
    return NextResponse.json(
      { error: 'Failed to load configuration' },
      { status: 500, headers: corsHeaders }
    )
  }
}