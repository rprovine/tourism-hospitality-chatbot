import { TierFeature, PricingTier } from '@/lib/types'

export const tierComparison: TierFeature[] = [
  {
    name: 'AI-Powered Conversations',
    starter: 'Basic Q&A',
    professional: 'Advanced NLP with context'
  },
  {
    name: 'Monthly Conversations',
    starter: '1,000',
    professional: 'Unlimited'
  },
  {
    name: 'Languages Supported',
    starter: 'English only',
    professional: '10+ languages'
  },
  {
    name: 'Custom Branding',
    starter: true,
    professional: true
  },
  {
    name: 'Analytics Dashboard',
    starter: 'Basic metrics',
    professional: 'Advanced analytics'
  },
  {
    name: 'Booking Integration',
    starter: false,
    professional: true
  },
  {
    name: 'CRM Integration',
    starter: false,
    professional: true
  },
  {
    name: 'Custom Knowledge Base',
    starter: '50 Q&As',
    professional: 'Unlimited'
  },
  {
    name: 'Response Time',
    starter: '< 3 seconds',
    professional: '< 1 second'
  },
  {
    name: 'Support',
    starter: 'Email',
    professional: '24/7 Priority'
  },
  {
    name: 'API Access',
    starter: false,
    professional: true
  },
  {
    name: 'White Label Options',
    starter: 'Basic',
    professional: 'Full customization'
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
  ]
}