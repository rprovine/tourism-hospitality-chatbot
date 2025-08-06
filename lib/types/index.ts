export interface TierFeature {
  name: string
  starter: boolean | string
  professional: boolean | string
  premium?: boolean | string
  enterprise?: boolean | string
}

export interface PricingTier {
  name: string
  price: string
  description: string
  features: string[]
  highlighted?: boolean
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

export interface ChatSession {
  id: string
  userId?: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
  metadata?: {
    userLocation?: string
    userLanguage?: string
    bookingIntent?: boolean
    satisfactionScore?: number
  }
}

export interface Analytics {
  totalConversations: number
  averageResponseTime: number
  satisfactionScore: number
  topQuestions: Array<{ question: string; count: number }>
  conversionRate: number
  activeUsers: number
  bookingsGenerated: number
  revenue: number
}

export interface Business {
  id: string
  name: string
  type: 'hotel' | 'tour_operator' | 'vacation_rental'
  tier: 'starter' | 'professional' | 'premium' | 'enterprise'
  customization: {
    primaryColor: string
    logo?: string
    welcomeMessage: string
    businessInfo: {
      address?: string
      phone?: string
      email?: string
      website?: string
      hours?: string
    }
  }
  integrations?: {
    bookingSystem?: string
    crm?: string
    analytics?: string
  }
}

export interface KnowledgeBase {
  id: string
  businessId: string
  categories: Array<{
    name: string
    questions: Array<{
      question: string
      answer: string
      keywords: string[]
    }>
  }>
  customResponses: Array<{
    trigger: string
    response: string
  }>
}