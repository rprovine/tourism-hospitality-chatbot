import { PrismaClient } from '@prisma/client'
import { UnifiedMessagingService } from '../channels/unified-messaging'
import { OpenAIService } from '../ai/openai-service'
import { SentimentAnalyzer } from '../ai/sentiment-analyzer'

interface AbandonmentContext {
  conversationId: string
  guestProfileId?: string
  lastTopic?: string
  bookingIntent?: any
  abandonedAt: Date
  conversationDuration: number
  messagesCount: number
  lastSentiment?: number
}

interface RecoveryStrategy {
  id: string
  type: 'immediate' | 'delayed' | 'multi-touch' | 'personalized'
  channel: 'email' | 'sms' | 'whatsapp' | 'push' | 'retargeting'
  delay: number // minutes
  message: string
  incentive?: {
    type: 'discount' | 'upgrade' | 'addon' | 'points'
    value: number
    description: string
    code?: string
    expiresIn?: number // hours
  }
  priority: number
  estimatedRecoveryRate: number
}

interface RecoveryMetrics {
  totalAbandoned: number
  totalRecovered: number
  recoveryRate: number
  averageRecoveryTime: number
  revenueRecovered: number
  topRecoveryReasons: string[]
  channelPerformance: Record<string, number>
}

export class AbandonmentRecoveryEngine {
  private prisma: PrismaClient
  private messaging: UnifiedMessagingService
  private openAI: OpenAIService
  private sentimentAnalyzer: SentimentAnalyzer
  
  constructor(
    prisma: PrismaClient,
    messaging?: UnifiedMessagingService,
    openAI?: OpenAIService
  ) {
    this.prisma = prisma
    this.messaging = messaging || new UnifiedMessagingService(prisma)
    this.openAI = openAI || new OpenAIService()
    this.sentimentAnalyzer = new SentimentAnalyzer(this.openAI)
  }
  
  // Detect and track abandonment
  async detectAbandonment(conversationId: string): Promise<AbandonmentContext | null> {
    try {
      // Get conversation details
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          contexts: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      })
      
      if (!conversation) return null
      
      const context = conversation.contexts[0]
      const lastMessage = conversation.messages[0]
      
      // Check if conversation is abandoned (no activity for 10+ minutes)
      const minutesSinceLastMessage = 
        (Date.now() - lastMessage.createdAt.getTime()) / (1000 * 60)
      
      if (minutesSinceLastMessage < 10) {
        return null // Still active
      }
      
      // Check if already marked as abandoned or completed
      if (context?.abandonedAt || context?.completedAt) {
        return null
      }
      
      // Analyze last messages for sentiment
      const lastUserMessage = conversation.messages.find(m => m.role === 'user')
      let lastSentiment = 0
      
      if (lastUserMessage) {
        const sentiment = await this.sentimentAnalyzer.analyzeMessage(lastUserMessage.content)
        lastSentiment = sentiment.score
      }
      
      // Calculate conversation metrics
      const duration = 
        (conversation.messages[0].createdAt.getTime() - 
         conversation.messages[conversation.messages.length - 1].createdAt.getTime()) / 
        (1000 * 60)
      
      const abandonmentContext: AbandonmentContext = {
        conversationId,
        guestProfileId: context?.guestProfileId || undefined,
        lastTopic: context?.lastTopic || undefined,
        bookingIntent: context?.bookingIntent || undefined,
        abandonedAt: new Date(),
        conversationDuration: duration,
        messagesCount: conversation.messages.length,
        lastSentiment
      }
      
      // Mark as abandoned in database
      if (context) {
        await this.prisma.conversationContext.update({
          where: { id: context.id },
          data: { abandonedAt: new Date() }
        })
      }
      
