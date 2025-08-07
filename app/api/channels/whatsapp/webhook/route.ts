import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import UnifiedMessagingService from '@/lib/channels/unified-messaging'
import WhatsAppService from '@/lib/channels/whatsapp'

const prisma = new PrismaClient()

// GET - Webhook verification
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const mode = searchParams.get('hub.mode')
    const token = searchParams.get('hub.verify_token')
    const challenge = searchParams.get('hub.challenge')
    
    // Get WhatsApp config
    const config = await prisma.channelConfig.findFirst({
      where: {
        channel: 'whatsapp',
        isActive: true
      }
    })
    
    if (!config) {
      return NextResponse.json({ error: 'WhatsApp not configured' }, { status: 400 })
    }
    
    const whatsappConfig = config.config as any
    const verifyToken = whatsappConfig.webhookVerifyToken || 'lenilani_whatsapp_2025'
    
    const result = WhatsAppService.verifyWebhook(
      mode || '',
      token || '',
      challenge || '',
      verifyToken
    )
    
    if (result) {
      return new Response(result, { status: 200 })
    }
    
    return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
  } catch (error) {
    console.error('WhatsApp webhook verification error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// POST - Receive WhatsApp webhooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get business ID from the webhook data
    const phoneNumberId = body.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id
    
    if (!phoneNumberId) {
      return NextResponse.json({ success: true })
    }
    
    // Find the business by phone number ID
    const config = await prisma.channelConfig.findFirst({
      where: {
        channel: 'whatsapp',
        isActive: true,
        config: {
          path: ['phoneNumberId'],
          equals: phoneNumberId
        }
      }
    })
    
    if (!config) {
      console.warn('Received webhook for unconfigured WhatsApp number:', phoneNumberId)
      return NextResponse.json({ success: true })
    }
    
    // Process webhook
    const messaging = new UnifiedMessagingService(config.businessId)
    await messaging.initialize()
    await messaging.processWebhook('whatsapp', body)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('WhatsApp webhook error:', error)
    return NextResponse.json({ success: true }) // Always return 200 to prevent retries
  }
}