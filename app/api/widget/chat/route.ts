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
    
    // Convert knowledge base to the format expected by searchKnowledgeBase
    const kbItems = knowledgeBase.map(item => ({
      question: item.question,
      answer: item.answer,
      category: item.category,
      keywords: item.keywords
    }))
    
    // Search for relevant Q&As
    const relevantQAs = await searchKnowledgeBase(validatedData.message, kbItems as any)
    
    // Generate response based on tier
    let response = ''
    
    // Check if we have a direct knowledge base match
    if (relevantQAs.length > 0 && relevantQAs[0].score > 0.8) {
      response = relevantQAs[0].answer
    } else {
      // Generate AI response based on tier
      try {
        const businessContext = {
          businessName: business.name,
          businessType: business.type,
          tier: business.tier as 'starter' | 'professional' | 'premium' | 'enterprise',
          knowledgeBase: relevantQAs.slice(0, 3)
        }
        
        response = await generateClaudeResponse(
          validatedData.message,
          businessContext
        )
      } catch (aiError) {
        console.error('AI generation error:', aiError)
        // Fallback response
        response = relevantQAs.length > 0 
          ? relevantQAs[0].answer
          : "I apologize, but I'm having trouble processing your request right now. Please try again in a moment, or contact our staff directly for immediate assistance."
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
        tier: true
      }
    })
    
    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404, headers: corsHeaders }
      )
    }
    
    return NextResponse.json(
      {
        businessId: business.id,
        businessName: business.name,
        tier: business.tier,
        settings: {
          welcomeMessage: 'Aloha! How can I help you today?',
          primaryColor: '#0891b2',
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