import { TierFeature, PricingTier } from '@/lib/types'

export const tierComparison: TierFeature[] = [
  {
    name: 'AI-Powered Conversations',
    starter: 'AI-Powered FAQ Bot - Claude Haiku answers from your Q&A pairs, limited conversation memory',
    professional: 'Smart Q&A AI - Claude Sonnet answers from your Q&A database with full conversation context',
    premium: 'Document-Trained Concierge - Claude Sonnet learns from your PDFs/websites, personalized responses',
    enterprise: 'Enterprise Intelligence Hub - Multi-property AI brain, learns from all interactions, predictive insights'
  },
  {
    name: 'Monthly Conversations',
    starter: '1,000',
    professional: 'Unlimited',
    premium: 'Unlimited VIP',
    enterprise: 'Unlimited + Multi-property'
  },
  {
    name: 'AI Model & Intelligence',
    starter: 'Claude Haiku by Anthropic - Superior to generic chatbots, fast responses (200 tokens)',
    professional: 'Claude 3.5 Sonnet - Industry-leading AI, outperforms GPT-4 for hospitality (500 tokens)',
    premium: 'Claude 3.5 Sonnet Enhanced - Document learning + business intelligence (1000 tokens)',
    enterprise: 'Claude 3.5 Sonnet Enterprise - Custom models per property, unlimited potential (2000 tokens)'
  },
  {
    name: 'Languages Supported',
    starter: 'English only',
    professional: 'English & Japanese',
    premium: '5 languages (choose any)',
    enterprise: '10+ languages'
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
    name: 'Analytics & Insights',
    starter: 'Basic Dashboard - Daily chat count, most asked questions list',
    professional: 'Advanced Analytics - Conversation trends, satisfaction scores, peak hours, language distribution',
    premium: 'Executive Intelligence - ROI calculator, revenue attribution, AI-powered strategic recommendations',
    enterprise: 'Enterprise Command Center - Cross-property benchmarking, predictive demand forecasting, market intelligence'
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
    name: 'Knowledge Management',
    starter: '100 Q&A Pairs - Type each question & answer manually, no bulk import',
    professional: 'Unlimited Q&A Pairs - Bulk CSV import, API sync, but still Q&A format only',
    premium: 'Document Intelligence - Upload PDFs/websites, AI auto-extracts & learns from content',
    enterprise: 'Multi-Property Knowledge Network - Central policies + location-specific details, cross-property insights'
  },
  {
    name: 'Support & Service',
    starter: 'Email Support - 48-hour response time, self-service resources',
    professional: '24/7 Priority Support - Live chat, 1-hour response SLA, phone support',
    premium: 'Dedicated Success Manager - Weekly strategy calls, custom team training, priority feature requests',
    enterprise: 'Enterprise Success Team - On-site implementation, quarterly business reviews, C-level advisory'
  },
  {
    name: 'API Access',
    starter: false,
    professional: true,
    premium: true,
    enterprise: true
  },
  {
    name: 'Customization',
    starter: 'Basic Branding - Upload logo, pick colors, edit welcome greeting',
    professional: 'Advanced Customization - Custom widget themes, conversation flow builder, tone of voice settings',
    premium: 'White-Label Experience - Fully branded UI, custom email templates, personalized guest journeys',
    enterprise: 'Multi-Brand Management - Unique branding per property, regional adaptations, franchise support'
  },
  {
    name: 'AI Training Method',
    starter: 'Manual Q&A Entry - Type each FAQ pair individually, AI answers from these only',
    professional: 'Smart Q&A System - Bulk import + AI-suggested answers based on patterns',
    premium: 'AI Document Learning - Upload any PDF/website, AI reads & learns from actual content',
    enterprise: 'Adaptive Learning Network - Multi-property knowledge sharing, learns from all interactions'
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
  },
  {
    name: 'Setup Time',
    starter: 'Instant (automated)',
    professional: 'Instant (automated)',
    premium: '2-3 business days',
    enterprise: '5-10 business days'
  },
  {
    name: 'Deployment Method',
    starter: 'Self-service',
    professional: 'Self-service',
    premium: 'Assisted onboarding',
    enterprise: 'White-glove setup'
  },
  {
    name: 'Annual Pricing',
    starter: 'Save 2 months (20% off)',
    professional: 'Save 2 months (20% off)',
    premium: 'Save 3 months (25% off)',
    enterprise: 'Custom discounts'
  },
  {
    name: 'Money-Back Guarantee',
    starter: '14-day free trial',
    professional: '14-day free trial',
    premium: '30-day guarantee',
    enterprise: 'ROI guarantee'
  }
]

