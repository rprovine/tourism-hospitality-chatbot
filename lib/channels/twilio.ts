import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface TwilioConfig {
  accountSid: string
  authToken: string
  phoneNumber: string
  messagingServiceSid?: string
}

export class TwilioService {
  private config: TwilioConfig
  private businessId: string
  private baseUrl = 'https://api.twilio.com/2010-04-01'
  
  constructor(businessId: string, config: TwilioConfig) {
    this.businessId = businessId
    this.config = config
  }
  
  // Send SMS message
  async sendSMS(to: string, message: string, mediaUrl?: string) {
    try {
      const url = `${this.baseUrl}/Accounts/${this.config.accountSid}/Messages.json`
      
      const auth = Buffer.from(`${this.config.accountSid}:${this.config.authToken}`).toString('base64')
      
      const formData = new URLSearchParams()
      formData.append('To', to)
      formData.append('From', this.config.phoneNumber)
      formData.append('Body', message)
      
      if (mediaUrl) {
        formData.append('MediaUrl', mediaUrl)
      }
      
      if (this.config.messagingServiceSid) {
        formData.append('MessagingServiceSid', this.config.messagingServiceSid)
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to send SMS')
      }
      
      // Save to message queue
      await prisma.messageQueue.create({
        data: {
          businessId: this.businessId,
          channel: 'sms',
          recipient: to,
          message: message,
          mediaUrl: mediaUrl,
          status: 'sent',
          sentAt: new Date(),
          metadata: { 
            twilioSid: result.sid,
            twilioStatus: result.status 
          }
        }
      })
      
      return result
    } catch (error) {
      console.error('Twilio SMS error:', error)
      
      // Log failed attempt
      await prisma.messageQueue.create({
        data: {
          businessId: this.businessId,
          channel: 'sms',
          recipient: to,
          message: message,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })
      
      throw error
    }
  }
  
  // Send bulk SMS
  async sendBulkSMS(recipients: string[], message: string) {
    const results = []
    
    for (const recipient of recipients) {
      try {
        const result = await this.sendSMS(recipient, message)
        results.push({ recipient, success: true, result })
      } catch (error) {
        results.push({ 
          recipient, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    return results
  }
  
  // Process incoming SMS webhook
  async processWebhook(body: any) {
    try {
      const { 
        From, 
        To, 
        Body, 
        MessageSid, 
        NumMedia, 
        MediaUrl0, 
        MediaContentType0 
      } = body
      
      // Find or create channel session
      let session = await prisma.channelSession.findFirst({
        where: {
          businessId: this.businessId,
          channel: 'sms',
          recipient: From,
          status: 'active'
        }
      })
      
      if (!session) {
        // Find or create guest profile
        let guestProfile = await prisma.guestProfile.findFirst({
          where: {
            businessId: this.businessId,
            phone: From
          }
        })
        
        if (!guestProfile) {
          guestProfile = await prisma.guestProfile.create({
            data: {
              businessId: this.businessId,
              phone: From,
              languagePreference: 'en',
              lastVisit: new Date()
            }
          })
        }
        
        // Create conversation
        const conversation = await prisma.conversation.create({
          data: {
            businessId: this.businessId,
            sessionId: `sms_${From}_${Date.now()}`,
            userLanguage: 'en'
          }
        })
        
        // Create channel session
        session = await prisma.channelSession.create({
          data: {
            businessId: this.businessId,
            channel: 'sms',
            externalId: MessageSid,
            recipient: From,
            guestProfileId: guestProfile.id,
            conversationId: conversation.id,
            lastMessageAt: new Date()
          }
        })
      }
      
      // Save message to conversation
      if (session.conversationId) {
        const messageData: any = {
          conversationId: session.conversationId,
          role: 'user',
          content: Body,
          metadata: { 
            twilioSid: MessageSid,
            from: From,
            to: To
          }
        }
        
        // Add media if present
        if (NumMedia && parseInt(NumMedia) > 0) {
          messageData.metadata.media = {
            url: MediaUrl0,
            contentType: MediaContentType0
          }
        }
        
        await prisma.message.create({ data: messageData })
      }
      
      // Update session activity
      await prisma.channelSession.update({
        where: { id: session.id },
        data: { lastMessageAt: new Date() }
      })
      
      // Update guest interaction
      await prisma.guestInteraction.create({
        data: {
          guestProfileId: session.guestProfileId!,
          businessId: this.businessId,
          interactionType: 'sms',
          channel: 'sms',
          content: Body,
          metadata: { twilioSid: MessageSid }
        }
      })
      
      return { session, content: Body, messageId: MessageSid }
    } catch (error) {
      console.error('Twilio webhook processing error:', error)
      throw error
    }
  }
  
  // Get message status
  async getMessageStatus(messageSid: string) {
    try {
      const url = `${this.baseUrl}/Accounts/${this.config.accountSid}/Messages/${messageSid}.json`
      const auth = Buffer.from(`${this.config.accountSid}:${this.config.authToken}`).toString('base64')
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to get message status')
      }
      
      return result
    } catch (error) {
      console.error('Twilio status error:', error)
      throw error
    }
  }
  
  // Process status callback
  async processStatusCallback(body: any) {
    const { MessageSid, MessageStatus, ErrorCode, ErrorMessage } = body
    
    // Update message queue
    await prisma.messageQueue.updateMany({
      where: {
        businessId: this.businessId,
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
    
    return { messageSid: MessageSid, status: MessageStatus }
  }
  
  // Validate phone number
  async validatePhoneNumber(phoneNumber: string) {
    try {
      const url = `${this.baseUrl}/Accounts/${this.config.accountSid}/Lookups/v1/PhoneNumbers/${encodeURIComponent(phoneNumber)}`
      const auth = Buffer.from(`${this.config.accountSid}:${this.config.authToken}`).toString('base64')
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      })
      
      if (!response.ok) {
        return { valid: false, error: 'Invalid phone number' }
      }
      
      const result = await response.json()
      
      return {
        valid: true,
        nationalFormat: result.national_format,
        countryCode: result.country_code,
        carrier: result.carrier
      }
    } catch (error) {
      console.error('Phone validation error:', error)
      return { valid: false, error: 'Validation failed' }
    }
  }
  
  // Send verification code
  async sendVerificationCode(to: string, code: string) {
    const message = `Your LeniLani verification code is: ${code}. This code expires in 10 minutes.`
    return await this.sendSMS(to, message)
  }
  
  // Schedule SMS
  async scheduleSMS(to: string, message: string, sendAt: Date) {
    // Create scheduled message in queue
    await prisma.messageQueue.create({
      data: {
        businessId: this.businessId,
        channel: 'sms',
        recipient: to,
        message: message,
        status: 'pending',
        scheduledFor: sendAt,
        priority: 1
      }
    })
    
    return { scheduled: true, sendAt }
  }
}

export default TwilioService