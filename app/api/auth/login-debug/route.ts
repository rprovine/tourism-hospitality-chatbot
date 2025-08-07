import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      hasDatabase: !!process.env.DATABASE_URL,
      hasJWT: !!process.env.JWT_SECRET
    },
    steps: []
  }
  
  let prisma: PrismaClient | null = null
  
  try {
    // Step 1: Parse request
    const body = await request.json()
    debugInfo.steps.push({
      step: 'Parse request',
      success: true,
      email: body.email
    })
    
    // Step 2: Check DATABASE_URL format
    if (process.env.DATABASE_URL) {
      const url = process.env.DATABASE_URL
      debugInfo.steps.push({
        step: 'Check DATABASE_URL',
        success: true,
        hasPooler: url.includes('pooler'),
        hasPgbouncer: url.includes('pgbouncer'),
        urlStart: url.substring(0, 50) + '...'
      })
    }
    
    // Step 3: Initialize Prisma with correct parameters
    const dbUrl = process.env.DATABASE_URL?.includes('pgbouncer') 
      ? process.env.DATABASE_URL 
      : process.env.DATABASE_URL + '?pgbouncer=true&connection_limit=1'
      
    prisma = new PrismaClient({
      datasources: {
        db: { url: dbUrl }
      }
    })
    
    debugInfo.steps.push({
      step: 'Initialize Prisma',
      success: true,
      urlUsed: dbUrl?.substring(0, 50) + '...'
    })
    
    // Step 4: Connect to database
    await prisma.$connect()
    debugInfo.steps.push({
      step: 'Connect to database',
      success: true
    })
    
    // Step 5: Find user
    const business = await prisma.business.findUnique({
      where: { email: body.email }
    })
    
    debugInfo.steps.push({
      step: 'Find business',
      success: !!business,
      found: !!business,
      email: body.email
    })
    
    if (!business) {
      return NextResponse.json({
        error: 'User not found',
        debug: debugInfo
      }, { status: 404 })
    }
    
    // Step 6: Verify password
    const isValid = await bcrypt.compare(body.password, business.password)
    
    debugInfo.steps.push({
      step: 'Verify password',
      success: isValid,
      valid: isValid
    })
    
    return NextResponse.json({
      success: isValid,
      message: isValid ? 'Login would succeed' : 'Invalid password',
      debug: debugInfo
    })
    
  } catch (error: any) {
    debugInfo.error = {
      message: error.message,
      type: error.constructor.name,
      stack: error.stack?.split('\n').slice(0, 3)
    }
    
    return NextResponse.json({
      error: 'Debug failed',
      debug: debugInfo
    }, { status: 500 })
    
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}