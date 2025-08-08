import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface WhatsAppConfig {
  accessToken: string
  phoneNumberId: string
  businessAccountId: string
  webhookVerifyToken: string
}

export class WhatsAppService {
  private config: WhatsAppConfig
  private businessId: string
  
  constructor(businessId: string, config: WhatsAppConfig) {
    this.businessId = businessId
    this.config = config
  }
  
  // Verify webhook for WhatsApp Business API
  static verifyWebhook(mode: string, token: string, challenge: string, verifyToken: string): string | null {
    if (mode === 'subscribe' && token === verifyToken) {
      return challenge
    }
    return null
  }
  
  // Send text message
  async sendMessage(to: string, message: string, replyToMessageId?: string) {
    try {
      const url = `https://graph.facebook.com/v18.0/${this.config.phoneNumberId}/messages`
      
      const payload: any = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message }
      }
      
      if (replyToMessageId) {
        payload.context = { message_id: replyToMessageId }
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to send WhatsApp message')
      }
      
      // Update message queue
      await prisma.messageQueue.create({
        data: {
          businessId: this.businessId,
          channel: 'whatsapp',
          recipient: to,
          message: message,
          status: 'sent',
          sentAt: new Date(),
          metadata: { whatsappMessageId: result.messages[0].id }
        }
      })
      
      return result
    } catch (error) {
      console.error('WhatsApp send error:', error)
      throw error
    }
  }
  
  // Send template message
  async sendTemplate(to: string, templateName: string, languageCode: string, components?: any[]) {
    try {
      const url = `https://graph.facebook.com/v18.0/${this.config.phoneNumberId}/messages`
      
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          components: components || []
        }
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to send WhatsApp template')
      }
      
      return result
    } catch (error) {
      console.error('WhatsApp template error:', error)
      throw error
    }
  }
  
  // Send media message
  async sendMedia(to: string, mediaUrl: string, mediaType: 'image' | 'document' | 'audio' | 'video', caption?: string) {
    try {
      const url = `https://graph.facebook.com/v18.0/${this.config.phoneNumberId}/messages`
      
      const payload: any = {
        messaging_product: 'whatsapp',
        to: to,
        type: mediaType,
        [mediaType]: {
          link: mediaUrl
        }
      }
      
      if (caption && (mediaType === 'image' || mediaType === 'document' || mediaType === 'video')) {
        payload[mediaType].caption = caption
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to send WhatsApp media')
      }
      
      return result
    } catch (error) {
      console.error('WhatsApp media error:', error)
      throw error
    }
  }
  
  // Send interactive buttons
  async sendButtons(to: string, bodyText: string, buttons: Array<{id: string, title: string}>) {
    try {
      const url = `https://graph.facebook.com/v18.0/${this.config.phoneNumberId}/messages`
      
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: bodyText },
          action: {
            buttons: buttons.map(btn => ({
              type: 'reply',
              reply: {
                id: btn.id,
                title: btn.title
              }
            }))
          }
        }
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to send WhatsApp buttons')
      }
      
      return result
    } catch (error) {
      console.error('WhatsApp buttons error:', error)
      throw error
    }
  }
  
  // Process incoming webhook
  async processWebhook(body: any) {
    try {
      const entry = body.entry?.[0]
      const changes = entry?.changes?.[0]
      const value = changes?.value
      
      if (!value) return null
      
      // Handle message status updates
      if (value.statuses) {
        for (const status of value.statuses) {
          await this.updateMessageStatus(status)
        }
        return { type: 'status_update', data: value.statuses }
      }
      
      // Handle incoming messages
      if (value.messages) {
        for (const message of value.messages) {
          await this.processIncomingMessage(message, value.metadata)
        }
        return { type: 'message', data: value.messages }
      }
      
      return null
    } catch (error) {
      console.error('WhatsApp webhook processing error:', error)
      throw error
    }
  }
  
  // Process incoming message
  private async processIncomingMessage(message: any, metadata: any) {
    const { from, id: messageId, type, text, button, interactive } = message
    
    // Find or create channel session
    let session = await prisma.channelSession.findFirst({
      where: {
        businessId: this.businessId,
        channel: 'whatsapp',
        recipient: from,
        status: 'active'
      }
    })
    
    if (!session) {
      // Find or create guest profile
      let guestProfile = await prisma.guestProfile.findFirst({
        where: {
          businessId: this.businessId,
          phone: from
        }
      })
      
      if (!guestProfile) {
        guestProfile = await prisma.guestProfile.create({
          data: {
            businessId: this.businessId,
            phone: from,
            languagePreference: 'en',
            lastVisit: new Date()
          }
        })
      }
      
      // Create conversation
      const conversation = await prisma.conversation.create({
        data: {
          businessId: this.businessId,
          sessionId: `whatsapp_${from}_${Date.now()}`,
          userLanguage: 'en'
        }
      })
      
      // Create channel session
      session = await prisma.channelSession.create({
        data: {
          businessId: this.businessId,
          channel: 'whatsapp',
          externalId: messageId,
          recipient: from,
          guestProfileId: guestProfile.id,
          conversationId: conversation.id,
          lastMessageAt: new Date()
        }
      })
    }
    
    // Extract message content based on type
    let content = ''
    if (type === 'text') {
      content = text.body
    } else if (type === 'button') {
      content = button.text
    } else if (type === 'interactive') {
      content = interactive.button_reply?.title || interactive.list_reply?.title || ''
    }
    
    // Save message to conversation
    if (session.conversationId) {
      await prisma.message.create({
        data: {
          conversationId: session.conversationId,
          role: 'user',
          content: content
        }
      })
    }
    
    // Update session activity
    await prisma.channelSession.update({
      where: { id: session.id },
      data: { lastMessageAt: new Date() }
    })
    
    return { session, content, messageId }
  }
  
  // Update message status
  private async updateMessageStatus(status: any) {
    const { id, status: deliveryStatus, timestamp } = status
    
    // Update message queue if exists
    await prisma.messageQueue.updateMany({
      where: {
        businessId: this.businessId,
        metadata: {
          path: ['whatsappMessageId'],
          equals: id
        }
      },
      data: {
        status: deliveryStatus === 'delivered' ? 'delivered' : 
                deliveryStatus === 'read' ? 'read' : 
                deliveryStatus === 'failed' ? 'failed' : 'sent',
        deliveredAt: deliveryStatus === 'delivered' ? new Date(parseInt(timestamp) * 1000) : undefined
      }
    })
  }
  
  // Mark message as read
  async markAsRead(messageId: string) {
    try {
      const url = `https://graph.facebook.com/v18.0/${this.config.phoneNumberId}/messages`
      
      const payload = {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to mark message as read')
      }
      
      return result
    } catch (error) {
      console.error('WhatsApp mark read error:', error)
      throw error
    }
  }
}

export default WhatsAppService