import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const leadSchema = z.object({
  conversationId: z.string(),
  businessId: z.string(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  message: z.string(),
  preferredContact: z.enum(['email', 'phone', 'either']).optional()
})

// CORS headers for widget
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = leadSchema.parse(body)
    
    // Create a guest profile if we have contact info
    if (validatedData.email || validatedData.phone) {
      const existingProfile = await prisma.guestProfile.findFirst({
        where: {
          businessId: validatedData.businessId,
          OR: [
            { email: validatedData.email || undefined },
            { phone: validatedData.phone || undefined }
          ]
        }
      })
      
      if (!existingProfile) {
        await prisma.guestProfile.create({
          data: {
            businessId: validatedData.businessId,
            name: validatedData.name || 'Guest',
            email: validatedData.email,
            phone: validatedData.phone,
            notes: `Lead from unanswered question: ${validatedData.message}`,
            preferences: {
              preferredContact: validatedData.preferredContact || 'either',
              source: 'chat_widget'
            },
            metadata: {
              capturedAt: new Date().toISOString(),
              leadType: 'unanswered_question'
            }
          }
        })
      } else {
        // Update existing profile with new info
        await prisma.guestProfile.update({
          where: { id: existingProfile.id },
          data: {
            name: validatedData.name || existingProfile.name,
            phone: validatedData.phone || existingProfile.phone,
            notes: `${existingProfile.notes || ''}\n\nNew inquiry: ${validatedData.message}`,
          }
        })
      }
    }
    
    // Store as a system message in the conversation for tracking
    await prisma.message.create({
      data: {
        conversationId: validatedData.conversationId,
        role: 'system',
        content: `Lead captured - Name: ${validatedData.name || 'Not provided'}, Email: ${validatedData.email || 'Not provided'}, Phone: ${validatedData.phone || 'Not provided'}, Question: ${validatedData.message}`
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Thank you! Someone from our team will contact you soon with the answer to your question.'
    }, { headers: corsHeaders })
    
  } catch (error) {
    console.error('Lead capture error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid lead data', details: error.errors },
        { status: 400, headers: corsHeaders }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to capture lead' },
      { status: 500, headers: corsHeaders }
    )
  }
}