import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  const checks = {
    status: 'checking',
    timestamp: new Date().toISOString(),
    database: 'unchecked',
    environment: {
      hasDatabase: !!process.env.DATABASE_URL,
      hasJWT: !!process.env.JWT_SECRET,
      hasAnthropic: !!process.env.ANTHROPIC_API_KEY,
      hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
    },
    error: null as any
  }

  try {
    // Test database connection
    const prisma = new PrismaClient()
    
    try {
      await prisma.$connect()
      await prisma.business.count() // Simple query to test connection
      checks.database = 'connected'
      await prisma.$disconnect()
    } catch (dbError: any) {
      checks.database = 'failed'
      checks.error = {
        message: dbError.message,
        code: dbError.code
      }
    }

    checks.status = checks.database === 'connected' ? 'healthy' : 'unhealthy'

    return NextResponse.json(checks, { 
      status: checks.status === 'healthy' ? 200 : 503 
    })
  } catch (error: any) {
    return NextResponse.json({
      ...checks,
      status: 'error',
      error: error.message
    }, { status: 500 })
  }
}