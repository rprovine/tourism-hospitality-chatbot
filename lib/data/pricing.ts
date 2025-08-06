import { TierFeature, PricingTier } from '@/lib/types'

export const tierComparison: TierFeature[] = [
  {
    name: 'AI-Powered Conversations',
    starter: 'Basic Q&A',
    professional: 'Advanced NLP with context',
    premium: 'Luxury concierge AI',
    enterprise: 'Enterprise AI suite'
  },
  {
    name: 'Monthly Conversations',
    starter: '1,000',
    professional: 'Unlimited',
    premium: 'Unlimited VIP',
    enterprise: 'Unlimited + Multi-property'
  },
  {
    name: 'AI Model',
    starter: 'Claude Haiku',
    professional: 'Claude Sonnet',
    premium: 'Claude Opus',
    enterprise: 'Claude Opus + Custom'
  },
  {
    name: 'Languages Supported',
    starter: 'English only',
    professional: '10+ languages',
    premium: '20+ languages',
    enterprise: '30+ languages'
  },
  {
    name: 'Properties/Locations',
    starter: '1',
    professional: '1',
    premium: '1',
    enterprise: 'Unlimited'
  },
  {
    name: 'Custom Branding',
    starter: true,
    professional: true,
    premium: true,
    enterprise: true
  },
  {
    name: 'Analytics Dashboard',
    starter: 'Basic metrics',
    professional: 'Advanced analytics',
    premium: 'Executive insights',
    enterprise: 'Enterprise BI suite'
  },
  {
    name: 'Booking Integration',
    starter: false,
    professional: true,
    premium: true,
    enterprise: true
  },
  {
    name: 'CRM Integration',
    starter: false,
    professional: true,
    premium: true,
    enterprise: true
  },
  {
    name: 'Custom Knowledge Base',
    starter: '50 Q&As',
    professional: 'Unlimited',
    premium: 'AI-trained on your data',
    enterprise: 'Multi-property AI training'
  },
  {
    name: 'Response Time',
    starter: '< 3 seconds',
    professional: '< 1 second',
    premium: 'Instant',
    enterprise: 'Instant + Priority'
  },
  {
    name: 'Support',
    starter: 'Email',
    professional: '24/7 Priority',
    premium: 'Dedicated manager',
    enterprise: 'Enterprise team'
  },
  {
    name: 'API Access',
    starter: false,
    professional: true,
    premium: true,
    enterprise: true
  },
  {
    name: 'White Label Options',
    starter: 'Basic',
    professional: 'Full customization',
    premium: 'Bespoke design',
    enterprise: 'Multi-brand support'
  },
  {
    name: 'Custom AI Training',
    starter: false,
    professional: false,
    premium: true,
    enterprise: true
  },
  {
    name: 'SLA Guarantee',
    starter: false,
    professional: false,
    premium: true,
    enterprise: true
  },
  {
    name: 'SSO/SAML',
    starter: false,
    professional: false,
    premium: false,
    enterprise: true
  },
  {
    name: 'Audit Logs',
    starter: false,
    professional: false,
    premium: false,
    enterprise: true
  },
  {
    name: 'Role-Based Access',
    starter: false,
    professional: 'Basic',
    premium: 'Advanced',
    enterprise: 'Full RBAC'
  }
]

export const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    price: '$299',
    description: 'Perfect for small hotels and tour operators',
    features: [
      'AI-powered guest assistance',
      '1,000 conversations/month',
      'Basic analytics dashboard',
      'Custom branding',
      'Email support',
      '50 custom Q&As',
      'Mobile responsive'
    ]
  },
  {
    name: 'Professional',
    price: '$899',
    description: 'For established hospitality businesses',
    highlighted: true,
    features: [
      'Everything in Starter, plus:',
      'Unlimited conversations',
      'Multi-language support (10+)',
      'Booking system integration',
      'CRM integration',
      'Advanced analytics & insights',
      '24/7 priority support',
      'API access',
      'Unlimited knowledge base'
    ]
  },
  {
    name: 'Premium',
    price: '$2,499',
    description: 'Luxury tier for 5-star resorts & exclusive tours',
    features: [
      'Everything in Professional, plus:',
      'Claude Opus AI model',
      'Dedicated account manager',
      'Custom AI training on your data',
      'Bespoke integrations',
      'Priority feature development',
      'Quarterly business reviews',
      '99.9% SLA guarantee',
      'Executive analytics dashboard',
      'White-glove onboarding'
    ]
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For hotel chains & resort groups',
    features: [
      'Everything in Premium, plus:',
      'Multi-property support',
      'Centralized management console',
      'SSO/SAML authentication',
      'Advanced role-based access control',
      'Custom AI model training',
      'Enterprise API with higher limits',
      'Dedicated infrastructure',
      'Compliance & audit logs',
      'Custom contract & billing',
      'Strategic advisory services',
      'Priority roadmap influence'
    ]
  }
]

export const useCases = [
  {
    title: 'Hotels & Resorts',
    description: 'Handle guest inquiries 24/7, manage bookings, and provide concierge services',
    icon: '🏨'
  },
  {
    title: 'Tour Operators',
    description: 'Answer tour questions, process bookings, and provide local recommendations',
    icon: '🚐'
  },
  {
    title: 'Vacation Rentals',
    description: 'Automate guest communication, check-in procedures, and property information',
    icon: '🏠'
  },
  {
    title: 'Hotel Chains',
    description: 'Manage multi-property operations with centralized AI and analytics',
    icon: '🏢'
  }
]

export const sampleQuestions = {
  starter: [
    'What are your check-in times?',
    'Do you have parking available?',
    'What amenities do you offer?',
    'How far are you from the beach?',
    'Do you serve breakfast?'
  ],
  professional: [
    'Book a room for next weekend',
    'What activities are available for kids?',
    'Recommend restaurants near the hotel',
    'Change my existing reservation',
    'What\'s the weather forecast?',
    'Help me plan a 3-day itinerary'
  ],
  premium: [
    'Plan a surprise anniversary celebration',
    'Arrange a private helicopter tour',
    'Book our chef\'s table experience',
    'Coordinate a multi-island luxury itinerary',
    'Arrange VIP airport transfer with lei greeting',
    'Create a personalized cultural immersion program'
  ],
  enterprise: [
    'Book conference rooms across our Maui and Oahu properties',
    'Show occupancy rates for all properties this quarter',
    'Arrange corporate retreat for 200 executives',
    'Apply my Diamond loyalty benefits to this booking',
    'Coordinate a multi-property wedding event',
    'Generate revenue optimization report for Q2',
    'Manage group booking for international conference'
  ]
}