export const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    price: '$299',
    description: 'Perfect for small hotels and tour operators',
    savings: 'Save 2-3 staff hours daily',
    features: [
      'AI-powered guest assistance',
      '1,000 conversations/month',
      'Basic analytics dashboard',
      'Custom branding',
      'Email support',
      '50 custom Q&As',
      'Mobile responsive',
      '⚡ Instant activation after payment',
      '💰 Pay annually: $2,390/year (save $598)'
    ]
  },
  {
    name: 'Professional',
    price: '$699',
    originalPrice: '$899',
    description: 'For established hospitality businesses',
    highlighted: true,
    savings: 'Save $4,000+/month in staff costs',
    features: [
      'Everything in Starter, plus:',
      'Unlimited conversations',
      'English & Japanese support',
      'Booking system integration',
      'CRM integration',
      'Advanced analytics & insights',
      '24/7 priority support',
      'API access',
      'Unlimited knowledge base',
      '⚡ Instant activation after payment',
      '💰 Pay annually: $5,590/year (save $1,798)'
    ]
  },
  {
    name: 'Premium',
    price: '$2,499',
    description: 'Luxury tier for 5-star resorts & exclusive tours',
    savings: '15-30% increase in direct bookings',
    features: [
      'Everything in Professional, plus:',
      '5 language support (choose from 10)',
      'Claude 3.5 Sonnet (1000 tokens)',
      'Dedicated account manager',
      'Custom AI training on your data',
      'Bespoke integrations',
      'Priority feature development',
      'Quarterly business reviews',
      '99.9% SLA guarantee',
      'Executive analytics dashboard',
      'White-glove onboarding ($2,000 value)',
      'Quarterly strategy consulting sessions',
      'Custom AI training workshop for your team',
      'Priority feature development',
      '🎯 2-3 days setup with full customization',
      '💰 Pay annually: $22,490/year (save $7,498)'
    ]
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For hotel chains & resort groups',
    savings: 'ROI within 60 days guaranteed',
    features: [
      'Everything in Premium, plus:',
      'Multi-language support (10+ languages)',
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
      'Priority roadmap influence',
      '🏢 5-10 days full integration & training'
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
    title: 'Boutique Hotels',
    description: 'Personalized guest experiences with local charm and unique property features',
    icon: '🏩'
  },
  {
    title: 'Tour Operators',
    description: 'Answer tour questions, process bookings, and provide local recommendations',
    icon: '🚐'
  },
  {
    title: 'Adventure Tours',
    description: 'Manage outdoor activities, safety info, and equipment rentals for thrill-seekers',
    icon: '🏄'
  },
  {
    title: 'Vacation Rentals',
    description: 'Automate guest communication, check-in procedures, and property information',
    icon: '🏠'
  },
  {
    title: 'Luxury Villas',
    description: 'White-glove service for high-end properties with exclusive amenities',
    icon: '🏝️'
  }
]

export const sampleQuestions = {
  starter: [
    'What are your check-in times?',
    'Do you have parking available?',
    'Can I book a room for tonight?',
    'How far are you from the beach?',
    'Check my previous stay history'
  ],
  professional: [
    'Book a room for next weekend',
    'Show my guest history and preferences',
    'What rooms are available tonight?',
    'Check my loyalty points balance',
    'Apply my returning guest discount',
    'I need to modify my reservation'
  ],
  premium: [
    'Book my usual suite with all my preferences',
    'Show personalized recommendations for my stay',
    'Apply my VIP benefits and upgrades',
    'Arrange private dining on the beach',
    'What exclusive experiences are available?',
    'Use my saved payment method to book'
  ],
  enterprise: [
    'Book rooms for my team across multiple properties',
    'Show my company\'s negotiated rates',
    'Arrange a 200-person conference next month',
    'Check my full travel history and patterns',
    'Generate expense report for my stays',
    'Apply Microsoft corporate agreement pricing',
    'Show cost savings vs public rates'
  ]
}