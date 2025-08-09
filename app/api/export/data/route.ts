import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    // Fetch all data for the business
    const [business, knowledgeBase, conversations, guestProfiles] = await Promise.all([
      // Business data with chatbot config
      prisma.business.findUnique({
        where: { id: decoded.businessId },
        select: {
          id: true,
          name: true,
          email: true,
          tier: true,
          createdAt: true,
          businessInfo: true,
          chatbotName: true,
          welcomeMessage: true,
          primaryColor: true,
          model: true,
          temperature: true,
          responseStyle: true,
          language: true,
          customInstructions: true,
          widgetPosition: true,
          widgetSize: true,
          collectUserInfo: true,
          enableTypingIndicator: true,
          enableSoundNotifications: true,
          autoGreetDelay: true,
          businessHoursEnabled: true,
          businessHours: true,
          offlineMessage: true
        }
      }),
      
      // Knowledge base
      prisma.knowledgeBase.findMany({
        where: { businessId: decoded.businessId },
        select: {
          question: true,
          answer: true,
          category: true,
          tags: true,
          isActive: true,
          metadata: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      
      // Conversations (last 1000)
      prisma.conversation.findMany({
        where: { businessId: decoded.businessId },
        take: 1000,
        orderBy: { createdAt: 'desc' },
        select: {
          sessionId: true,
          messages: true,
          metadata: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      
      // Guest profiles
      prisma.guestProfile.findMany({
        where: { businessId: decoded.businessId },
        select: {
          name: true,
          email: true,
          phone: true,
          tags: true,
          preferences: true,
          notes: true,
          isVip: true,
          totalBookings: true,
          lifetimeValue: true,
          lastVisit: true,
          metadata: true,
          createdAt: true,
          updatedAt: true
        }
      })
    ])
    
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }
    
    // Compile export data
    const exportData = {
      exportDate: new Date().toISOString(),
      business: {
        name: business.name,
        email: business.email,
        tier: business.tier,
        createdAt: business.createdAt,
        info: business.businessInfo
      },
      chatbotConfig: {
        name: business.chatbotName,
        welcomeMessage: business.welcomeMessage,
        primaryColor: business.primaryColor,
        model: business.model,
        temperature: business.temperature,
        responseStyle: business.responseStyle,
        language: business.language,
        customInstructions: business.customInstructions,
        widgetPosition: business.widgetPosition,
        widgetSize: business.widgetSize,
        collectUserInfo: business.collectUserInfo,
        enableTypingIndicator: business.enableTypingIndicator,
        enableSoundNotifications: business.enableSoundNotifications,
        autoGreetDelay: business.autoGreetDelay,
        businessHoursEnabled: business.businessHoursEnabled,
        businessHours: business.businessHours,
        offlineMessage: business.offlineMessage
      },
      knowledgeBase: {
        count: knowledgeBase.length,
        items: knowledgeBase
      },
      conversations: {
        count: conversations.length,
        items: conversations.map(conv => ({
          sessionId: conv.sessionId,
          messageCount: (conv.messages as any[])?.length || 0,
          messages: conv.messages,
          metadata: conv.metadata,
          createdAt: conv.createdAt
        }))
      },
      guestProfiles: {
        count: guestProfiles.length,
        totalLifetimeValue: guestProfiles.reduce((sum, g) => sum + (g.lifetimeValue || 0), 0),
        vipCount: guestProfiles.filter(g => g.isVip).length,
        profiles: guestProfiles
      },
      statistics: {
        totalKnowledgeItems: knowledgeBase.length,
        totalConversations: conversations.length,
        totalGuestProfiles: guestProfiles.length,
        totalMessages: conversations.reduce((sum, conv) => 
          sum + ((conv.messages as any[])?.length || 0), 0
        )
      }
    }
    
    // Return as downloadable JSON file
    const fileName = `data-export-${business.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`
    
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
    
  } catch (error) {
    console.error('Data export error:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}