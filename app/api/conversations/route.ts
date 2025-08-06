import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const businessId = searchParams.get('businessId')
    const sessionId = searchParams.get('sessionId')
    const conversationId = searchParams.get('conversationId')
    
    // Get specific conversation with messages
    if (conversationId) {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          },
          business: {
            select: {
              name: true,
              tier: true,
              primaryColor: true,
              welcomeMessage: true
            }
          }
        }
      })
      
      if (!conversation) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(conversation)
    }
    
    // Get conversations for a business
    if (businessId) {
      const conversations = await prisma.conversation.findMany({
        where: { businessId },
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: { messages: true }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: 50
      })
      
      return NextResponse.json(conversations)
    }
    
    // Get conversation by session
    if (sessionId) {
      const conversation = await prisma.conversation.findFirst({
        where: { sessionId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          },
          business: {
            select: {
              name: true,
              tier: true,
              primaryColor: true,
              welcomeMessage: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      
      return NextResponse.json(conversation || null)
    }
    
    return NextResponse.json(
      { error: 'businessId, sessionId, or conversationId required' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Conversations API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationId, satisfaction, resolved } = body
    
    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId required' },
        { status: 400 }
      )
    }
    
    const updateData: any = {}
    if (satisfaction !== undefined) updateData.satisfaction = satisfaction
    if (resolved !== undefined) updateData.resolved = resolved
    
    const conversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: updateData
    })
    
    return NextResponse.json(conversation)
    
  } catch (error) {
    console.error('Conversation update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}