      return abandonmentContext
    } catch (error) {
      console.error('Abandonment detection error:', error)
      return null
    }
  }
  
  // Generate recovery strategy
  async generateRecoveryStrategy(
    context: AbandonmentContext
  ): Promise<RecoveryStrategy[]> {
    const strategies: RecoveryStrategy[] = []
    
    // Immediate recovery for high-intent abandonment
    if (context.bookingIntent) {
      strategies.push({
        id: 'immediate_booking_recovery',
        type: 'immediate',
        channel: 'email',
        delay: 30, // 30 minutes
        message: await this.generateRecoveryMessage(context, 'booking_reminder'),
        incentive: {
          type: 'discount',
          value: 10,
          description: '10% off your booking',
          code: 'COMEBACK10',
          expiresIn: 24
        },
        priority: 10,
        estimatedRecoveryRate: 0.25
      })
      
      // Follow-up if not recovered
      strategies.push({
        id: 'followup_booking_recovery',
        type: 'delayed',
        channel: 'sms',
        delay: 1440, // 24 hours
        message: await this.generateRecoveryMessage(context, 'last_chance'),
        incentive: {
          type: 'discount',
          value: 15,
          description: '15% off - Last chance!',
          code: 'SAVE15',
          expiresIn: 48
        },
        priority: 8,
        estimatedRecoveryRate: 0.15
      })
    }
    
    // Question abandonment recovery
    if (context.lastTopic && !context.bookingIntent) {
      strategies.push({
        id: 'question_followup',
        type: 'delayed',
        channel: 'email',
        delay: 120, // 2 hours
        message: await this.generateRecoveryMessage(context, 'helpful_followup'),
        priority: 6,
        estimatedRecoveryRate: 0.1
      })
    }
    
    // Negative sentiment recovery
    if (context.lastSentiment && context.lastSentiment < -0.3) {
      strategies.push({
        id: 'service_recovery',
        type: 'immediate',
        channel: 'email',
        delay: 15, // 15 minutes
        message: await this.generateRecoveryMessage(context, 'service_recovery'),
        incentive: {
          type: 'upgrade',
          value: 0,
          description: 'Complimentary room upgrade',
          expiresIn: 72
        },
        priority: 9,
        estimatedRecoveryRate: 0.3
      })
    }
    
    // Multi-touch campaign for high-value prospects
    if (context.conversationDuration > 10 && context.messagesCount > 5) {
      strategies.push({
        id: 'multi_touch_campaign',
        type: 'multi-touch',
        channel: 'email',
        delay: 60,
        message: await this.generateRecoveryMessage(context, 'personalized'),
        priority: 7,
        estimatedRecoveryRate: 0.2
      })
    }
    
    // Sort by priority
    return strategies.sort((a, b) => b.priority - a.priority)
  }
  
  // Generate personalized recovery message
  private async generateRecoveryMessage(
    context: AbandonmentContext,
    template: string
  ): Promise<string> {
    const templates: Record<string, string> = {
      booking_reminder: `Hi! We noticed you were looking at making a reservation. ` +
                       `Is there anything we can help you with? We'd love to welcome you to our property. ` +
                       `As a thank you for coming back, here's a special offer just for you.`,
      
      last_chance: `Don't miss out! Your special rate is expiring soon. ` +
                   `Complete your booking in the next 48 hours to secure your discount. ` +
                   `We're here to help if you have any questions.`,
      
      helpful_followup: `Hi again! We wanted to make sure we answered all your questions about ${context.lastTopic || 'your inquiry'}. ` +
                       `Our team is here to help make your stay perfect. Feel free to reach out anytime!`,
      
      service_recovery: `We're sorry if your experience wasn't what you expected. ` +
                       `Your satisfaction is our top priority. We'd like to make things right ` +
                       `and ensure your next interaction with us exceeds your expectations.`,
      
      personalized: `We miss you! It's been a while since we chatted. ` +
                   `We have some exciting updates and special offers that we think you'll love. ` +
                   `Come back and see what's new!`
    }
    
    // Use AI to personalize if available
    if (this.openAI.isConfigured() && context.guestProfileId) {
      try {
        const prompt = `Personalize this recovery message based on the context:

Template: ${templates[template]}
Last Topic: ${context.lastTopic || 'general inquiry'}
Sentiment: ${context.lastSentiment || 'neutral'}
Booking Intent: ${context.bookingIntent ? 'Yes' : 'No'}

Create a warm, personalized version that:
1. References their specific interest
2. Maintains a helpful, non-pushy tone
3. Includes a clear call to action

Personalized message:`
        
        const personalized = await this.openAI.createChatCompletion(
          [
            {
              role: 'system',
              content: 'You are a hospitality expert creating recovery messages for abandoned conversations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          {
            temperature: 0.7,
            maxTokens: 200
          }
        )
        
        return personalized
      } catch (error) {
        console.error('Failed to personalize message:', error)
      }
    }
    
    return templates[template] || templates.personalized
  }
  
  // Execute recovery campaign
  async executeRecovery(
    strategy: RecoveryStrategy,
    recipientId: string
  ): Promise<boolean> {
    try {
      // Get recipient contact info
      const guestProfile = await this.prisma.guestProfile.findUnique({
        where: { id: recipientId }
      })
      
      if (!guestProfile) return false
      
      const recipient = 
        strategy.channel === 'email' ? guestProfile.email :
        strategy.channel === 'sms' || strategy.channel === 'whatsapp' ? guestProfile.phone :
        null
      
      if (!recipient) return false
      
      // Schedule message
      await this.messaging.sendMessage(
        strategy.channel as any,
        recipient,
        strategy.message,
        {
          scheduledFor: new Date(Date.now() + strategy.delay * 60 * 1000),
          metadata: {
            type: 'abandonment_recovery',
            strategyId: strategy.id,
            incentive: strategy.incentive
          }
        }
      )
      
      // Track recovery attempt
      await this.prisma.triggerMessage.create({
        data: {
          businessId: guestProfile.businessId,
          name: strategy.id,
          triggerType: 'abandonment',
          message: strategy.message,
          delay: strategy.delay,
          channel: strategy.channel,
          sentCount: 1
        }
      })
      
      return true
    } catch (error) {
      console.error('Recovery execution error:', error)
      return false
    }
  }
  
  // Track recovery success
  async trackRecoverySuccess(
    conversationId: string,
    strategyId: string,
    revenue?: number
  ): Promise<void> {
    try {
      // Mark conversation as recovered
      const context = await this.prisma.conversationContext.findFirst({
        where: { conversationId }
      })
      
      if (context) {
        await this.prisma.conversationContext.update({
          where: { id: context.id },
          data: {
            completedAt: new Date(),
            followUpSent: true
          }
        })
      }
      
      // Update trigger message metrics
      const trigger = await this.prisma.triggerMessage.findFirst({
        where: { name: strategyId }
      })
      
      if (trigger) {
        await this.prisma.triggerMessage.update({
          where: { id: trigger.id },
          data: {
            conversionCount: trigger.conversionCount + 1
          }
        })
      }
      
      console.log('Recovery success tracked:', {
        conversationId,
        strategyId,
        revenue
      })
    } catch (error) {
      console.error('Failed to track recovery success:', error)
    }
  }
  
  // Get recovery metrics
  async getRecoveryMetrics(
    businessId: string,
    period: 'day' | 'week' | 'month'
  ): Promise<RecoveryMetrics> {
    try {
      const periodDays = period === 'day' ? 1 : period === 'week' ? 7 : 30
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - periodDays)
      
      // Get abandonment and recovery data
      const contexts = await this.prisma.conversationContext.findMany({
        where: {
          conversation: {
            businessId
          },
          createdAt: {
            gte: startDate
          }
        }
      })
      
      const abandoned = contexts.filter(c => c.abandonedAt)
      const recovered = contexts.filter(c => c.abandonedAt && c.completedAt)
      
      // Calculate metrics
      const recoveryRate = abandoned.length > 0 
        ? recovered.length / abandoned.length 
        : 0
      
      const avgRecoveryTime = recovered.length > 0
        ? recovered.reduce((sum, c) => {
            const time = c.completedAt!.getTime() - c.abandonedAt!.getTime()
            return sum + time
          }, 0) / recovered.length / (1000 * 60 * 60) // hours
        : 0
      
      // Get trigger message performance
      const triggers = await this.prisma.triggerMessage.findMany({
        where: {
          businessId,
          triggerType: 'abandonment'
        }
      })
      
      const channelPerformance: Record<string, number> = {}
      triggers.forEach(t => {
        const rate = t.sentCount > 0 ? t.conversionCount / t.sentCount : 0
        channelPerformance[t.channel] = rate
      })
      
      return {
        totalAbandoned: abandoned.length,
        totalRecovered: recovered.length,
        recoveryRate,
        averageRecoveryTime: avgRecoveryTime,
        revenueRecovered: recovered.length * 350, // Estimate
        topRecoveryReasons: [
          'Booking assistance needed',
          'Price concerns addressed',
          'Questions answered'
        ],
        channelPerformance
      }
    } catch (error) {
      console.error('Failed to get recovery metrics:', error)
      return {
        totalAbandoned: 0,
        totalRecovered: 0,
        recoveryRate: 0,
        averageRecoveryTime: 0,
        revenueRecovered: 0,
        topRecoveryReasons: [],
        channelPerformance: {}
      }
    }
  }
  
  // Automated recovery workflow
  async runAutomatedRecovery(businessId: string): Promise<void> {
    try {
      // Find recent conversations
      const conversations = await this.prisma.conversation.findMany({
        where: {
          businessId,
          status: 'active',
          updatedAt: {
            lt: new Date(Date.now() - 10 * 60 * 1000) // 10+ minutes old
          }
        },
        include: {
          contexts: true
        }
      })
      
      for (const conversation of conversations) {
        // Check if already processed
        if (conversation.contexts.some(c => c.abandonedAt || c.completedAt)) {
          continue
        }
        
        // Detect abandonment
        const abandonmentContext = await this.detectAbandonment(conversation.id)
        
        if (abandonmentContext) {
          // Generate recovery strategies
          const strategies = await this.generateRecoveryStrategy(abandonmentContext)
          
          // Execute top strategy
          if (strategies.length > 0 && abandonmentContext.guestProfileId) {
            await this.executeRecovery(
              strategies[0],
              abandonmentContext.guestProfileId
            )
          }
        }
      }
    } catch (error) {
      console.error('Automated recovery error:', error)
    }
  }
}

export default AbandonmentRecoveryEngine