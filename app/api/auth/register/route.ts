import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const prisma = new PrismaClient()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  businessName: z.string().min(2),
  businessType: z.enum(['hotel', 'tour_operator', 'vacation_rental']),
  tier: z.enum(['starter', 'professional']).default('starter')
})

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)
    
    // Check if business already exists
    const existingBusiness = await prisma.business.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingBusiness) {
      return NextResponse.json(
        { error: 'Business with this email already exists' },
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)
    
    // Create business
    const business = await prisma.business.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.businessName,
        type: validatedData.businessType,
        tier: validatedData.tier,
        welcomeMessage: `Aloha! Welcome to ${validatedData.businessName}. How can I help you today?`
      },
      select: {
        id: true,
        email: true,
        name: true,
        type: true,
        tier: true,
        primaryColor: true,
        welcomeMessage: true
      }
    })
    
    // Create JWT token
    const token = jwt.sign(
      { businessId: business.id, email: business.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    )
    
    // Create subscription record
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1)
    
    await prisma.subscription.create({
      data: {
        businessId: business.id,
        tier: validatedData.tier,
        status: 'active',
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate
      }
    })
    
    return NextResponse.json({
      token,
      business
    })
    
  } catch (error) {
    console.error('Registration error:', error)
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