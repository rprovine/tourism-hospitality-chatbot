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
  customPrompt?: string // Custom instructions from AI settings
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
  context: ConversationContext,
  preferredModel?: string
): Promise<string> {
  // If no API key, fall back to rule-based responses
  if (!process.env.ANTHROPIC_API_KEY) {
    return generateFallbackResponse(userMessage, context.tier, context.isDemo || false, context.businessInfo)
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

    // Select model based on user preference and tier restrictions
    let model: string
    let maxTokens: number
    
    // Map user preference to actual model names
    const modelMap: Record<string, string> = {
      'haiku': 'claude-3-5-haiku-20241022',
      'sonnet': 'claude-3-5-sonnet-20241022', 
      'opus': 'claude-3-opus-20240229'
    }
    
    // Get allowed models based on tier
    const tierAllowedModels = {
      'starter': ['haiku'],
      'professional': ['haiku', 'sonnet'], 
      'premium': ['haiku', 'sonnet', 'opus'],
      'enterprise': ['haiku', 'sonnet', 'opus']
    }
    
    const allowedForTier = tierAllowedModels[context.tier] || ['haiku']
    const requestedModel = preferredModel || 'haiku'
    
    // Use preferred model if allowed by tier, otherwise fall back to cheapest allowed
    const selectedModel = allowedForTier.includes(requestedModel) ? requestedModel : allowedForTier[0]
    model = modelMap[selectedModel]
    
    // Set token limits based on tier
    switch(context.tier) {
      case 'enterprise':
        maxTokens = 2000
        break
      case 'premium':
        maxTokens = 1000
        break
      case 'professional':
        maxTokens = 500
        break
      default: // starter
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
    return generateFallbackResponse(userMessage, context.tier, context.isDemo || false, context.businessInfo)
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

  // Parse business info for easier access
  let businessDetails = ''
  if (context.businessInfo) {
    const info = context.businessInfo as any
    businessDetails = `
IMPORTANT Business Information (USE THIS DATA IN YOUR RESPONSES):
`
    // Contact and Location
    if (info.phone) businessDetails += `- Phone: ${info.phone}\n`
    if (info.email || info.contactEmail) businessDetails += `- Email: ${info.email || info.contactEmail}\n`
    if (info.website) businessDetails += `- Website: ${info.website}\n`
    if (info.address) businessDetails += `- Address: ${info.address}\n`
    if (info.city) businessDetails += `- City: ${info.city}\n`
    if (info.state) businessDetails += `- State: ${info.state}\n`
    if (info.zip) businessDetails += `- ZIP: ${info.zip}\n`
    
    // Operating Hours
    if (info.checkInTime) businessDetails += `- Check-in Time: ${info.checkInTime}\n`
    if (info.checkOutTime) businessDetails += `- Check-out Time: ${info.checkOutTime}\n`
    if (info.frontDeskHours) businessDetails += `- Front Desk Hours: ${info.frontDeskHours}\n`
    
    // Amenities (Key amenities that should be displayed)
    if (info.parking) businessDetails += `- Parking: ${info.parking}\n`
    if (info.wifi) businessDetails += `- WiFi: ${info.wifi}\n`
    if (info.breakfast) businessDetails += `- Breakfast: ${info.breakfast}\n`
    if (info.pool) businessDetails += `- Pool: ${info.pool}\n`
    if (info.gym) businessDetails += `- Gym/Fitness: ${info.gym}\n`
    if (info.restaurant) businessDetails += `- Restaurant: ${info.restaurant}\n`
    
    // Policies
    if (info.cancellationPolicy) businessDetails += `- Cancellation Policy: ${info.cancellationPolicy}\n`
    if (info.petPolicy) businessDetails += `- Pet Policy: ${info.petPolicy}\n`
    if (info.smokingPolicy) businessDetails += `- Smoking Policy: ${info.smokingPolicy}\n`
    
    // Additional Info
    if (info.airportDistance) businessDetails += `- Airport Distance: ${info.airportDistance}\n`
    if (info.beachDistance) businessDetails += `- Beach Distance: ${info.beachDistance}\n`
    if (info.numberOfRooms) businessDetails += `- Number of Rooms: ${info.numberOfRooms}\n`
    if (info.yearEstablished) businessDetails += `- Established: ${info.yearEstablished}\n`
    if (info.acceptedPayments && Array.isArray(info.acceptedPayments)) {
      businessDetails += `- Accepted Payments: ${info.acceptedPayments.join(', ')}\n`
    }
    
    businessDetails += `
You MUST use the above business information when answering guest questions. For example:
- If asked about check-in, use the exact check-in time provided above
- If asked about contact info, use the phone/email provided above
- If asked about amenities, list ALL the amenities mentioned above in a clear, organized format
- When someone asks "What amenities do you offer?" provide a comprehensive list of all available amenities
- Always be specific and use the exact details provided in the business information
`
  }

  // Add custom instructions if provided
  const customInstructions = context.customPrompt ? `
CUSTOM INSTRUCTIONS FROM BUSINESS OWNER:
${context.customPrompt}

` : ''

  const basePrompt = `You are an AI assistant for ${context.businessName}, a ${context.businessType.replace('_', ' ')} in Hawaii.

Your role is to provide helpful, friendly, and accurate information to guests and potential customers.
${demoInstructions}
Business Context:
- Business Type: ${context.businessType}
- Service Tier: ${context.tier}
${businessDetails}
${customInstructions}
${knowledgeContext}
CRITICAL INSTRUCTIONS:
1. YOU MUST use ALL the business information provided above in your responses when relevant
2. When asked about amenities, list ALL amenities from the business information above
3. When asked about policies, use the exact policy details provided above
4. When asked about contact info, use the phone/email provided above
5. Combine information from BOTH the business details AND knowledge base naturally
6. Create conversational, helpful responses that incorporate all relevant data

Response Guidelines:
1. Always be warm, welcoming, and professional with Aloha spirit
2. ${context.isDemo ? 'Include the demo mode disclaimer at the end of every response' : `When information is not available:
   - First check if you have partial information to share
   - Offer to collect contact information for follow-up
   - Provide the contact methods from business info above
   - Be helpful and solution-oriented`}
3. Keep responses concise but comprehensive
4. Reference specific business details (hours, amenities, policies) naturally in context
5. For the ${context.tier} tier, ${
    context.tier === 'enterprise'
      ? 'provide enterprise-grade concierge service with multi-property coordination, group booking management, corporate travel arrangements, and seamless integration across all business units'
      : context.tier === 'premium'
      ? 'provide luxury concierge-level service with highly personalized, detailed recommendations, proactive suggestions, and VIP treatment'
      : context.tier === 'professional'
      ? 'provide detailed, personalized responses with specific recommendations and offer to help with bookings'
      : 'provide helpful information and assistance using all available business data'
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

function generateFallbackResponse(query: string, tier: 'starter' | 'professional' | 'premium' | 'enterprise', isDemo: boolean = false, businessInfo?: any): string {
  const lowerQuery = query.toLowerCase()
  const disclaimer = isDemo ? "\n\n[🔸 Demo Mode: Using sample data. In production, this would show YOUR actual business information.]" : ""
  
  // If businessInfo is provided and query matches a known field, use it
  if (businessInfo) {
    const info = businessInfo
    if (lowerQuery.includes('check') && lowerQuery.includes('in') && !lowerQuery.includes('out')) {
      if (info.checkInTime) {
        return `Check-in time is ${info.checkInTime}. ${info.frontDeskHours ? `Front desk hours: ${info.frontDeskHours}.` : 'Our front desk is available to assist you.'} ${info.phone ? `For early check-in requests, please call ${info.phone}.` : ''}${disclaimer}`
      }
    }
    if (lowerQuery.includes('check') && lowerQuery.includes('out')) {
      if (info.checkOutTime) {
        return `Check-out time is ${info.checkOutTime}. Late check-out may be available upon request. ${info.phone ? `Please call ${info.phone} to inquire about late check-out.` : ''}${disclaimer}`
      }
    }
    if ((lowerQuery.includes('phone') || lowerQuery.includes('call') || lowerQuery.includes('contact')) && info.phone) {
      return `You can reach us at ${info.phone}. ${info.frontDeskHours ? `Front desk hours: ${info.frontDeskHours}.` : 'We\'re here to help!'}${disclaimer}`
    }
    if (lowerQuery.includes('email') && (info.email || info.contactEmail)) {
      return `Our email is ${info.email || info.contactEmail}. We typically respond within 2-4 hours during business hours.${disclaimer}`
    }
    if ((lowerQuery.includes('address') || lowerQuery.includes('location') || lowerQuery.includes('where')) && info.address) {
      const fullAddress = `${info.address}${info.city ? ', ' + info.city : ''}${info.state ? ', ' + info.state : ''}${info.zip ? ' ' + info.zip : ''}`
      return `We're located at ${fullAddress}. ${info.airportDistance ? `We are ${info.airportDistance} from the airport.` : ''} ${info.beachDistance ? `The beach is ${info.beachDistance} away.` : ''}${disclaimer}`
    }
    if (lowerQuery.includes('parking') && info.parking) {
      return `${info.parking}${disclaimer}`
    }
    if ((lowerQuery.includes('wifi') || lowerQuery.includes('wi-fi') || lowerQuery.includes('internet')) && info.wifi) {
      return `${info.wifi}${disclaimer}`
    }
    if (lowerQuery.includes('breakfast') && info.breakfast) {
      return `${info.breakfast}${disclaimer}`
    }
    if (lowerQuery.includes('pool') && info.pool) {
      return `${info.pool}${disclaimer}`
    }
    if ((lowerQuery.includes('gym') || lowerQuery.includes('fitness')) && info.gym) {
      return `${info.gym}${disclaimer}`
    }
    if ((lowerQuery.includes('restaurant') || lowerQuery.includes('dining')) && info.restaurant) {
      return `${info.restaurant}${disclaimer}`
    }
    // Handle general amenities query
    if (lowerQuery.includes('amenities') || (lowerQuery.includes('what') && lowerQuery.includes('offer'))) {
      let amenitiesList = []
      if (info.parking) amenitiesList.push(`• Parking: ${info.parking}`)
      if (info.wifi) amenitiesList.push(`• WiFi: ${info.wifi}`)
      if (info.breakfast) amenitiesList.push(`• Breakfast: ${info.breakfast}`)
      if (info.pool) amenitiesList.push(`• Pool: ${info.pool}`)
      if (info.gym) amenitiesList.push(`• Gym/Fitness: ${info.gym}`)
      if (info.restaurant) amenitiesList.push(`• Restaurant: ${info.restaurant}`)
      
      if (amenitiesList.length > 0) {
        return `Here are our amenities:\n\n${amenitiesList.join('\n')}\n\n${info.phone ? `For more information about any of our amenities, please call ${info.phone}.` : 'We\'re here to make your stay comfortable!'}${disclaimer}`
      } else {
        return `I'd be happy to tell you about our amenities. Please contact us directly for a complete list of services and facilities. ${info.phone ? `Call us at ${info.phone} for more details.` : ''}${disclaimer}`
      }
    }
    if (lowerQuery.includes('cancel') && info.cancellationPolicy) {
      return `${info.cancellationPolicy}${disclaimer}`
    }
    if ((lowerQuery.includes('pet') || lowerQuery.includes('dog') || lowerQuery.includes('cat')) && info.petPolicy) {
      return `${info.petPolicy}${disclaimer}`
    }
    if (lowerQuery.includes('smok') && info.smokingPolicy) {
      return `${info.smokingPolicy}${disclaimer}`
    }
  }
  
  // For production accounts, provide helpful response that acknowledges the limitation
  if (!isDemo) {
    // Check if they're asking about contact info
    if (lowerQuery.includes('contact') || lowerQuery.includes('phone') || lowerQuery.includes('email') || lowerQuery.includes('call')) {
      return `I'd be happy to help you get in touch with our team. While I'm still learning about all our services, our staff can answer any specific questions you have. 

Would you like to leave your contact information so someone can reach out to you directly? Just let me know your name and preferred contact method (phone or email).`
    }
    
    // For general queries without a knowledge base match
    return `I don't have that specific information in my knowledge base yet, but I'd love to help you get the answer you need.

You have a few options:
1. Leave your contact information here and I'll have someone from our team reach out to you
2. Call us directly for immediate assistance
3. Send us an email with your question

Which would you prefer? I'm here to make sure you get the information you're looking for.`
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
      return `❌ **Guest History Not Available**\n\nStarter plan doesn't include CRM integration. Please call 815-641-6689 for assistance.\n\n💡 **Upgrade to Professional** for full guest profile access!${disclaimer}`
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
      return `We have 3 restaurants on property. For reservations, please call 815-641-6689.${disclaimer}`
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
    return `I can help with basic information about our property. For specific requests or bookings, please call 815-641-6689.\n\n⚠️ **Starter Plan**: Limited to basic Q&A${disclaimer}`
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