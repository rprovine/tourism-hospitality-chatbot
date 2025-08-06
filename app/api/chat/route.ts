import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { generateClaudeResponse } from '@/lib/ai/claude'

const prisma = new PrismaClient()

const messageSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string(),
  businessId: z.string().optional(),
  tier: z.enum(['starter', 'professional']).default('starter'),
  conversationId: z.string().optional()
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
    
    // Generate AI response using Claude
    const aiResponse = await generateClaudeResponse(
      validatedData.message,
      {
        businessName: conversation.business.name,
        businessType: conversation.business.type,
        tier: conversation.business.tier as 'starter' | 'professional' | 'premium',
        welcomeMessage: conversation.business.welcomeMessage,
        businessInfo: conversation.business.businessInfo,
        previousMessages: previousMessages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        }))
      }
    )
    
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

