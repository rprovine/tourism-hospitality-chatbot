import { TierFeature, PricingTier } from '@/lib/types'

export const tierComparison: TierFeature[] = [
  {
    name: 'AI-Powered Conversations',
    starter: 'Basic Q&A',
    professional: 'Advanced NLP with context',
    premium: 'Luxury concierge AI'
  },
  {
    name: 'Monthly Conversations',
    starter: '1,000',
    professional: 'Unlimited',
    premium: 'Unlimited VIP'
  },
  {
    name: 'AI Model',
    starter: 'Claude Haiku',
    professional: 'Claude Sonnet',
    premium: 'Claude Opus'
  },
  {
    name: 'Languages Supported',
    starter: 'English only',
    professional: '10+ languages',
    premium: '20+ languages'
  },
  {
    name: 'Custom Branding',
    starter: true,
    professional: true,
    premium: true
  },
  {
    name: 'Analytics Dashboard',
    starter: 'Basic metrics',
    professional: 'Advanced analytics',
    premium: 'Executive insights'
  },
  {
    name: 'Booking Integration',
    starter: false,
    professional: true,
    premium: true
  },
  {
    name: 'CRM Integration',
    starter: false,
    professional: true,
    premium: true
  },
  {
    name: 'Custom Knowledge Base',
    starter: '50 Q&As',
    professional: 'Unlimited',
    premium: 'AI-trained on your data'
  },
  {
    name: 'Response Time',
    starter: '< 3 seconds',
    professional: '< 1 second',
    premium: 'Instant'
  },
  {
    name: 'Support',
    starter: 'Email',
    professional: '24/7 Priority',
    premium: 'Dedicated manager'
  },
  {
    name: 'API Access',
    starter: false,
    professional: true,
    premium: true
  },
  {
    name: 'White Label Options',
    starter: 'Basic',
    professional: 'Full customization',
    premium: 'Bespoke design'
  },
  {
    name: 'Custom AI Training',
    starter: false,
    professional: false,
    premium: true
  },
  {
    name: 'SLA Guarantee',
    starter: false,
    professional: false,
    premium: true
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
      'Custom AI training',
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
  ]
}