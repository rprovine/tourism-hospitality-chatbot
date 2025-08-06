import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export interface ConversationContext {
  businessName: string
  businessType: string
  tier: 'starter' | 'professional' | 'premium'
  welcomeMessage?: string
  businessInfo?: any
  previousMessages?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

export async function generateClaudeResponse(
  userMessage: string,
  context: ConversationContext
): Promise<string> {
  // If no API key, fall back to rule-based responses
  if (!process.env.ANTHROPIC_API_KEY) {
    return generateFallbackResponse(userMessage, context.tier)
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
      case 'premium':
        model = 'claude-3-opus-20240229'  // Most capable model for premium tier
        maxTokens = 1000
        break
      case 'professional':
        model = 'claude-3-sonnet-20240229'  // Balanced model for professional tier
        maxTokens = 500
        break
      default: // starter
        model = 'claude-3-haiku-20240307'  // Fast, economical model for starter
        maxTokens = 200
    }

    const response = await anthropic.messages.create({
      model: model,
      max_tokens: maxTokens,
      temperature: context.tier === 'premium' ? 0.8 : 0.7, // Slightly more creative for premium
      system: systemPrompt,
      messages: messages
    })

    return response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'I apologize, but I encountered an issue processing your request. Please try again.'
      
  } catch (error) {
    console.error('Claude API error:', error)
    // Fall back to rule-based response if API fails
    return generateFallbackResponse(userMessage, context.tier)
  }
}

function createSystemPrompt(context: ConversationContext): string {
  const basePrompt = `You are an AI assistant for ${context.businessName}, a ${context.businessType.replace('_', ' ')} in Hawaii.

Your role is to provide helpful, friendly, and accurate information to guests and potential customers.

Business Context:
- Business Type: ${context.businessType}
- Service Tier: ${context.tier}
${context.businessInfo ? `- Business Info: ${JSON.stringify(context.businessInfo)}` : ''}

Guidelines:
1. Always be warm, welcoming, and professional
2. Use "Aloha" spirit in your responses
3. If you don't know something, politely suggest contacting the business directly
4. Keep responses concise but helpful
5. For the ${context.tier} tier, ${
    context.tier === 'premium'
      ? 'provide luxury concierge-level service with highly personalized, detailed recommendations, proactive suggestions, and VIP treatment'
      : context.tier === 'professional'
      ? 'provide detailed, personalized responses with specific recommendations and offer to help with bookings'
      : 'provide basic information and general assistance'
  }

Specific capabilities by tier:
`

  if (context.tier === 'premium') {
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

function generateFallbackResponse(query: string, tier: 'starter' | 'professional'): string {
  const lowerQuery = query.toLowerCase()
  
  if (tier === 'starter') {
    // Basic pattern matching for common questions
    if (lowerQuery.includes('check') && (lowerQuery.includes('in') || lowerQuery.includes('out'))) {
      return 'Check-in time is 3:00 PM and check-out is 11:00 AM. Early check-in may be available upon request.'
    }
    if (lowerQuery.includes('parking')) {
      return 'We offer both self-parking ($25/day) and valet parking ($35/day). Electric vehicle charging stations are available.'
    }
    if (lowerQuery.includes('breakfast') || lowerQuery.includes('food')) {
      return 'Continental breakfast is served from 6:30 AM to 10:30 AM in our Ocean View Restaurant.'
    }
    if (lowerQuery.includes('wifi') || lowerQuery.includes('internet')) {
      return 'Complimentary high-speed WiFi is available throughout the property.'
    }
    if (lowerQuery.includes('pool') || lowerQuery.includes('swim')) {
      return 'Our resort features two pools: an infinity pool overlooking the ocean and a family pool with water slides. Both are open from 7 AM to 10 PM.'
    }
    if (lowerQuery.includes('gym') || lowerQuery.includes('fitness')) {
      return 'Our fitness center is open 24/7 and includes cardio equipment, free weights, and yoga mats.'
    }
    return "I'd be happy to help! For specific questions, please contact our front desk at (808) 555-0100."
  } else {
    // Professional tier fallback responses
    if (lowerQuery.includes('book') || lowerQuery.includes('reserve')) {
      return "I can help you make a reservation! What dates were you looking to stay with us? I can check availability and provide you with our best rates. We currently have ocean view rooms starting at $450/night."
    }
    if (lowerQuery.includes('recommend') || lowerQuery.includes('what to do')) {
      return `Based on popular guest activities, I'd recommend:

1. **Morning**: Visit Pearl Harbor (8 AM - 12 PM)
2. **Lunch**: Try Rainbow Drive-In for authentic plate lunch
3. **Afternoon**: Snorkel at Hanauma Bay (1 PM - 4 PM)
4. **Evening**: Sunset dinner at Duke's Waikiki

Would you like me to help arrange any of these activities or make reservations?`
    }
    if (lowerQuery.includes('weather')) {
      return "Today's forecast shows sunny skies with a high of 82°F (28°C) and gentle trade winds. Perfect beach weather! UV index is high (9), so sunscreen is essential. Ocean conditions are calm with 1-2 ft waves - ideal for swimming and snorkeling."
    }
    if (lowerQuery.includes('restaurant')) {
      return `I'd be happy to make restaurant recommendations!

**Fine Dining**:
• La Mer - French cuisine with ocean views
• Orchids - Sunday brunch destination

**Local Favorites**:
• Helena's Hawaiian Food - James Beard Award winner
• Ono Seafood - Best poke on the island

Would you like me to make a reservation or provide directions?`
    }
    if (lowerQuery.includes('airport') || lowerQuery.includes('transport')) {
      return `From Honolulu Airport (HNL) to our resort:

• **Taxi/Uber**: $35-45, 25 minutes
• **Shared Shuttle**: $16/person, 35-45 minutes
• **Private Car Service**: $85, can be arranged through concierge
• **Rental Car**: Available at airport, valet parking at resort

Would you like me to arrange transportation for your arrival?`
    }
    return `I understand you're asking about ${query}. Let me provide you with detailed information. Based on your question, I can help with specific recommendations, make reservations, or connect you with the right department. How would you like me to assist you further?`
  }
}

export { generateFallbackResponse }