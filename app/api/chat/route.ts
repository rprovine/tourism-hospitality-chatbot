import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const messageSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string(),
  businessId: z.string().optional(),
  tier: z.enum(['starter', 'professional']).default('starter'),
  conversationId: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = messageSchema.parse(body)
    
    // Get or create conversation
    let conversation
    if (validatedData.conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: validatedData.conversationId },
        include: { business: true }
      })
    } else {
      // For demo purposes, use a default business or create one
      let business = validatedData.businessId 
        ? await prisma.business.findUnique({ where: { id: validatedData.businessId } })
        : await prisma.business.findFirst({ where: { email: 'demo@example.com' } })
      
      if (!business) {
        // Create demo business if it doesn't exist
        business = await prisma.business.create({
          data: {
            email: 'demo@example.com',
            password: 'demo',
            name: 'Demo Resort Hawaii',
            type: 'hotel',
            tier: validatedData.tier
          }
        })
      }
      
      conversation = await prisma.conversation.create({
        data: {
          businessId: business.id,
          sessionId: validatedData.sessionId,
          metadata: {
            tier: validatedData.tier,
            timestamp: new Date().toISOString()
          }
        },
        include: { business: true }
      })
    }
    
    // Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: validatedData.message
      }
    })
    
    // Generate AI response based on tier
    const aiResponse = await generateAIResponse(
      validatedData.message, 
      conversation.business.tier as 'starter' | 'professional'
    )
    
    // Save AI response
    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: aiResponse
      }
    })
    
    return NextResponse.json({
      conversationId: conversation.id,
      message: assistantMessage.content,
      tier: conversation.business.tier
    })
    
  } catch (error) {
    console.error('Chat API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generateAIResponse(query: string, tier: 'starter' | 'professional'): Promise<string> {
  const lowerQuery = query.toLowerCase()
  
  // Check knowledge base first
  const knowledgeBase = await prisma.knowledgeBase.findMany({
    where: {
      isActive: true,
      OR: [
        { question: { contains: lowerQuery } },
        { keywords: { contains: lowerQuery } }
      ]
    },
    take: 1
  })
  
  if (knowledgeBase.length > 0) {
    return knowledgeBase[0].answer
  }
  
  // Fallback to tier-based responses
  if (tier === 'starter') {
    if (lowerQuery.includes('check') && lowerQuery.includes('in')) {
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
    // Professional tier with more advanced responses
    if (lowerQuery.includes('book') || lowerQuery.includes('reserve')) {
      return "I can help you make a reservation! What dates were you looking to stay with us? I can check availability and provide you with our best rates. We currently have ocean view rooms starting at $450/night."
    }
    if (lowerQuery.includes('recommend') || lowerQuery.includes('what to do')) {
      return "Based on your interests, I'd recommend:\n\n1. **Morning**: Visit Pearl Harbor (8 AM - 12 PM)\n2. **Lunch**: Try Rainbow Drive-In for authentic plate lunch\n3. **Afternoon**: Snorkel at Hanauma Bay (1 PM - 4 PM)\n4. **Evening**: Sunset dinner at Duke's Waikiki\n\nWould you like me to help arrange any of these activities or make reservations?"
    }
    if (lowerQuery.includes('weather')) {
      return "Today's forecast shows sunny skies with a high of 82°F (28°C) and gentle trade winds. Perfect beach weather! UV index is high (9), so sunscreen is essential. Ocean conditions are calm with 1-2 ft waves - ideal for swimming and snorkeling."
    }
    if (lowerQuery.includes('restaurant')) {
      return "I'd be happy to make restaurant recommendations!\n\n**Fine Dining**:\n• La Mer - French cuisine with ocean views\n• Orchids - Sunday brunch destination\n\n**Local Favorites**:\n• Helena's Hawaiian Food - James Beard Award winner\n• Ono Seafood - Best poke on the island\n\nWould you like me to make a reservation or provide directions?"
    }
    if (lowerQuery.includes('airport') || lowerQuery.includes('transport')) {
      return "From Honolulu Airport (HNL) to our resort:\n\n• **Taxi/Uber**: $35-45, 25 minutes\n• **Shared Shuttle**: $16/person, 35-45 minutes\n• **Private Car Service**: $85, can be arranged through concierge\n• **Rental Car**: Available at airport, valet parking at resort\n\nWould you like me to arrange transportation for your arrival?"
    }
    if (lowerQuery.includes('spa') || lowerQuery.includes('massage')) {
      return "Our Serenity Spa offers:\n\n• **Lomi Lomi Massage**: Traditional Hawaiian, 60/90 min\n• **Hot Stone Therapy**: Volcanic stones, 75 min\n• **Couples Packages**: Private suite with ocean views\n• **Facials**: Using local ingredients like noni and kukui\n\nSpa hours: 9 AM - 9 PM. Would you like to book a treatment?"
    }
    return `I understand you're asking about ${query}. Let me provide you with detailed information. Based on your question, I can help with specific recommendations, make reservations, or connect you with the right department. How would you like me to assist you further?`
  }
}