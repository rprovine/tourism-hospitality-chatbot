import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

// GET - Fetch channel configurations
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    const channels = await prisma.channelConfig.findMany({
      where: { businessId: decoded.businessId }
    })
    
    // Mask sensitive data
    const maskedChannels = channels.map(channel => ({
      ...channel,
      config: maskSensitiveData(channel.config as any, channel.channel)
    }))
    
    return NextResponse.json(maskedChannels)
    
  } catch (error: any) {
    console.error('Get channels error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch channels' },
      { status: 500 }
    )
  }
}

// POST - Save channel configuration
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    const body = await request.json()
    const { channel, config, isActive } = body
    
    // Validate channel
    const validChannels = ['whatsapp', 'sms', 'instagram', 'facebook', 'telegram']
    if (!validChannels.includes(channel)) {
      return NextResponse.json({ error: 'Invalid channel' }, { status: 400 })
    }
    
    // Check if configuration exists
    const existing = await prisma.channelConfig.findFirst({
      where: {
        businessId: decoded.businessId,
        channel
      }
    })
    
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://tourism-hospitality-chatbot.vercel.app'}/api/channels/${channel}/webhook`
    
    if (existing) {
      // Update existing
      const updated = await prisma.channelConfig.update({
        where: { id: existing.id },
        data: {
          config,
          isActive,
          webhookUrl,
          updatedAt: new Date()
        }
      })
      
      return NextResponse.json(updated)
    } else {
      // Create new
      const created = await prisma.channelConfig.create({
        data: {
          businessId: decoded.businessId,
          channel,
          config,
          isActive,
          webhookUrl
        }
      })
      
      return NextResponse.json(created)
    }
    
  } catch (error: any) {
    console.error('Save channel error:', error)
    return NextResponse.json(
      { error: 'Failed to save channel configuration' },
      { status: 500 }
    )
  }
}

// Helper to mask sensitive data
function maskSensitiveData(config: any, channel: string): any {
  if (!config) return config
  
  const masked = { ...config }
  
  switch (channel) {
    case 'whatsapp':
      if (masked.accessToken) {
        masked.accessToken = maskString(masked.accessToken)
      }
      break
      
    case 'sms':
      if (masked.authToken) {
        masked.authToken = maskString(masked.authToken)
      }
      break
  }
  
  return masked
}

function maskString(str: string): string {
  if (!str || str.length < 8) return '****'
  return str.substring(0, 4) + '****' + str.substring(str.length - 4)
}