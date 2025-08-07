import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// This endpoint creates demo users - only use once!
export async function GET(request: NextRequest) {
  // Simple security check
  const seedKey = request.nextUrl.searchParams.get('key')
  if (seedKey !== 'create-demo-users-2024') {
    return NextResponse.json({ error: 'Invalid seed key' }, { status: 401 })
  }

  const prisma = new PrismaClient()
  
  try {
    await prisma.$connect()
    
    // Demo users to create
    const demoUsers = [
      {
        email: 'starter@demo.com',
        password: 'demo123',
        name: 'Starter Beach Hotel',
        type: 'hotel',
        tier: 'starter'
      },
      {
        email: 'professional@demo.com',
        password: 'demo123',
        name: 'Professional Resort & Spa',
        type: 'resort',
        tier: 'professional'
      },
      {
        email: 'premium@demo.com',
        password: 'demo123',
        name: 'Premium Luxury Villas',
        type: 'resort',
        tier: 'premium'
      },
      {
        email: 'enterprise@demo.com',
        password: 'demo123',
        name: 'Enterprise Hotel Chain',
        type: 'hotel_chain',
        tier: 'enterprise'
      },
      {
        email: 'test@hotel.com',
        password: 'password123',
        name: 'Test Hotel',
        type: 'hotel',
        tier: 'starter'
      }
    ]
    
    const results = []
    
    for (const user of demoUsers) {
      // Check if user exists
      const existing = await prisma.business.findUnique({
        where: { email: user.email }
      })
      
      if (existing) {
        // Update password to ensure it matches
        const hashedPassword = await bcrypt.hash(user.password, 10)
        await prisma.business.update({
          where: { email: user.email },
          data: { 
            password: hashedPassword,
            tier: user.tier,
            name: user.name
          }
        })
        results.push({ email: user.email, status: 'updated' })
      } else {
        // Create new user
        const hashedPassword = await bcrypt.hash(user.password, 10)
        await prisma.business.create({
          data: {
            email: user.email,
            password: hashedPassword,
            name: user.name,
            type: user.type,
            tier: user.tier,
            apiKey: `demo_${user.tier}_${Date.now()}`
          }
        })
        results.push({ email: user.email, status: 'created' })
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Demo users created/updated successfully',
      results,
      credentials: [
        { tier: 'Starter', email: 'starter@demo.com', password: 'demo123' },
        { tier: 'Professional', email: 'professional@demo.com', password: 'demo123' },
        { tier: 'Premium', email: 'premium@demo.com', password: 'demo123' },
        { tier: 'Enterprise', email: 'enterprise@demo.com', password: 'demo123' },
        { tier: 'Test', email: 'test@hotel.com', password: 'password123' }
      ]
    })
    
  } catch (error: any) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Failed to seed demo users', details: error.message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}