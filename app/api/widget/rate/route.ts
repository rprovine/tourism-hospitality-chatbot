import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const ratingSchema = z.object({
  conversationId: z.string(),
  rating: z.number().min(1).max(5),
  feedback: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = ratingSchema.parse(body)
    
    // Update conversation with satisfaction rating
    const conversation = await prisma.conversation.update({
      where: { id: validatedData.conversationId },
      data: { 
        satisfaction: validatedData.rating,
        resolved: true // Mark as resolved when rated
      }
    })
    
    // Optionally store feedback as a message
    if (validatedData.feedback) {
      await prisma.message.create({
        data: {
          conversationId: validatedData.conversationId,
          role: 'system',
          content: `Customer feedback (${validatedData.rating}/5 stars): ${validatedData.feedback}`
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback!'
    })
    
  } catch (error: any) {
    console.error('Rating error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid rating data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to submit rating' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}