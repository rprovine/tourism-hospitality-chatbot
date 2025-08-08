import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { sendWelcomeEmail } from '@/lib/email/mailer'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email, sessionId } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    
    // Find the business by email
    const business = await prisma.business.findUnique({
      where: { email }
    })
    
    if (!business) {
      return NextResponse.json(
        { error: 'No account found with this email' },
        { status: 404 }
      )
    }
    
    // Check if already activated
    if (business.password && business.password !== '') {
      return NextResponse.json({
        success: true,
        message: 'Account already activated',
        alreadyActivated: true
      })
    }
    
    // Generate a temporary password
    const tempPassword = nanoid(12)
    const hashedPassword = await bcrypt.hash(tempPassword, 10)
    
    // Update business with password
    const updatedBusiness = await prisma.business.update({
      where: { id: business.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date()
      }
    })
    
    // Update checkout session if provided
    if (sessionId) {
      await prisma.checkoutSession.updateMany({
        where: { sessionId },
        data: {
          status: 'completed',
          completedAt: new Date()
        }
      })
    }
    
    // Send welcome email with credentials
    try {
      await sendWelcomeEmail(email, business.name, business.tier)
      
      // Also send a separate email with login credentials
      const { sendEmail } = await import('@/lib/email/mailer')
      await sendEmail(email, {
        subject: 'Your LeniLani AI Login Credentials',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #0891b2 0%, #0c4a6e 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: white; padding: 30px; border: 1px solid #e5e5e5; border-radius: 0 0 10px 10px; }
              .credentials { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0891b2; }
              .button { display: inline-block; padding: 12px 30px; background: #0891b2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Your Login Credentials</h1>
              </div>
              <div class="content">
                <h2>Welcome ${business.name}!</h2>
                
                <p>Your LeniLani AI account has been activated. Here are your login credentials:</p>
                
                <div class="credentials">
                  <strong>Login URL:</strong> ${process.env.NEXT_PUBLIC_APP_URL}/login<br>
                  <strong>Email:</strong> ${email}<br>
                  <strong>Temporary Password:</strong> <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">${tempPassword}</code>
                </div>
                
                <div class="warning">
                  <strong>⚠️ Important:</strong> Please change your password immediately after logging in for security reasons.
                </div>
                
                <center>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" class="button">Login Now</a>
                </center>
                
                <h3>Quick Start:</h3>
                <ol>
                  <li>Click the login button above</li>
                  <li>Enter your email and temporary password</li>
                  <li>Change your password in Settings</li>
                  <li>Set up your chatbot widget</li>
                  <li>Add your knowledge base Q&As</li>
                </ol>
                
                <p>If you have any issues logging in, please contact support@lenilani.com</p>
                
                <p>Best regards,<br>The LeniLani AI Team</p>
              </div>
            </div>
          </body>
          </html>
        `
      })
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Continue even if email fails - user can still login
    }
    
    return NextResponse.json({
      success: true,
      message: 'Account activated successfully',
      tempPassword, // Return password in response for immediate display
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`
    })
  } catch (error) {
    console.error('Account activation error:', error)
    return NextResponse.json(
      { error: 'Failed to activate account' },
      { status: 500 }
    )
  }
}

// GET endpoint to check activation status
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    
    const business = await prisma.business.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        tier: true,
        subscriptionStatus: true,
        password: true
      }
    })
    
    if (!business) {
      return NextResponse.json(
        { error: 'No account found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      exists: true,
      activated: business.password !== '' && business.password !== null,
      subscriptionStatus: business.subscriptionStatus,
      tier: business.tier
    })
  } catch (error) {
    console.error('Check activation error:', error)
    return NextResponse.json(
      { error: 'Failed to check activation status' },
      { status: 500 }
    )
  }
}