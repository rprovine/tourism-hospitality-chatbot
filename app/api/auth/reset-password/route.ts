import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = resetPasswordSchema.parse(body)
    
    // Find business with this reset token
    const businesses = await prisma.business.findMany({
      where: {
        businessInfo: {
          path: ['resetToken'],
          equals: token
        }
      }
    })
    
    if (businesses.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }
    
    const business = businesses[0]
    const businessInfo = business.businessInfo as any || {}
    
    // Check if token is expired
    if (businessInfo.resetTokenExpiry) {
      const expiry = new Date(businessInfo.resetTokenExpiry)
      if (expiry < new Date()) {
        return NextResponse.json(
          { error: 'Reset token has expired' },
          { status: 400 }
        )
      }
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Update password and clear reset token
    await prisma.business.update({
      where: { id: business.id },
      data: {
        password: hashedPassword,
        businessInfo: {
          ...businessInfo,
          resetToken: null,
          resetTokenExpiry: null
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}