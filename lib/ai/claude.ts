import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export interface ConversationContext {
  businessName: string
  businessType: string
  tier: 'starter' | 'professional' | 'premium' | 'enterprise'
  welcomeMessage?: string
  businessInfo?: any
  isDemo?: boolean // Flag to indicate if this is a demo bot
  previousMessages?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  knowledgeBase?: Array<{
    question: string
    answer: string
    category: string
    score: number
  }>
}

export async function generateClaudeResponse(
  userMessage: string,
  context: ConversationContext
): Promise<string> {
  // If no API key, fall back to rule-based responses
  if (!process.env.ANTHROPIC_API_KEY) {
    return generateFallbackResponse(userMessage, context.tier, context.isDemo || false)
  }

  try {
    const systemPrompt = createSystemPrompt(context)
    
    // Build conversation history
    const messages: Anthropic.MessageParam[] = []
    
    // Add previous messages if they exist
    if (context.previousMessages && context.previousMessages.length > 0) {
      for (const msg of context.previousMessages) {
        messages.push({
          role: msg.role,
          content: msg.content
        })
      }
    }
    
    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    })

    // Select model based on tier
    let model: string
    let maxTokens: number
    
    switch(context.tier) {
      case 'enterprise':
        model = 'claude-3-5-sonnet-20241022'  // Latest and most capable model for enterprise
        maxTokens = 2000  // Maximum context for complex operations
        break
      case 'premium':
        model = 'claude-3-5-sonnet-20241022'  // Latest and most capable model for premium
        maxTokens = 1000
        break
      case 'professional':
        model = 'claude-3-5-sonnet-20241022'  // Latest model for professional tier
        maxTokens = 500
        break
      default: // starter
        model = 'claude-3-5-haiku-20241022'  // Fast, economical model for starter
        maxTokens = 200
    }

    const response = await anthropic.messages.create({
      model: model,
      max_tokens: maxTokens,
      temperature: context.tier === 'enterprise' || context.tier === 'premium' ? 0.8 : 0.7, // More creative for premium/enterprise
      system: systemPrompt,
      messages: messages
    })

    return response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'I apologize, but I encountered an issue processing your request. Please try again.'
      
  } catch (error) {
    console.error('Claude API error:', error)
    // Fall back to rule-based response if API fails
    return generateFallbackResponse(userMessage, context.tier, context.isDemo || false)
  }
}

