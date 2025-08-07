import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  let prisma: PrismaClient | null = null
  
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)
    
    console.log('Login attempt for:', validatedData.email)
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    
    // Initialize Prisma with connection parameters
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL + '?pgbouncer=true&connection_limit=1'
        }
      }
    })
    
    // Test connection
    await prisma.$connect()
    console.log('Database connected successfully')
    
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
    if (error.message?.includes("Can't reach database server")) {
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          message: 'Unable to connect to database. Please try again later.',
          details: error.message
        },
        { status: 503 }
      )
    }
    
    // Return detailed error for debugging
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message,
        type: error.constructor.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  } finally {
    // Always disconnect Prisma
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}