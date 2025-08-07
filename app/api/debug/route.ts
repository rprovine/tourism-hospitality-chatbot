import { NextResponse } from 'next/server'

export async function GET() {
  // Only show in development
  const isDev = process.env.NODE_ENV === 'development'
  
  return NextResponse.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    hasEnvVars: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,
      ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
      NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
      SENDGRID_API_KEY: !!process.env.SENDGRID_API_KEY,
    },
    // Only show in dev
    ...(isDev && {
      urls: {
        database: process.env.DATABASE_URL ? 'Set (hidden)' : 'Not set',
        app: process.env.NEXT_PUBLIC_APP_URL || 'Not set'
      }
    })
  })
}