import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const businessId = decoded.businessId
    
    // Get AI settings for the business
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { aiSettings: true }
    })
    
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }
    
    // Default settings if none exist
    const defaultSettings = {
      provider: 'claude',
      claudeSettings: {
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        modelPreference: 'sonnet'
      },
      chatgptSettings: {
        apiKey: process.env.OPENAI_API_KEY || '',
        modelPreference: 'gpt-5'
      },
      temperature: 0.7,
      maxTokens: 500,
      customPrompt: '',
      knowledgeBaseEnabled: true
    }
    
    return NextResponse.json(business.aiSettings || defaultSettings)
  } catch (error) {
    console.error('Error fetching AI settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI settings' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify JWT token
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const businessId = decoded.businessId
    
    const settings = await request.json()
    
    // Don't store API keys in database - use environment variables
    const sanitizedSettings = {
      provider: settings.provider,
      claudeSettings: {
        modelPreference: settings.claudeSettings?.modelPreference || 'sonnet'
      },
      chatgptSettings: {
        modelPreference: settings.chatgptSettings?.modelPreference || 'gpt-5'
      },
      temperature: settings.temperature || 0.7,
      maxTokens: settings.maxTokens || 500,
      customPrompt: settings.customPrompt || '',
      knowledgeBaseEnabled: settings.knowledgeBaseEnabled !== false
    }
    
    // Update AI settings for the business
    const business = await prisma.business.update({
      where: { id: businessId },
      data: { aiSettings: sanitizedSettings }
    })
    
    return NextResponse.json({ 
      success: true,
      settings: sanitizedSettings 
    })
  } catch (error) {
    console.error('Error saving AI settings:', error)
    return NextResponse.json(
      { error: 'Failed to save AI settings' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}