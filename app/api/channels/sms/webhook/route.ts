import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import UnifiedMessagingService from '@/lib/channels/unified-messaging'

const prisma = new PrismaClient()

// POST - Receive Twilio SMS webhooks
export async function POST(request: NextRequest) {
  try {
    // Parse form data from Twilio
    const formData = await request.formData()
    const body: any = {}
    
    formData.forEach((value, key) => {
      body[key] = value.toString()
    })
    
    // Get phone number to identify business
    const to = body.To
    
    if (!to) {
      return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
        headers: { 'Content-Type': 'text/xml' }
      })
    }
    
    // Find the business by phone number
    const config = await prisma.channelConfig.findFirst({
      where: {
        channel: 'sms',
        isActive: true,
        config: {
          path: ['phoneNumber'],
          equals: to
        }
      }
    })
    
    if (!config) {
      console.warn('Received SMS for unconfigured number:', to)
      return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
        headers: { 'Content-Type': 'text/xml' }
      })
    }
    
    // Process webhook
    const messaging = new UnifiedMessagingService(config.businessId)
    await messaging.initialize()
    const result = await messaging.processWebhook('sms', body)
    
    // Generate TwiML response if needed
    let twiml = '<?xml version="1.0" encoding="UTF-8"?><Response>'
    
    // You can add auto-reply logic here
    if (result && result.content) {
      // For now, just acknowledge receipt
      // In production, the AI response will be sent asynchronously
    }
    
    twiml += '</Response>'
    
    return new Response(twiml, {
      headers: { 'Content-Type': 'text/xml' }
    })
  } catch (error) {
    console.error('SMS webhook error:', error)
    return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'text/xml' }
    })
  }
}

