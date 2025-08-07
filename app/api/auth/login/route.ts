import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'  // Changed from 'bcrypt' to 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const prisma = new PrismaClient()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)
    
    console.log('Login attempt for:', validatedData.email)
    
    // Find business
    const business = await prisma.business.findUnique({
      where: { email: validatedData.email },
      include: {
        subscription: true
      }
    })
    
    if (!business) {
      console.log('Business not found:', validatedData.email)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    console.log('Business found, verifying password...')
    
    // Verify password
    const isValidPassword = await bcrypt.compare(validatedData.password, business.password)
    
    if (!isValidPassword) {
      console.log('Invalid password for:', validatedData.email)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    console.log('Password verified, creating token...')
    
    // Create JWT token
    const token = jwt.sign(
      { businessId: business.id, email: business.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    )
    
    // Remove password from response
    const { password, ...businessData } = business
    
    console.log('Login successful for:', validatedData.email)
    
    return NextResponse.json({
      token,
      business: businessData
    })
    
  } catch (error: any) {
    console.error('Login error:', error)
    console.error('Error stack:', error.stack)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    // Return more detailed error in development
    const isDev = process.env.NODE_ENV === 'development'
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        ...(isDev && { 
          message: error.message,
          type: error.constructor.name 
        })
      },
      { status: 500 }
    )
  }
}