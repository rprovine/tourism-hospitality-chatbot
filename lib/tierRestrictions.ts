// Tier-based feature restrictions

export const TIER_FEATURES = {
  starter: {
    conversationsPerMonth: 100,
    knowledgeBaseItems: 50,
    channels: ['web'],
    analytics: 'basic',
    aiModels: ['claude-haiku', 'gpt-3.5-turbo'],
    multiLanguage: false,
    customBranding: false,
    apiAccess: false,
    revenue: false,
    guests: false,
    upselling: false,
    recovery: false,
    channels_config: false,
    maxTeamMembers: 1,
    webhooks: false,
    whiteLabel: false,
    prioritySupport: false,
    exportData: false,
    integrations: false
  },
  professional: {
    conversationsPerMonth: 1000,
    knowledgeBaseItems: 500,
    channels: ['web', 'whatsapp', 'sms'],
    analytics: 'advanced',
    aiModels: ['claude-haiku', 'claude-sonnet', 'gpt-3.5-turbo', 'gpt-4'],
    multiLanguage: true,
    customBranding: true,
    apiAccess: false,
    revenue: true,
    guests: true,
    upselling: true,
    recovery: true,
    channels_config: true,
    maxTeamMembers: 5,
    webhooks: false,
    whiteLabel: false,
    prioritySupport: true,
    exportData: true,
    integrations: true
  },
  premium: {
    conversationsPerMonth: -1, // unlimited
    knowledgeBaseItems: -1, // unlimited
    channels: ['web', 'whatsapp', 'sms', 'instagram', 'facebook'],
    analytics: 'enterprise',
    aiModels: ['claude-haiku', 'claude-sonnet', 'claude-opus', 'gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
    multiLanguage: true,
    customBranding: true,
    apiAccess: true,
    revenue: true,
    guests: true,
    upselling: true,
    recovery: true,
    channels_config: true,
    maxTeamMembers: -1, // unlimited
    webhooks: true,
    whiteLabel: true,
    prioritySupport: true,
    exportData: true,
    integrations: true
  }
}

export const RESTRICTED_ROUTES = {
  starter: [
    '/revenue',
    '/guests',
    '/channels'
  ],
  professional: [],
  premium: []
}

export function hasFeatureAccess(tier: string, feature: keyof typeof TIER_FEATURES.starter): boolean {
  const tierConfig = TIER_FEATURES[tier as keyof typeof TIER_FEATURES]
  if (!tierConfig) return false
  
  const value = tierConfig[feature]
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

export function getTierLimit(tier: string, feature: keyof typeof TIER_FEATURES.starter): any {
  const tierConfig = TIER_FEATURES[tier as keyof typeof TIER_FEATURES]
  if (!tierConfig) return null
  return tierConfig[feature]
}

export function isRouteAccessible(tier: string, route: string): boolean {
  const restricted = RESTRICTED_ROUTES[tier as keyof typeof RESTRICTED_ROUTES]
  if (!restricted) return true
  
  // Check if route starts with any restricted path
  return !restricted.some(restrictedRoute => route.startsWith(restrictedRoute))
}

export function getUpgradeMessage(feature: string): string {
  const messages: Record<string, string> = {
    revenue: 'Revenue optimization is available in Professional and Premium plans',
    guests: 'Guest profiles are available in Professional and Premium plans',
    channels: 'Multi-channel integration is available in Professional and Premium plans',
    knowledge_base_limit: 'You\'ve reached your knowledge base limit. Upgrade to add more items',
    conversations_limit: 'You\'ve reached your monthly conversation limit. Upgrade for more conversations',
    ai_models: 'Advanced AI models are available in higher tiers'
  }
  
  return messages[feature] || 'This feature requires an upgrade to a higher plan'
}