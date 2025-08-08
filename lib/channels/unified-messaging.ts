import { PrismaClient } from '@prisma/client'
import WhatsAppService from './whatsapp'
import TwilioService from './twilio'

const prisma = new PrismaClient()

export class UnifiedMessagingService {
  private businessId: string
  private services: Map<string, any> = new Map()
  
  constructor(businessId: string) {
    this.businessId = businessId
  }
  
  // Initialize all configured channels
  async initialize() {
    const configs = await prisma.channelConfig.findMany({
      where: {
        businessId: this.businessId,
        isActive: true
      }
    })
    
    for (const config of configs) {
      await this.initializeChannel(config)
    }
  }
  
  // Initialize specific channel
  private async initializeChannel(config: any) {
    try {
      const channelConfig = config.config as any
      
      switch (config.channel) {
        case 'whatsapp':
          this.services.set('whatsapp', new WhatsAppService(this.businessId, {
            accessToken: channelConfig.accessToken,
            phoneNumberId: channelConfig.phoneNumberId,
            businessAccountId: channelConfig.businessAccountId,
            webhookVerifyToken: channelConfig.webhookVerifyToken
          }))
          break
          
        case 'sms':
          this.services.set('sms', new TwilioService(this.businessId, {
            accountSid: channelConfig.accountSid,
            authToken: channelConfig.authToken,
            phoneNumber: channelConfig.phoneNumber,
            messagingServiceSid: channelConfig.messagingServiceSid
          }))
          break
          
        // Add more channels here (Instagram, Facebook, etc.)
      }
      
      console.log(`Initialized ${config.channel} channel for business ${this.businessId}`)
    } catch (error) {
      console.error(`Failed to initialize ${config.channel}:`, error)
    }
  }
  
  // Send message to any channel
  async sendMessage(channel: string, recipient: string, message: string, options?: any) {
    const service = this.services.get(channel)
    
    if (!service) {
      throw new Error(`Channel ${channel} not configured or inactive`)
    }
    
    try {
      let result
      
      switch (channel) {
        case 'whatsapp':
          result = await service.sendMessage(recipient, message, options?.replyToMessageId)
          break
          
        case 'sms':
          result = await service.sendSMS(recipient, message, options?.mediaUrl)
          break
          
        default:
          throw new Error(`Unsupported channel: ${channel}`)
      }
      
      // Track in analytics
      await this.trackMessage(channel, 'outbound', recipient)
      
      return result
    } catch (error) {
      console.error(`Failed to send ${channel} message:`, error)
      throw error
    }
  }
  
  // Send to preferred channel
  async sendToPreferredChannel(guestProfileId: string, message: string, options?: any) {
    // Get guest profile
    const guestProfile = await prisma.guestProfile.findUnique({
      where: { id: guestProfileId },
      include: {
        channelSessions: {
          where: { status: 'active' },
          orderBy: { lastMessageAt: 'desc' },
          take: 1
        }
      }
    })
    
    if (!guestProfile) {
      throw new Error('Guest profile not found')
    }
    
    // Determine preferred channel
    let channel = 'sms' // default
    let recipient = guestProfile.phone
    
    if (guestProfile.channelSessions.length > 0) {
      const lastSession = guestProfile.channelSessions[0]
      channel = lastSession.channel
      recipient = lastSession.recipient
    } else if (guestProfile.metadata && (guestProfile.metadata as any).preferredChannel) {
      channel = (guestProfile.metadata as any).preferredChannel
    }
    
    if (!recipient) {
      throw new Error('No contact information available for guest')
    }
    
    return await this.sendMessage(channel, recipient, message, options)
  }
  
  // Broadcast message to multiple recipients
  async broadcast(channel: string, recipients: string[], message: string, options?: any) {
    const results = []
    const batchSize = channel === 'whatsapp' ? 10 : 50 // Different rate limits per channel
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize)
      
      const batchResults = await Promise.allSettled(
        batch.map(recipient => this.sendMessage(channel, recipient, message, options))
      )
      
      results.push(...batchResults.map((result, index) => ({
        recipient: batch[index],
        success: result.status === 'fulfilled',
        result: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null
      })))
      
