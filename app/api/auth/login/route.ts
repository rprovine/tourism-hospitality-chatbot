import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import prisma from '@/lib/prisma'

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
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    
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
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    // Check for Prisma connection errors
    if (error.message?.includes("Can't reach database server") || 
        error.message?.includes("P1001") ||
        error.message?.includes("P1002")) {
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          message: 'Unable to connect to database. Please try again later.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 503 }
      )
    }
    
    // Return detailed error for debugging
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred during login',
        type: process.env.NODE_ENV === 'development' ? error.constructor.name : undefined,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}