import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth/jwt'
import crypto from 'crypto'

const prisma = new PrismaClient()

// GET - Retrieve existing API key
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const business = await prisma.business.findUnique({
      where: { id: payload.businessId },
      select: {
        id: true,
        name: true,
        tier: true,
        apiKey: true,
        apiKeyCreatedAt: true
      }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Check if tier has API access
    if (business.tier === 'starter') {
      return NextResponse.json({ 
        error: 'API access not available for Starter plan',
        business: { tier: business.tier }
      }, { status: 403 })
    }

    return NextResponse.json({
      apiKey: business.apiKey,
      createdAt: business.apiKeyCreatedAt,
      business: {
        id: business.id,
        name: business.name,
        tier: business.tier
      }
    })
  } catch (error) {
    console.error('API key fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch API key' },
      { status: 500 }
    )
  }
}

// POST - Generate new API key
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const business = await prisma.business.findUnique({
      where: { id: payload.businessId }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Check if tier has API access
    if (business.tier === 'starter') {
      return NextResponse.json({ 
        error: 'API access not available for Starter plan' 
      }, { status: 403 })
    }

    // Generate new API key
    const apiKey = `ll_${business.tier.substring(0, 3)}_${crypto.randomBytes(32).toString('hex')}`

    // Update business with new API key
    const updated = await prisma.business.update({
      where: { id: business.id },
      data: {
        apiKey,
        apiKeyCreatedAt: new Date()
      },
      select: {
        apiKey: true,
        apiKeyCreatedAt: true
      }
    })

    // Log API key generation (for audit)
    console.log(`API key generated for business ${business.id} (${business.tier})`)

    return NextResponse.json({
      apiKey: updated.apiKey,
      createdAt: updated.apiKeyCreatedAt,
      message: 'API key generated successfully'
    })
  } catch (error) {
    console.error('API key generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate API key' },
      { status: 500 }
    )
  }
}