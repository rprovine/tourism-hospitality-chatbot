import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    // Verify JWT token
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const businessId = decoded.businessId
    
    // Get the logo data from request
    const { logo } = await request.json()
    
    if (!logo) {
      return NextResponse.json({ error: 'No logo data provided' }, { status: 400 })
    }
    
    // Update business with new logo
    const business = await prisma.business.update({
      where: { id: businessId },
      data: { logo }
    })
    
    return NextResponse.json({ 
      success: true,
      logo: business.logo 
    })
  } catch (error) {
    console.error('Error uploading logo:', error)
    return NextResponse.json(
      { error: 'Failed to upload logo' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}