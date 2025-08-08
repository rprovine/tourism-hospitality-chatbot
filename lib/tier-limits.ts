// Tier-based feature limits and restrictions

export interface TierLimits {
  conversationsPerMonth: number | null // null = unlimited
  conversationsPerDay: number // Hard daily cap for cost protection
  knowledgeBaseItems: number | null // null = unlimited
  languagesSupported: string[]
  properties: number
  apiRequestsPerHour: number | null // null = unlimited
  apiRequestsPerDay: number // Hard daily cap
  maxTokensPerRequest: number // Claude token limit
  estimatedMonthlyCost: number // Your estimated Claude API cost
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
    conversationsPerDay: 50, // Max 50/day even within monthly limit
    knowledgeBaseItems: 50,
    languagesSupported: ['en', 'es', 'ja', 'zh', 'fr', 'de'],
    properties: 1,
    apiRequestsPerHour: null, // No API access
    apiRequestsPerDay: 0,
    maxTokensPerRequest: 200,
    estimatedMonthlyCost: 15, // ~$0.015 per conversation
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
    conversationsPerMonth: null, // Unlimited monthly
    conversationsPerDay: 500, // But max 500/day for cost protection
    knowledgeBaseItems: 1000, // Soft limit to prevent DB abuse
    languagesSupported: ['en', 'es', 'ja', 'zh', 'fr', 'de', 'pidgin'], // All basic languages + Hawaiian Pidgin
    properties: 1,
    apiRequestsPerHour: 1000,
    apiRequestsPerDay: 5000, // Hard cap: 5k/day max
    maxTokensPerRequest: 500,
    estimatedMonthlyCost: 150, // ~$0.01 per conversation
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
    conversationsPerMonth: null, // Unlimited monthly
    conversationsPerDay: 1000, // Max 1k/day
    knowledgeBaseItems: 5000, // Reasonable limit
    languagesSupported: ['en', 'es', 'ja', 'zh', 'fr', 'de', 'ko', 'pidgin', 'hawaiian'], // All languages including Hawaiian
    properties: 1,
    apiRequestsPerHour: 5000,
    apiRequestsPerDay: 10000, // 10k/day max
    maxTokensPerRequest: 1000,
    estimatedMonthlyCost: 500, // Higher quality responses
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
    conversationsPerDay: 5000, // Even enterprise has limits
    knowledgeBaseItems: 10000, // Reasonable for multi-property
    languagesSupported: ['en', 'ja', 'zh', 'es', 'ko', 'fr', 'de', 'pt', 'ru', 'ar'], // 10+ languages
    properties: 100, // Not truly unlimited
    apiRequestsPerHour: 10000, // High but not infinite
    apiRequestsPerDay: 50000, // 50k/day max
    maxTokensPerRequest: 2000,
    estimatedMonthlyCost: 2000, // Negotiate custom pricing above this
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

// Helper function to check conversation limits (BOTH daily and monthly)
export async function checkConversationLimit(
  businessId: string, 
  tier: string,
  prisma: any
): Promise<{ allowed: boolean; remaining?: number; limit?: number; reason?: string }> {
  const limits = TIER_LIMITS[tier]
  if (!limits) return { allowed: false, reason: 'Invalid tier' }
  
  // Check DAILY limit first (more important for cost control)
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  
  const todayCount = await prisma.conversation.count({
    where: {
      businessId,
      createdAt: {
        gte: startOfDay
      }
    }
  })
  
  if (todayCount >= limits.conversationsPerDay) {
    return {
      allowed: false,
      remaining: 0,
      limit: limits.conversationsPerDay,
      reason: `Daily limit reached (${limits.conversationsPerDay}/day). Resets at midnight.`
    }
  }
  
  // Check monthly limit if applicable
  if (limits.conversationsPerMonth !== null) {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const monthCount = await prisma.conversation.count({
      where: {
        businessId,
        createdAt: {
          gte: startOfMonth
        }
      }
    })
    
    if (monthCount >= limits.conversationsPerMonth) {
      return {
        allowed: false,
        remaining: 0,
        limit: limits.conversationsPerMonth,
        reason: `Monthly limit reached (${limits.conversationsPerMonth}/month)`
      }
    }
    
    return {
      allowed: true,
      remaining: Math.min(
        limits.conversationsPerDay - todayCount,
        limits.conversationsPerMonth - monthCount
      ),
      limit: limits.conversationsPerMonth
    }
  }
  
  return {
    allowed: true,
    remaining: limits.conversationsPerDay - todayCount,
    limit: limits.conversationsPerDay
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