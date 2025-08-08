import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  const prisma = new PrismaClient()
  
  try {
    // Get the raw text first, then parse it
    const text = await request.text()
    console.log('Raw request body:', text)
    
    let body
    try {
      body = JSON.parse(text)
    } catch (e) {
      console.error('JSON parse error:', e)
      return NextResponse.json(
        { error: 'Invalid JSON in request body', raw: text },
        { status: 400 }
      )
    }
    
    const { email, password } = body
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }
    
    console.log('Login attempt for:', email)
    
    // Connect to database
    await prisma.$connect()
    
    // Check if it's an admin user
    const adminUser = await prisma.adminUser.findUnique({
      where: { email }
    })
    
    if (adminUser) {
      console.log('Admin user found')
      
      // Verify admin password
      const isValidPassword = await bcrypt.compare(password, adminUser.password)
      
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }
      
      // Create JWT token for admin
      const token = jwt.sign(
        { 
          adminId: adminUser.id, 
          email: adminUser.email,
          role: adminUser.role,
          isAdmin: true 
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      )
      
      // Remove password from response
      const { password: _, ...adminData } = adminUser
      
      return NextResponse.json({
        success: true,
        token,
        user: adminData,
        isAdmin: true,
        redirectTo: '/admin'
      })
    }
    
    // If not admin, try regular business login
    const business = await prisma.business.findUnique({
      where: { email },
      include: {
        subscription: true
      }
    })
    
    if (!business) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, business.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // Create JWT token
    const token = jwt.sign(
      { businessId: business.id, email: business.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    )
    
    // Remove password from response
    const { password: _, ...businessData } = business
    
    return NextResponse.json({
      success: true,
      token,
      business: businessData,
      isAdmin: false,
      redirectTo: '/dashboard'
    })
    
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}