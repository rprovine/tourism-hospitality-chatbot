import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { generateClaudeResponse } from '@/lib/ai/claude'
import { searchKnowledgeBase } from '@/lib/ai/knowledge-base-search'

const prisma = new PrismaClient()

const messageSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string(),
  businessId: z.string(),
  conversationId: z.string().nullable().optional()
})

// CORS headers for widget
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = messageSchema.parse(body)
    
    // Get business details
    const business = await prisma.business.findUnique({
      where: { id: validatedData.businessId }
    })
    
    if (!business) {
      return NextResponse.json(
        { error: 'Invalid business ID' },
        { status: 404, headers: corsHeaders }
      )
    }
    
    // Get or create conversation
    let conversation
    if (validatedData.conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: validatedData.conversationId }
      })
    }
    
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          businessId: business.id,
          sessionId: validatedData.sessionId,
          userLanguage: 'en'
        }
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
    
    // Get knowledge base context
    const knowledgeBase = await prisma.knowledgeBase.findMany({
      where: { 
        businessId: business.id,
        isActive: true
      }
    })
    
    console.log(`Found ${knowledgeBase.length} knowledge base items for business ${business.id}`)
    
    // Convert knowledge base to the format expected by searchKnowledgeBase
    const kbItems = knowledgeBase.map(item => ({
      question: item.question,
      answer: item.answer,
      category: item.category,
      keywords: item.keywords
    }))
    
    // Search for relevant Q&As - call the correct function signature
    const relevantQAs = await searchKnowledgeBase(business.id, validatedData.message)
    
    console.log(`Found ${relevantQAs.length} relevant Q&As`)
    if (relevantQAs.length > 0) {
      console.log(`Top match: "${relevantQAs[0].question}" with score ${relevantQAs[0].score}`)
    }
    
    // Generate response based on tier
    let response = ''
    
    // Check if we have a direct knowledge base match
    // Lower threshold to allow more matches (semantic search will ensure quality)
    if (relevantQAs.length > 0 && relevantQAs[0].score > 40) {
      console.log('Using direct knowledge base answer with score:', relevantQAs[0].score)
      response = relevantQAs[0].answer
      
      // If there are multiple good matches, include them as well
      if (relevantQAs.length > 1 && relevantQAs[1].score > 30) {
        response += '\n\n**Related information:**'
        for (let i = 1; i < Math.min(relevantQAs.length, 3); i++) {
          if (relevantQAs[i].score > 30) {
            response += `\n• ${relevantQAs[i].answer}`
          }
        }
      }
    } else {
      // No direct match - provide helpful fallback based on tier
      const isDemo = validatedData.businessId === 'demo' || validatedData.businessId === 'demo-business-id'
      const businessInfo = business.businessInfo as any || {}
      const contactPhone = businessInfo.phone || '815-641-6689'
      const contactEmail = businessInfo.contactEmail || business.email || 'info@' + business.name.toLowerCase().replace(/\s+/g, '') + '.com'
      
      // Check if question is about specific business info we have
      const message = validatedData.message.toLowerCase()
      if (message.includes('check') && (message.includes('in') || message.includes('check-in'))) {
        if (businessInfo.checkInTime) {
          response = `Check-in begins at ${businessInfo.checkInTime}. Early check-in may be available - please call ${contactPhone} to inquire.`
        }
      } else if (message.includes('check') && (message.includes('out') || message.includes('check-out'))) {
        if (businessInfo.checkOutTime) {
          response = `Check-out is at ${businessInfo.checkOutTime}. Late check-out may be available for a small fee - please ask at the front desk.`
        }
      } else if (message.includes('parking')) {
        if (businessInfo.parking) {
          response = businessInfo.parking
        }
      } else if (message.includes('wifi') || message.includes('wi-fi') || message.includes('internet')) {
        if (businessInfo.wifi) {
          response = businessInfo.wifi
        }
      } else if (message.includes('breakfast')) {
        if (businessInfo.breakfast) {
          response = businessInfo.breakfast
        }
      } else if (message.includes('pool')) {
        if (businessInfo.pool) {
          response = businessInfo.pool
        }
      } else if (message.includes('gym') || message.includes('fitness')) {
        if (businessInfo.gym) {
          response = businessInfo.gym
        }
      } else if (message.includes('restaurant') || message.includes('dining')) {
        if (businessInfo.restaurant) {
          response = businessInfo.restaurant
        }
      } else if (message.includes('cancel')) {
        if (businessInfo.cancellationPolicy) {
          response = businessInfo.cancellationPolicy
        }
      } else if (message.includes('pet') || message.includes('dog') || message.includes('cat')) {
        if (businessInfo.petPolicy) {
          response = businessInfo.petPolicy
        }
      } else if (message.includes('smok')) {
        if (businessInfo.smokingPolicy) {
          response = businessInfo.smokingPolicy
        }
      } else if (message.includes('address') || message.includes('location') || message.includes('where')) {
        if (businessInfo.address) {
          const fullAddress = `${businessInfo.address}${businessInfo.city ? ', ' + businessInfo.city : ''}${businessInfo.state ? ', ' + businessInfo.state : ''}${businessInfo.zip ? ' ' + businessInfo.zip : ''}`
          response = `We're located at ${fullAddress}. ${businessInfo.airportDistance ? 'We are ' + businessInfo.airportDistance + ' from the airport.' : ''} ${businessInfo.beachDistance ? 'The beach is ' + businessInfo.beachDistance + ' away.' : ''}`
        }
      } else if (message.includes('phone') || message.includes('call')) {
        response = `You can reach us at ${contactPhone}. ${businessInfo.frontDeskHours ? 'Front desk hours: ' + businessInfo.frontDeskHours : 'We\'re available 24/7 for assistance.'}`
      } else if (message.includes('email')) {
        response = `Our email is ${contactEmail}. We typically respond within 2-4 hours.`
      }
      
      // If no specific match found, use the existing fallback logic
      if (!response) {
        // For starter tier, always provide contact fallback (no AI)
        if (business.tier === 'starter') {
          response = `I don't have specific information about that in my knowledge base. 

For assistance with your question, please:
• Call us at ${contactPhone}
• Email us at ${contactEmail}
• Visit our front desk

Our team will be happy to help you!`
        } else {
          // For higher tiers, try AI response
          try {
            // Get AI settings to include custom instructions
            const aiSettings = business.aiSettings as any || {}
            
            const businessContext = {
              businessName: business.name,
              businessType: business.type,
              tier: business.tier as 'starter' | 'professional' | 'premium' | 'enterprise',
              businessInfo: business.businessInfo,
              customPrompt: aiSettings.customPrompt, // Add custom instructions
              knowledgeBase: relevantQAs.slice(0, 3),
              isDemo: isDemo
            }
            
            response = await generateClaudeResponse(
              validatedData.message,
              businessContext
            )
          } catch (aiError) {
            console.error('AI generation error:', aiError)
            // Fallback for AI error
            response = `I apologize, but I'm having trouble understanding your question. 

For immediate assistance, please:
• Call us at ${contactPhone}
• Email us at ${contactEmail}
• Visit our front desk

Our team will be happy to help you with your specific needs.`
          }
        }
      }
    }
    
    // Save assistant response
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: response
      }
    })
    
    // Update conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { 
        updatedAt: new Date()
      }
    })
    
    return NextResponse.json(
      {
        message: response,
        conversationId: conversation.id,
        tier: business.tier
      },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Widget chat error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400, headers: corsHeaders }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to process message',
        message: "I apologize, but I'm experiencing technical difficulties. Please try again later or contact our staff directly."
      },
      { status: 500, headers: corsHeaders }
    )
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const businessId = searchParams.get('businessId')
  
  if (!businessId) {
    return NextResponse.json(
      { error: 'Business ID required' },
      { status: 400, headers: corsHeaders }
    )
  }
  
  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        name: true,
        tier: true,
        welcomeMessage: true,
        primaryColor: true,
        businessInfo: true
      }
    })
    
    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404, headers: corsHeaders }
      )
    }
    
    const businessInfo = business.businessInfo as any || {}
    
    // Log the tier for debugging
    console.log('Widget API - Business Tier:', business.tier, 'for business:', business.id)
    
    return NextResponse.json(
      {
        businessId: business.id,
        businessName: business.name,
        tier: business.tier || 'starter', // Default to starter if null
        businessInfo: businessInfo, // Include real business data
        settings: {
          welcomeMessage: business.welcomeMessage || 'Aloha! How can I help you today?',
          primaryColor: business.primaryColor || '#0891b2',
          position: 'bottom-right'
        }
      },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Widget config error:', error)
    return NextResponse.json(
      { error: 'Failed to load configuration' },
      { status: 500, headers: corsHeaders }
    )
  }
}