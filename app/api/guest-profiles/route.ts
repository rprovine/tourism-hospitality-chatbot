import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

// GET - Fetch guest profiles for a business
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
    
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')
    const phone = searchParams.get('phone')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const where: any = {
      businessId: decoded.businessId
    }
    
    if (email) {
      where.email = email
    }
    
    if (phone) {
      where.phone = phone
    }
    
    const profiles = await prisma.guestProfile.findMany({
      where,
      include: {
        interactions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { lastVisit: 'desc' },
      take: limit,
      skip: offset
    })
    
    const total = await prisma.guestProfile.count({ where })
    
    return NextResponse.json({
      profiles,
      total,
      limit,
      offset
    })
    
  } catch (error: any) {
    console.error('Get guest profiles error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch guest profiles' },
      { status: 500 }
    )
  }
}

// POST - Create or update guest profile
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
    const { email, phone, name, preferences, tags, languagePreference, notes } = body
    
    // Try to find existing profile
    let profile = null
    
    if (email) {
      profile = await prisma.guestProfile.findFirst({
        where: {
          businessId: decoded.businessId,
          email
        }
      })
    }
    
    if (!profile && phone) {
      profile = await prisma.guestProfile.findFirst({
        where: {
          businessId: decoded.businessId,
          phone
        }
      })
    }
    
    if (profile) {
      // Update existing profile
      profile = await prisma.guestProfile.update({
        where: { id: profile.id },
        data: {
          email: email || profile.email,
          phone: phone || profile.phone,
          name: name || profile.name,
          preferences: preferences || profile.preferences,
          tags: tags || profile.tags,
          languagePreference: languagePreference || profile.languagePreference,
          notes: notes || profile.notes,
          lastVisit: new Date(),
          totalConversations: { increment: 1 }
        }
      })
    } else {
      // Create new profile
      profile = await prisma.guestProfile.create({
        data: {
          businessId: decoded.businessId,
          email,
          phone,
          name,
          preferences: preferences || {},
          tags: tags || [],
          languagePreference: languagePreference || 'en',
          notes,
          lastVisit: new Date(),
          totalConversations: 1
        }
      })
    }
    
    return NextResponse.json(profile)
    
  } catch (error: any) {
    console.error('Create/update guest profile error:', error)
    return NextResponse.json(
      { error: 'Failed to save guest profile' },
      { status: 500 }
    )
  }
}

// PUT - Update guest profile by ID
export async function PUT(request: NextRequest) {
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
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Profile ID required' }, { status: 400 })
    }
    
    // Verify profile belongs to business
    const existingProfile = await prisma.guestProfile.findFirst({
      where: {
        id,
        businessId: decoded.businessId
      }
    })
    
    if (!existingProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }
    
    const profile = await prisma.guestProfile.update({
      where: { id },
      data: updateData
    })
    
    return NextResponse.json(profile)
    
  } catch (error: any) {
    console.error('Update guest profile error:', error)
    return NextResponse.json(
      { error: 'Failed to update guest profile' },
      { status: 500 }
    )
  }
}