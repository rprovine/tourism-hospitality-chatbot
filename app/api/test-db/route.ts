import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlFormat: process.env.DATABASE_URL ? 
        process.env.DATABASE_URL.substring(0, 30) + '...' : 
        'NOT SET'
    },
    tests: []
  }

  // Test 1: Environment Database URL
  if (process.env.DATABASE_URL) {
    const prisma1 = new PrismaClient()
    try {
      await prisma1.$connect()
      const count = await prisma1.business.count()
      results.tests.push({
        name: 'Environment DATABASE_URL',
        success: true,
        businessCount: count
      })
      await prisma1.$disconnect()
    } catch (error: any) {
      results.tests.push({
        name: 'Environment DATABASE_URL',
        success: false,
        error: error.message
      })
    }
  }

  // Test 2: Pooler with pgbouncer mode
  const poolerUrl = 'postgresql://postgres.hoybtqhautslrjxrlffs:Chi3ft%40n5527@aws-0-us-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true'
  const prisma2 = new PrismaClient({
    datasources: {
      db: { url: poolerUrl }
    }
  })
  try {
    await prisma2.$connect()
    const count = await prisma2.business.count()
    results.tests.push({
      name: 'Pooler with pgbouncer=true',
      success: true,
      businessCount: count
    })
    await prisma2.$disconnect()
  } catch (error: any) {
    results.tests.push({
      name: 'Pooler with pgbouncer=true',
      success: false,
      error: error.message
    })
  }

  // Test 3: Pooler with connection limit
  const poolerLimitUrl = 'postgresql://postgres.hoybtqhautslrjxrlffs:Chi3ft%40n5527@aws-0-us-west-1.pooler.supabase.com:5432/postgres?connection_limit=1'
  const prisma3 = new PrismaClient({
    datasources: {
      db: { url: poolerLimitUrl }
    }
  })
  try {
    await prisma3.$connect()
    const count = await prisma3.business.count()
    results.tests.push({
      name: 'Pooler with connection_limit=1',
      success: true,
      businessCount: count
    })
    await prisma3.$disconnect()
  } catch (error: any) {
    results.tests.push({
      name: 'Pooler with connection_limit=1',
      success: false,
      error: error.message
    })
  }

  // Test 4: Direct connection (port 6543 for pooler)
  const pooler6543Url = 'postgresql://postgres.hoybtqhautslrjxrlffs:Chi3ft%40n5527@aws-0-us-west-1.pooler.supabase.com:6543/postgres'
  const prisma4 = new PrismaClient({
    datasources: {
      db: { url: pooler6543Url }
    }
  })
  try {
    await prisma4.$connect()
    const count = await prisma4.business.count()
    results.tests.push({
      name: 'Pooler on port 6543',
      success: true,
      businessCount: count
    })
    await prisma4.$disconnect()
  } catch (error: any) {
    results.tests.push({
      name: 'Pooler on port 6543',
      success: false,
      error: error.message
    })
  }

  return NextResponse.json(results, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-store'
    }
  })
}