      // Rate limiting delay
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    return results
  }
  
  // Process incoming webhook from any channel
  async processWebhook(channel: string, body: any, headers?: any) {
    const service = this.services.get(channel)
    
    if (!service) {
      console.warn(`Received webhook for unconfigured channel: ${channel}`)
      return null
    }
    
    try {
      let result
      
      switch (channel) {
        case 'whatsapp':
          result = await service.processWebhook(body)
          break
          
        case 'sms':
          result = await service.processWebhook(body)
          break
          
        default:
          console.warn(`No webhook processor for channel: ${channel}`)
          return null
      }
      
      // Track in analytics
      if (result && result.type === 'message') {
        await this.trackMessage(channel, 'inbound', result.session?.recipient)
      }
      
      // Process with AI if message
      if (result && result.content) {
        await this.processWithAI(result.session, result.content, channel)
      }
      
      return result
    } catch (error) {
      console.error(`Webhook processing error for ${channel}:`, error)
      throw error
    }
  }
  
  // Process message with AI chatbot
  private async processWithAI(session: any, content: string, channel: string) {
    try {
      // Get business configuration
      const business = await prisma.business.findUnique({
        where: { id: this.businessId },
        include: { knowledgeBase: true }
      })
      
      if (!business) return
      
      // TODO: Integrate with your existing AI chat processing
      // For now, we'll just save the response
      const aiResponse = await this.generateAIResponse(content, business.knowledgeBase)
      
      // Send response back through the same channel
      await this.sendMessage(channel, session.recipient, aiResponse)
      
      // Save AI response to conversation
      if (session.conversationId) {
        await prisma.message.create({
          data: {
            conversationId: session.conversationId,
            role: 'assistant',
            content: aiResponse
          }
        })
      }
    } catch (error) {
      console.error('AI processing error:', error)
      
      // Send fallback message
      const fallbackMessage = "I'm sorry, I'm having trouble understanding. Please try again or contact support."
      await this.sendMessage(channel, session.recipient, fallbackMessage)
    }
  }
  
  // Generate AI response (integrate with your existing chat logic)
  private async generateAIResponse(message: string, knowledgeBase: any[]): Promise<string> {
    // Simple keyword matching for now - replace with your AI logic
    const lowerMessage = message.toLowerCase()
    
    // Check knowledge base for matches
    for (const kb of knowledgeBase) {
      if (kb.keywords && kb.keywords.toLowerCase().includes(lowerMessage)) {
        return kb.answer
      }
    }
    
    // Default responses
    if (lowerMessage.includes('book') || lowerMessage.includes('reservation')) {
      return "I'd be happy to help you with a reservation! What dates are you looking to book?"
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('rate')) {
      return "Our rates vary by season and room type. Would you like me to check availability for specific dates?"
    }
    
    if (lowerMessage.includes('check') && (lowerMessage.includes('in') || lowerMessage.includes('out'))) {
      return "Check-in is at 3:00 PM and check-out is at 11:00 AM. Early check-in and late check-out may be available upon request."
    }
    
    return "Thank you for your message! How can I assist you with your stay today?"
  }
  
  // Track message for analytics
  private async trackMessage(channel: string, direction: 'inbound' | 'outbound', recipient?: string) {
    try {
      // Update analytics
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      await prisma.analytics.upsert({
        where: {
          businessId_date: {
            businessId: this.businessId,
            date: today
          }
        },
        update: {
          totalConversations: { increment: 1 }
        },
        create: {
          businessId: this.businessId,
          date: today,
          totalConversations: 1
        }
      })
    } catch (error) {
      console.error('Analytics tracking error:', error)
    }
  }
  
  // Get message queue status
  async getQueueStatus() {
    const [pending, failed, sent] = await Promise.all([
      prisma.messageQueue.count({
        where: {
          businessId: this.businessId,
          status: 'pending'
        }
      }),
      prisma.messageQueue.count({
        where: {
          businessId: this.businessId,
          status: 'failed',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      }),
      prisma.messageQueue.count({
        where: {
          businessId: this.businessId,
          status: 'sent',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      })
    ])
    
    return { pending, failed, sent }
  }
  
  // Process scheduled messages
  async processScheduledMessages() {
    const now = new Date()
    
    const scheduledMessages = await prisma.messageQueue.findMany({
      where: {
        businessId: this.businessId,
        status: 'pending',
        scheduledFor: {
          lte: now
        }
      },
      orderBy: [
        { priority: 'desc' },
        { scheduledFor: 'asc' }
      ],
      take: 10
    })
    
    for (const msg of scheduledMessages) {
      try {
        await this.sendMessage(msg.channel, msg.recipient, msg.message, {
          mediaUrl: msg.mediaUrl
        })
        
        await prisma.messageQueue.update({
          where: { id: msg.id },
          data: {
            status: 'sent',
            sentAt: new Date()
          }
        })
      } catch (error) {
        await prisma.messageQueue.update({
          where: { id: msg.id },
          data: {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            retries: { increment: 1 }
          }
        })
      }
    }
  }
}

export default UnifiedMessagingService