function createSystemPrompt(context: ConversationContext): string {
  // Include knowledge base context if available
  let knowledgeContext = ''
  if (context.knowledgeBase && context.knowledgeBase.length > 0) {
    knowledgeContext = '\n\nRelevant Information from Knowledge Base:\n'
    context.knowledgeBase.forEach(item => {
      knowledgeContext += `\nQ: ${item.question}\nA: ${item.answer}\n`
    })
    knowledgeContext += '\nUse the above knowledge base information to provide accurate, business-specific answers when relevant.\n'
  }

  // Add demo mode instructions only if this is a demo
  const demoInstructions = context.isDemo ? `
IMPORTANT: You are in DEMO MODE. Always end your responses with:
"[🔸 Demo Mode: Using sample data. In production, this would show YOUR actual business information.]"
` : ''

  const basePrompt = `You are an AI assistant for ${context.businessName}, a ${context.businessType.replace('_', ' ')} in Hawaii.

Your role is to provide helpful, friendly, and accurate information to guests and potential customers.
${demoInstructions}
Business Context:
- Business Type: ${context.businessType}
- Service Tier: ${context.tier}
${context.businessInfo ? `- Business Info: ${JSON.stringify(context.businessInfo)}` : ''}
${knowledgeContext}
Guidelines:
1. Always be warm, welcoming, and professional
2. Use "Aloha" spirit in your responses
3. If you don't know something, politely suggest contacting the business directly
4. Keep responses concise but helpful
5. ${context.isDemo ? 'Include the demo mode disclaimer at the end of every response' : 'Provide accurate, business-specific information'}
6. For the ${context.tier} tier, ${
    context.tier === 'enterprise'
      ? 'provide enterprise-grade concierge service with multi-property coordination, group booking management, corporate travel arrangements, and seamless integration across all business units'
      : context.tier === 'premium'
      ? 'provide luxury concierge-level service with highly personalized, detailed recommendations, proactive suggestions, and VIP treatment'
      : context.tier === 'professional'
      ? 'provide detailed, personalized responses with specific recommendations and offer to help with bookings'
      : 'provide basic information and general assistance'
  }

Specific capabilities by tier:
`

  if (context.tier === 'enterprise') {
    return basePrompt + `
- Manage multi-property operations and cross-property bookings
- Coordinate large group bookings and corporate events
- Handle complex loyalty program inquiries and tier benefits
- Provide real-time inventory management across all properties
- Offer advanced revenue optimization suggestions
- Manage corporate travel arrangements and contracts
- Coordinate with multiple departments simultaneously
- Access and manage centralized guest profiles
- Handle VIP and C-suite executive arrangements
- Provide detailed business intelligence and reporting
- Manage crisis situations and emergency protocols
- Coordinate international travel and visa requirements
- Handle meeting and conference planning for 500+ attendees
- Integrate with enterprise systems (PMS, CRM, ERP)
- Provide multi-language support for global guests
- Offer predictive analytics for guest preferences
- Manage strategic partnerships and alliances`
  } else if (context.tier === 'premium') {
    return basePrompt + `
- Provide white-glove, luxury concierge service
- Create bespoke, highly personalized itineraries
- Offer exclusive experiences and VIP access
- Arrange private tours, chefs, and luxury transportation
- Provide detailed cultural insights and local expertise
- Anticipate needs and make proactive suggestions
- Handle complex multi-day trip planning
- Coordinate with partner businesses for seamless experiences
- Remember guest preferences across conversations
- Offer insider tips and hidden gems known only to locals
- Arrange special occasions (proposals, anniversaries, celebrations)
- Provide 24/7 assistance mindset`
  } else if (context.tier === 'professional') {
    return basePrompt + `
- Offer to make reservations and bookings
- Provide detailed local recommendations
- Give personalized activity suggestions
- Share real-time availability (simulated)
- Offer concierge-level service
- Provide weather updates and local insights
- Help with itinerary planning
- Answer complex questions about amenities and services`
  } else {
    return basePrompt + `
- Answer basic questions about check-in/check-out times
- Provide general property information
- Share standard amenities details
- Give basic local information
- Direct complex queries to contact the business`
  }
}

