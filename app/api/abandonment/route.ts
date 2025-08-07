import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

// GET - Get abandoned conversations
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
    
    // Find conversations with booking intent that were abandoned
    const abandonedContexts = await prisma.conversationContext.findMany({
      where: {
        conversation: {
          businessId: decoded.businessId
        },
        bookingIntent: { not: null },
        abandonedAt: { not: null },
        completedAt: null,
        followUpSent: false
      },
      include: {
        conversation: true,
        guestProfile: true
      },
      orderBy: { abandonedAt: 'desc' },
      take: 50
    })
    
    return NextResponse.json(abandonedContexts)
    
  } catch (error: any) {
    console.error('Get abandoned conversations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch abandoned conversations' },
      { status: 500 }
    )
  }
}

// POST - Track abandonment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationId, bookingIntent, guestEmail, guestPhone } = body
    
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 })
    }
    
    // Get conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    })
    
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }
    
    // Find or create guest profile
    let guestProfile = null
    
    if (guestEmail || guestPhone) {
      const where: any = {
        businessId: conversation.businessId
      }
      
      if (guestEmail) where.email = guestEmail
      if (guestPhone) where.phone = guestPhone
      
      guestProfile = await prisma.guestProfile.findFirst({ where })
      
      if (!guestProfile) {
        guestProfile = await prisma.guestProfile.create({
          data: {
            businessId: conversation.businessId,
            email: guestEmail,
            phone: guestPhone,
            lastVisit: new Date()
          }
        })
      }
    }
    
    // Create or update conversation context
    let context = await prisma.conversationContext.findFirst({
      where: { conversationId }
    })
    
    if (context) {
      context = await prisma.conversationContext.update({
        where: { id: context.id },
        data: {
          bookingIntent,
          abandonedAt: new Date(),
          guestProfileId: guestProfile?.id
        }
      })
    } else {
      context = await prisma.conversationContext.create({
        data: {
          conversationId,
          bookingIntent,
          abandonedAt: new Date(),
          guestProfileId: guestProfile?.id
        }
      })
    }
    
    // Schedule follow-up if trigger message exists
    const triggerMessage = await prisma.triggerMessage.findFirst({
      where: {
        businessId: conversation.businessId,
        triggerType: 'abandonment',
        isActive: true
      }
    })
    
    if (triggerMessage && guestProfile) {
      // In production, this would schedule an email/SMS
      // For now, we'll just mark it for follow-up
      setTimeout(async () => {
        await sendAbandonmentFollowUp(guestProfile, triggerMessage, context)
      }, triggerMessage.delay * 60 * 1000) // Convert minutes to milliseconds
    }
    
    return NextResponse.json({
      context,
      followUpScheduled: !!triggerMessage
    })
    
  } catch (error: any) {
    console.error('Track abandonment error:', error)
    return NextResponse.json(
      { error: 'Failed to track abandonment' },
      { status: 500 }
    )
  }
}

// Helper function to send follow-up (to be implemented with email/SMS service)
async function sendAbandonmentFollowUp(
  guestProfile: any,
  triggerMessage: any,
  context: any
) {
  try {
    // Update context to mark follow-up as sent
    await prisma.conversationContext.update({
      where: { id: context.id },
      data: { followUpSent: true }
    })
    
    // Update trigger message stats
    await prisma.triggerMessage.update({
      where: { id: triggerMessage.id },
      data: {
        sentCount: { increment: 1 }
      }
    })
    
    // Record interaction
    await prisma.guestInteraction.create({
      data: {
        guestProfileId: guestProfile.id,
        businessId: guestProfile.businessId,
        interactionType: 'email',
        channel: triggerMessage.channel,
        content: triggerMessage.message,
        metadata: {
          triggerMessageId: triggerMessage.id,
          contextId: context.id
        }
      }
    })
    
    // TODO: Integrate with SendGrid/Twilio to actually send the message
    console.log(`Follow-up sent to ${guestProfile.email || guestProfile.phone}`)
    
  } catch (error) {
    console.error('Send follow-up error:', error)
  }
}