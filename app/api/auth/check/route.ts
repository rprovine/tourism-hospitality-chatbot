import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  const info: any = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlFormat: process.env.DATABASE_URL ? 
        process.env.DATABASE_URL.substring(0, 50) + '...' : 'NOT SET'
    },
    tests: []
  }
  
  // Test 1: Simple connection with pgbouncer
  try {
    let dbUrl = process.env.DATABASE_URL || ''
    
    // Check if URL already has query parameters
    if (!dbUrl.includes('pgbouncer')) {
      // Parse the URL to add parameters correctly
      const separator = dbUrl.includes('?') ? '&' : '?'
      dbUrl = dbUrl + separator + 'pgbouncer=true&connection_limit=1'
    }
    
    info.tests.push({
      name: 'URL construction',
      urlUsed: dbUrl.replace(/Chi3ft%40n5527/, '[PASSWORD]').substring(0, 100) + '...'
    })
    
    const prisma = new PrismaClient({
      datasources: {
        db: { url: dbUrl }
      }
    })
    
    await prisma.$connect()
    const count = await prisma.business.count()
    await prisma.$disconnect()
    
    info.tests.push({
      name: 'Database connection',
      success: true,
      businessCount: count
    })
    
    // Get test accounts
    const testPrisma = new PrismaClient({
      datasources: {
        db: { url: dbUrl }
      }
    })
    
    const testAccounts = await testPrisma.business.findMany({
      where: {
        email: {
          in: ['premium@demo.com', 'professional@demo.com', 'starter@demo.com']
        }
      },
      select: {
        email: true,
        tier: true,
        createdAt: true
      }
    })
    
    await testPrisma.$disconnect()
    
    info.testAccounts = testAccounts
    
  } catch (error: any) {
    info.tests.push({
      name: 'Database connection',
      success: false,
      error: error.message,
      errorType: error.constructor.name
    })
  }
  
  return NextResponse.json(info, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store'
    }
  })
}