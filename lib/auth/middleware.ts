import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface AuthToken {
  businessId: string
  email: string
}

export async function verifyAuth(request: NextRequest): Promise<AuthToken | null> {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    
    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as AuthToken
    
    // Verify business exists
    const business = await prisma.business.findUnique({
      where: { id: decoded.businessId }
    })
    
    if (!business) {
      return null
    }
    
    return decoded
  } catch (error) {
    console.error('Auth verification error:', error)
    return null
  }
}

export function requireAuth(handler: (request: NextRequest, auth: AuthToken) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const auth = await verifyAuth(request)
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return handler(request, auth)
  }
}