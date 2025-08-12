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
    
    // Generate response based on tier - ALWAYS combine business profile + knowledge base + AI (for higher tiers)
    let response = ''
    
    // First, check for specific business info that should always be used
    const isDemo = validatedData.businessId === 'demo' || validatedData.businessId === 'demo-business-id'
    const businessInfo = business.businessInfo as any || {}
    const contactPhone = businessInfo.phone || '815-641-6689'
    const contactEmail = businessInfo.contactEmail || business.email || 'info@lenilani.com'
    
    // Check if question is about specific business info we have
    const message = validatedData.message.toLowerCase()
    let businessResponse = ''
    
    if (message.includes('check') && (message.includes('in') || message.includes('check-in'))) {
      if (businessInfo.checkInTime) {
        businessResponse = `Check-in begins at ${businessInfo.checkInTime}. Early check-in may be available - please call ${contactPhone} to inquire.`
      }
    } else if (message.includes('check') && (message.includes('out') || message.includes('check-out'))) {
      if (businessInfo.checkOutTime) {
        businessResponse = `Check-out is at ${businessInfo.checkOutTime}. Late check-out may be available for a small fee - please ask at the front desk.`
      }
    } else if (message.includes('parking')) {
      if (businessInfo.parking) {
        businessResponse = `Parking: ${businessInfo.parking}`
      }
    } else if (message.includes('wifi') || message.includes('wi-fi') || message.includes('internet')) {
      if (businessInfo.wifi) {
        businessResponse = `WiFi: ${businessInfo.wifi}`
      }
    } else if (message.includes('breakfast')) {
      if (businessInfo.breakfast) {
        businessResponse = `Breakfast: ${businessInfo.breakfast}`
      }
    } else if (message.includes('pool')) {
      if (businessInfo.pool) {
        businessResponse = `Pool: ${businessInfo.pool}`
      }
    } else if (message.includes('gym') || message.includes('fitness')) {
      if (businessInfo.gym) {
        businessResponse = `Gym/Fitness: ${businessInfo.gym}`
      }
    } else if (message.includes('restaurant') || message.includes('dining')) {
      if (businessInfo.restaurant) {
        businessResponse = `Restaurant: ${businessInfo.restaurant}`
      }
    } else if (message.includes('cancel')) {
      if (businessInfo.cancellationPolicy) {
        businessResponse = `Cancellation Policy: ${businessInfo.cancellationPolicy}`
      }
    } else if (message.includes('pet') || message.includes('dog') || message.includes('cat')) {
      if (businessInfo.petPolicy) {
        businessResponse = `Pet Policy: ${businessInfo.petPolicy}`
      }
    } else if (message.includes('smok')) {
      if (businessInfo.smokingPolicy) {
        businessResponse = `Smoking Policy: ${businessInfo.smokingPolicy}`
      }
    } else if (message.includes('address') || message.includes('location') || message.includes('where')) {
      if (businessInfo.address) {
        const fullAddress = `${businessInfo.address}${businessInfo.city ? ', ' + businessInfo.city : ''}${businessInfo.state ? ', ' + businessInfo.state : ''}${businessInfo.zip ? ' ' + businessInfo.zip : ''}`
        businessResponse = `We're located at ${fullAddress}. ${businessInfo.airportDistance ? 'We are ' + businessInfo.airportDistance + ' from the airport.' : ''} ${businessInfo.beachDistance ? 'The beach is ' + businessInfo.beachDistance + ' away.' : ''}`
      }
    } else if (message.includes('phone') || message.includes('call')) {
      businessResponse = `You can reach us at ${contactPhone}. ${businessInfo.frontDeskHours ? 'Front desk hours: ' + businessInfo.frontDeskHours : 'We\'re available 24/7 for assistance.'}`
    } else if (message.includes('email')) {
      businessResponse = `Our email is ${contactEmail}. We typically respond within 2-4 hours.`
    }
    
    // Add knowledge base information if available (filter out low-quality entries)
    let knowledgeResponse = ''
    if (relevantQAs.length > 0 && relevantQAs[0].score > 50) {
      const goodQAs = relevantQAs.filter(qa => qa.score > 50 && qa.answer.length > 10 && !['none', 'no', 'n/a'].includes(qa.answer.toLowerCase()))
      if (goodQAs.length > 0) {
        knowledgeResponse = goodQAs[0].answer
        if (goodQAs.length > 1) {
          knowledgeResponse += `\n\n**Additional information:**\n${goodQAs.slice(1, 3).map(qa => `• ${qa.answer}`).join('\n')}`
        }
      }
    }
    
    // Combine business profile + knowledge base
    if (businessResponse && knowledgeResponse) {
      response = `${businessResponse}\n\n${knowledgeResponse}`
    } else if (businessResponse) {
      response = businessResponse
    } else if (knowledgeResponse) {
      response = knowledgeResponse
    }
    
    // If no response yet or tier allows AI enhancement
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