function generateFallbackResponse(query: string, tier: 'starter' | 'professional' | 'premium' | 'enterprise', isDemo: boolean = false): string {
  const lowerQuery = query.toLowerCase()
  const disclaimer = isDemo ? "\n\n[🔸 Demo Mode: Using sample data. In production, this would show YOUR actual business information.]" : ""
  
  // For production accounts, provide helpful but generic responses
  if (!isDemo) {
    return `I'd be happy to help you with that. Please let me know more details about what you're looking for, and I'll provide you with the best information available.`
  }
  
  // Common queries handled differently by tier
  if (lowerQuery.includes('book') || lowerQuery.includes('reserve') || lowerQuery.includes('availability')) {
    if (tier === 'starter') {
      return `To make a reservation, please contact us directly or visit our website. We'll be happy to help you find the perfect accommodation for your stay.`
    } else if (tier === 'professional') {
      return `I can help you check availability and make a reservation. What dates are you looking to stay with us? I'll check our current availability and provide you with options that best suit your needs.`
    } else if (tier === 'premium') {
      return `✨ **VIP Concierge Booking Service**\n\n🤖 **AI-Powered Recommendations** (Based on your preferences):\n\n⭐ **Perfect Match - Presidential Suite**\n• $1,250/night (15% loyalty discount applied)\n• Your preferences: Ocean view ✓ High floor ✓ Away from elevators ✓\n• Includes: Butler service, spa credits, airport transfer\n\n🎁 **Exclusive Perks**:\n• Guaranteed 10 AM early check-in\n• 4 PM late checkout\n• Welcome champagne & local delicacies\n• Private beach cabana\n\n[Book with Saved Card ****1234] [Use 4,850 Points]${disclaimer}`
    } else {
      return `🏢 **Enterprise Multi-Property Booking**\n\n📊 **Cross-Property Availability** (7 Properties):\n\n**Waikiki Beach Resort** - 142 rooms available\n• Standard: $380-450/night\n• Suites: $850-2,500/night\n• Group blocks: Up to 200 rooms\n\n**Maui Grand Hotel** - 89 rooms available\n• Standard: $420-550/night\n• Villas: $1,200-3,500/night\n\n**Corporate Travel Program**:\n• Negotiated rates: 35% off BAR\n• Direct billing to cost centers\n• Automated expense reporting\n\n🎯 **Group Coordination**: Handle 50-500+ attendees\n📱 **One-Click Booking**: Across all properties\n\nHow many rooms across which properties?${disclaimer}`
    }
  }
  
  if (lowerQuery.includes('check') && (lowerQuery.includes('in') || lowerQuery.includes('out'))) {
    if (tier === 'starter') {
      return `Check-in time is 3:00 PM and check-out is 11:00 AM.${disclaimer}`
    } else if (tier === 'professional') {
      return `Standard check-in is 3:00 PM and check-out is 11:00 AM.\n\n📱 **Mobile Check-In Available**: Skip the front desk!\n⏰ **Early/Late Options**: Subject to availability ($50 fee)${disclaimer}`
    } else if (tier === 'premium') {
      return `✨ **VIP Check-In Privileges**:\n• Guaranteed early check-in: 10:00 AM\n• Guaranteed late checkout: 4:00 PM\n• Private check-in lounge with refreshments\n• Luggage service and room escort\n• Welcome amenity waiting in room\n\nNo additional fees - included with your premium booking!${disclaimer}`
    } else {
      return `🏢 **Enterprise Flexible Policies**:\n• 24/7 check-in/out available\n• Bulk check-ins for groups\n• Custom times for corporate contracts\n• Automated digital key distribution\n• Dedicated group check-in areas\n\nNeed to coordinate a group arrival?${disclaimer}`
    }
  }
  
  if (lowerQuery.includes('my') || lowerQuery.includes('history') || lowerQuery.includes('previous stay')) {
    if (tier === 'starter') {
      return `❌ **Guest History Not Available**\n\nStarter plan doesn't include CRM integration. Please call (808) 555-0100 for assistance.\n\n💡 **Upgrade to Professional** for full guest profile access!${disclaimer}`
    } else if (tier === 'professional') {
      return `👤 **Guest Profile Found**\n\n📊 Your History:\n• Last stay: Sept 2024 (Ocean View Room)\n• Total stays: 3\n• Loyalty points: 2,450\n• Preferred: High floor, away from elevators\n\n🎁 **Returning Guest Offer**: 15% off your next stay!${disclaimer}`
    } else if (tier === 'premium') {
      return `⭐ **VIP Guest Recognition**\n\n🏆 **Platinum Member** - Sarah Johnson\n• Member since: 2019\n• Lifetime stays: 12\n• Total spent: $18,500\n• Points balance: 48,500\n\n✨ **Your Preferences** (Auto-Applied):\n• Room: Ocean view, high floor, king bed\n• Pillow: Memory foam (2)\n• Minibar: Stocked with Fiji water, local fruits\n• Newspaper: WSJ delivered daily\n• Spa: Hot stone massage on Day 2\n\n🎁 **Exclusive Offers**:\n• Complimentary suite upgrade available\n• 25% off spa treatments\n• Private beach dinner setup ($500 value)${disclaimer}`
    } else {
      return `🏢 **Enterprise Global Profile**\n\n🌍 **Cross-Property Analytics**:\n• Properties stayed: 23 locations\n• Corporate tier: Executive Diamond\n• 2024 spend: $125,000\n• Department: Marketing (Cost Center: MKT-4521)\n\n📊 **Booking Patterns**:\n• Average stay: 3.2 nights\n• Preferred brands: Luxury & Business\n• Team travelers: 12 frequent colleagues\n\n💼 **Corporate Benefits**:\n• Automatic C-suite upgrades\n• Direct billing enabled\n• Expense report integration\n• Global lounge access\n• 24/7 executive support line${disclaimer}`
    }
  }
  
  if (lowerQuery.includes('restaurant') || lowerQuery.includes('dining') || lowerQuery.includes('eat')) {
    if (tier === 'starter') {
      return `We have 3 restaurants on property. For reservations, please call (808) 555-0100.${disclaimer}`
    } else if (tier === 'professional') {
      return `🍽️ **Restaurant Availability**:\n\n**Ocean Terrace** (Fine Dining)\n• Tonight: 6:30 PM, 8:00 PM available\n• Tomorrow: Multiple times\n\n**Sunset Grill** (Casual)\n• Walk-ins welcome\n\n**Pool Bar** (Light Bites)\n• Open until 10 PM\n\nWould you like me to make a reservation?${disclaimer}`
    } else if (tier === 'premium') {
      return `🌟 **Curated Dining Experiences**\n\n⭐ **Chef's Table** (Based on your preferences)\n• Private 7-course tasting menu\n• Wine pairing included\n• Meet Chef Nakamura\n• Tonight 7:30 PM - Reserved for you\n\n🦞 **Your Usual Favorites**:\n• Table 12 at Ocean Terrace (your preferred spot)\n• Lobster thermidor (prepared your way)\n• 2018 Caymus Cabernet (we have 3 bottles)\n\n🎁 **VIP Perks**:\n• No reservation needed - always a table\n• 20% off all dining\n• Complimentary champagne\n• Custom menu available${disclaimer}`
    } else {
      return `🏢 **Enterprise Dining Network**\n\n📍 **47 Restaurants Across Properties**:\n\n**Fine Dining** (12 locations)\n• Instant reservations at all locations\n• Private dining rooms available\n• Custom menus for groups\n\n**Group Events**:\n• Banquet capacity: Up to 1,000 guests\n• 15 event spaces available\n• Full catering services\n• A/V equipment included\n\n💼 **Corporate Dining**:\n• Direct billing to departments\n• Meal allowance tracking\n• Dietary restriction management\n• VIP client entertainment options\n\nNeed to book for a group or event?${disclaimer}`
    }
  }
  
  // Default responses by tier
  if (tier === 'starter') {
    return `I can help with basic information about our property. For specific requests or bookings, please call (808) 555-0100.\n\n⚠️ **Starter Plan**: Limited to basic Q&A${disclaimer}`
  } else if (tier === 'professional') {
    if (lowerQuery.includes('recommend') || lowerQuery.includes('what to do')) {
      return `Based on popular guest activities, I'd recommend:

1. **Morning**: Visit Pearl Harbor (8 AM - 12 PM)
2. **Lunch**: Try Rainbow Drive-In for authentic plate lunch
3. **Afternoon**: Snorkel at Hanauma Bay (1 PM - 4 PM)
4. **Evening**: Sunset dinner at Duke's Waikiki

Would you like me to help arrange any of these activities or make reservations?${disclaimer}`
    }
    return `I can help you with bookings, recommendations, and answer questions about our amenities. What would you like to know?${disclaimer}`
  } else if (tier === 'premium') {
    return `Welcome to your personal AI concierge! I have access to your preferences, can make instant reservations, coordinate exclusive experiences, and ensure every detail of your stay exceeds expectations. How may I create magic for you today?${disclaimer}`
  } else {
    return `Welcome to our enterprise hospitality platform. I can coordinate multi-property bookings, manage group events, handle corporate travel, and provide comprehensive business intelligence. Which property or service would you like to access?${disclaimer}`
  }
}

export { generateFallbackResponse }