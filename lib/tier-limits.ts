// Tier-based feature limits and restrictions

export interface TierLimits {
  conversationsPerMonth: number | null // null = unlimited
  knowledgeBaseItems: number | null // null = unlimited
  languagesSupported: string[]
  properties: number
  apiRequestsPerHour: number | null // null = unlimited
  features: {
    bookingIntegration: boolean
    crmIntegration: boolean
    apiAccess: boolean
    customAITraining: boolean
    slaGuarantee: boolean
    sso: boolean
    auditLogs: boolean
    roleBasedAccess: 'none' | 'basic' | 'advanced' | 'full'
    analytics: 'basic' | 'advanced' | 'executive' | 'enterprise'
    support: 'email' | 'priority' | 'dedicated' | 'enterprise'
  }
}

export const TIER_LIMITS: Record<string, TierLimits> = {
  starter: {
    conversationsPerMonth: 1000,
    knowledgeBaseItems: 50,
    languagesSupported: ['en'],
    properties: 1,
    apiRequestsPerHour: null, // No API access
    features: {
      bookingIntegration: false,
      crmIntegration: false,
      apiAccess: false,
      customAITraining: false,
      slaGuarantee: false,
      sso: false,
      auditLogs: false,
      roleBasedAccess: 'none',
      analytics: 'basic',
      support: 'email'
    }
  },
  professional: {
    conversationsPerMonth: null, // Unlimited
    knowledgeBaseItems: null, // Unlimited
    languagesSupported: ['en', 'ja'], // English, Japanese
    properties: 1,
    apiRequestsPerHour: 1000,
    features: {
      bookingIntegration: true,
      crmIntegration: true,
      apiAccess: true,
      customAITraining: false,
      slaGuarantee: false,
      sso: false,
      auditLogs: false,
      roleBasedAccess: 'basic',
      analytics: 'advanced',
      support: 'priority'
    }
  },
  premium: {
    conversationsPerMonth: null, // Unlimited
    knowledgeBaseItems: null, // Unlimited with AI training
    languagesSupported: ['en', 'ja', 'zh', 'es', 'ko'], // English, Japanese, Chinese, Spanish, Korean
    properties: 1,
    apiRequestsPerHour: 5000,
    features: {
      bookingIntegration: true,
      crmIntegration: true,
      apiAccess: true,
      customAITraining: true,
      slaGuarantee: true,
      sso: false,
      auditLogs: false,
      roleBasedAccess: 'advanced',
      analytics: 'executive',
      support: 'dedicated'
    }
  },
  enterprise: {
    conversationsPerMonth: null, // Unlimited
    knowledgeBaseItems: null, // Unlimited with multi-property AI training
    languagesSupported: ['en', 'ja', 'zh', 'es', 'ko', 'fr', 'de', 'pt', 'ru', 'ar'], // 10+ languages
    properties: null, // Unlimited
    apiRequestsPerHour: null, // Unlimited
    features: {
      bookingIntegration: true,
      crmIntegration: true,
      apiAccess: true,
      customAITraining: true,
      slaGuarantee: true,
      sso: true,
      auditLogs: true,
      roleBasedAccess: 'full',
      analytics: 'enterprise',
      support: 'enterprise'
    }
  }
}

// Helper function to check if a feature is available for a tier
export function hasFeature(tier: string, feature: keyof TierLimits['features']): boolean {
  const limits = TIER_LIMITS[tier]
  if (!limits) return false
  return limits.features[feature] === true || 
         (typeof limits.features[feature] === 'string' && limits.features[feature] !== 'none')
}

// Helper function to check conversation limits
export async function checkConversationLimit(
  businessId: string, 
  tier: string,
  prisma: any
): Promise<{ allowed: boolean; remaining?: number; limit?: number }> {
  const limits = TIER_LIMITS[tier]
  if (!limits) return { allowed: false }
  
  // No limit for this tier
  if (limits.conversationsPerMonth === null) {
    return { allowed: true }
  }
  
  // Count conversations this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  
  const conversationCount = await prisma.conversation.count({
    where: {
      businessId,
      createdAt: {
        gte: startOfMonth
      }
    }
  })
  
  const remaining = limits.conversationsPerMonth - conversationCount
  
  return {
    allowed: conversationCount < limits.conversationsPerMonth,
    remaining: Math.max(0, remaining),
    limit: limits.conversationsPerMonth
  }
}

// Helper function to check knowledge base limits
export async function checkKnowledgeBaseLimit(
  businessId: string,
  tier: string,
  prisma: any
): Promise<{ allowed: boolean; remaining?: number; limit?: number }> {
  const limits = TIER_LIMITS[tier]
  if (!limits) return { allowed: false }
  
  // No limit for this tier
  if (limits.knowledgeBaseItems === null) {
    return { allowed: true }
  }
  
  // Count knowledge base items
  const itemCount = await prisma.knowledgeBase.count({
    where: { businessId }
  })
  
  const remaining = limits.knowledgeBaseItems - itemCount
  
  return {
    allowed: itemCount < limits.knowledgeBaseItems,
    remaining: Math.max(0, remaining),
    limit: limits.knowledgeBaseItems
  }
}

// Helper function to check if language is supported
export function isLanguageSupported(tier: string, language: string): boolean {
  const limits = TIER_LIMITS[tier]
  if (!limits) return false
  return limits.languagesSupported.includes(language)
}

// Helper function to get supported languages for a tier
export function getSupportedLanguages(tier: string): string[] {
  const limits = TIER_LIMITS[tier]
  if (!limits) return ['en']
  return limits.languagesSupported
}

// Helper function to check API rate limits
export async function checkApiRateLimit(
  businessId: string,
  tier: string,
  prisma: any
): Promise<{ allowed: boolean; remaining?: number; limit?: number }> {
  const limits = TIER_LIMITS[tier]
  if (!limits) return { allowed: false }
  
  // No API access for this tier
  if (!limits.features.apiAccess) {
    return { allowed: false }
  }
  
  // No rate limit for this tier
  if (limits.apiRequestsPerHour === null) {
    return { allowed: true }
  }
  
  // Count API requests in the last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  
  const requestCount = await prisma.apiLog.count({
    where: {
      businessId,
      createdAt: {
        gte: oneHourAgo
      }
    }
  })
  
  const remaining = limits.apiRequestsPerHour - requestCount
  
  return {
    allowed: requestCount < limits.apiRequestsPerHour,
    remaining: Math.max(0, remaining),
    limit: limits.apiRequestsPerHour
  }
}