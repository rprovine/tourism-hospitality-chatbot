import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyAuth } from '@/lib/auth/middleware'
import { z } from 'zod'

const prisma = new PrismaClient()

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  primaryColor: z.string().optional(),
  welcomeMessage: z.string().optional(),
  businessInfo: z.any().optional()
})

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const business = await prisma.business.findUnique({
      where: { id: auth.businessId },
      select: {
        id: true,
        email: true,
        name: true,
        type: true,
        tier: true,
        primaryColor: true,
        logo: true,
        welcomeMessage: true,
        businessInfo: true,
        subscription: true,
        createdAt: true
      }
    })
    
    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(business)
    
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)
    
    const business = await prisma.business.update({
      where: { id: auth.businessId },
      data: validatedData,
      select: {
        id: true,
        email: true,
        name: true,
        type: true,
        tier: true,
        primaryColor: true,
        logo: true,
        welcomeMessage: true,
        businessInfo: true
      }
    })
    
    return NextResponse.json(business)
    
  } catch (error) {
    console.error('Profile update error:', error)
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