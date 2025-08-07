import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Twilio status callback
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const body: any = {}
    
    formData.forEach((value, key) => {
      body[key] = value.toString()
    })
    
    // Update message status in database
    const { MessageSid, MessageStatus, ErrorCode, ErrorMessage } = body
    
    if (MessageSid && MessageStatus) {
      await prisma.messageQueue.updateMany({
        where: {
          metadata: {
            path: ['twilioSid'],
            equals: MessageSid
          }
        },
        data: {
          status: MessageStatus === 'delivered' ? 'delivered' :
                  MessageStatus === 'failed' ? 'failed' :
                  MessageStatus === 'undelivered' ? 'failed' : 'sent',
          deliveredAt: MessageStatus === 'delivered' ? new Date() : undefined,
          error: ErrorMessage || undefined
        }
      })
      
      console.log(`SMS status update: ${MessageSid} -> ${MessageStatus}`)
    }
    
    return new Response('', { status: 200 })
  } catch (error) {
    console.error('SMS status callback error:', error)
    return new Response('', { status: 200 })
  }
}