import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body
    
    // Step 1: Check database connection
    try {
      await prisma.$connect()
    } catch (dbError: any) {
      return NextResponse.json({
        error: 'Database connection failed',
        details: dbError.message
      }, { status: 500 })
    }
    
    // Step 2: Find user
    const business = await prisma.business.findUnique({
      where: { email }
    })
    
    if (!business) {
      return NextResponse.json({
        error: 'User not found',
        email
      }, { status: 404 })
    }
    
    // Step 3: Test password
    let isValid = false
    try {
      isValid = await bcryptjs.compare(password, business.password)
    } catch (bcryptError: any) {
      return NextResponse.json({
        error: 'Password comparison failed',
        details: bcryptError.message
      }, { status: 500 })
    }
    
    if (!isValid) {
      return NextResponse.json({
        error: 'Invalid password',
        email
      }, { status: 401 })
    }
    
    // Step 4: Check JWT secret
    const hasJwtSecret = !!process.env.JWT_SECRET
    
    return NextResponse.json({
      success: true,
      message: 'Login test successful',
      user: {
        email: business.email,
        name: business.name,
        tier: business.tier
      },
      environment: {
        hasJwtSecret,
        nodeEnv: process.env.NODE_ENV
      }
    })
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Test login failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}