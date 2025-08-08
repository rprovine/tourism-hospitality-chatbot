import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('id')
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }
    
    const session = await prisma.checkoutSession.findUnique({
      where: { sessionId },
      include: { business: true }
    })
    
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      sessionId: session.sessionId,
      planId: session.planId,
      businessId: session.businessId,
      businessName: session.businessName,
      email: session.email,
      status: session.status,
      tier: session.planId.split('_')[0]
    })
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}