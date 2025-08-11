import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { getOpenAIService } from '@/lib/ai/openai-service'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  let prisma: PrismaClient | null = null
  
  try {
    // Verify JWT token
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const businessId = decoded.businessId
    
    const body = await request.json()
    const { messages, model, temperature, maxTokens, stream } = body
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array required' },
        { status: 400 }
      )
    }
    
    // Initialize Prisma to get business info
    prisma = new PrismaClient()
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        name: true,
        type: true,
        businessInfo: true,
        welcomeMessage: true
      }
    })
    
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }
    
    // Initialize OpenAI service
    const openAI = getOpenAIService()
    
    if (!openAI.isConfigured()) {
      return NextResponse.json(
        { error: 'OpenAI not configured. Please add OPENAI_API_KEY to environment variables.' },
        { status: 503 }
      )
    }
    
    // Add system prompt if not present
    const systemMessage = messages.find(m => m.role === 'system')
    if (!systemMessage) {
      messages.unshift({
        role: 'system',
        content: openAI.generateHospitalityPrompt(business)
      })
    }
    
    // Handle streaming response
    if (stream) {
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          try {
            await openAI.createStreamingChatCompletion(
              messages,
              { model, temperature, maxTokens },
              (chunk: string) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`))
              }
            )
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
          } catch (error) {
            controller.error(error)
          }
        }
      })
      
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      })
    }
    
    // Regular completion
    const completion = await openAI.createChatCompletion(
      messages,
      { model, temperature, maxTokens }
    )
    
    // Calculate token usage and cost
    const totalTokens = openAI.countTokens(messages.map(m => m.content).join(' ')) +
                       openAI.countTokens(completion)
    const estimatedCost = openAI.estimateCost(totalTokens, model)
    
    return NextResponse.json({
      completion,
      usage: {
        totalTokens,
        estimatedCost
      }
    })
    
  } catch (error: any) {
    console.error('AI completion error:', error)
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    return NextResponse.json(
      { error: 'AI completion failed', details: error.message },
      { status: 500 }
    )
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    jwt.verify(token, JWT_SECRET)
    
    const openAI = getOpenAIService()
    
    // Get available models
    const models = openAI.isConfigured() 
      ? await openAI.listAvailableModels()
      : ['gpt-5', 'gpt-5-turbo', 'gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo']
    
    return NextResponse.json({
      status: openAI.isConfigured() ? 'configured' : 'not_configured',
      models,
      features: {
        streaming: true,
        embeddings: true,
        tokenCounting: true,
        costEstimation: true
      },
      pricing: {
        'gpt-5': { input: 0.015, output: 0.045 },
        'gpt-5-turbo': { input: 0.008, output: 0.024 },
        'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
        'gpt-4': { input: 0.03, output: 0.06 },
        'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 }
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}