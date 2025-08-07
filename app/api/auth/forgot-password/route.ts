import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email/mailer'

const prisma = new PrismaClient()

const forgotPasswordSchema = z.object({
  email: z.string().email()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)
    
    // Find user by email
    const business = await prisma.business.findUnique({
      where: { email }
    })
    
    // Always return success to prevent email enumeration
    if (!business) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a reset link has been sent.'
      })
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    
    // Store reset token (in production, use a separate table)
    // For now, we'll store it in businessInfo JSON field
    await prisma.business.update({
      where: { id: business.id },
      data: {
        businessInfo: {
          ...(business.businessInfo as any || {}),
          resetToken,
          resetTokenExpiry: resetTokenExpiry.toISOString()
        }
      }
    })
    
    // Send reset email
    await sendPasswordResetEmail(
      email,
      business.name,
      resetToken
    )
    
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a reset link has been sent.'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}