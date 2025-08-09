import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Webhook schema for PMS data
const bookingWebhookSchema = z.object({
  apiKey: z.string(),
  event: z.enum(['booking.created', 'booking.updated', 'booking.cancelled', 'guest.created', 'guest.updated']),
  data: z.object({
    // Guest Information
    guest: z.object({
      email: z.string().email().optional(),
      phone: z.string().optional(),
      name: z.string().optional(),
      vipStatus: z.boolean().optional(),
      loyaltyTier: z.string().optional(),
    }).optional(),
    
    // Booking Information
    booking: z.object({
      confirmationNumber: z.string(),
      checkIn: z.string(),
      checkOut: z.string(),
      roomType: z.string().optional(),
      rateCode: z.string().optional(),
      totalAmount: z.number(),
      roomRevenue: z.number().optional(),
      ancillaryRevenue: z.number().optional(),
      status: z.enum(['confirmed', 'cancelled', 'no-show', 'completed']).optional(),
      source: z.string().optional(), // OTA, Direct, Phone, Walk-in
      specialRequests: z.string().optional(),
    }).optional(),
    
    // Additional metadata
    propertyId: z.string().optional(),
    timestamp: z.string().optional(),
  })
})

// CORS headers for webhooks
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    // Get API key from header
    const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required in X-API-Key header' },
        { status: 401, headers: corsHeaders }
      )
    }
    
    // Find business by API key (using business ID as API key for now)
    const business = await prisma.business.findFirst({
      where: {
        id: apiKey
      }
    })
    
    if (!business) {
      return NextResponse.json(
        { error: 'Invalid API key. Use your Business ID as the API key.' },
        { status: 401, headers: corsHeaders }
      )
    }
    
    // Parse and validate webhook data
    const body = await request.json()
    const validatedData = bookingWebhookSchema.parse(body)
    
    // Process based on event type
    switch (validatedData.event) {
      case 'booking.created':
      case 'booking.updated':
        await handleBookingEvent(business.id, validatedData.data)
        break
        
      case 'booking.cancelled':
        await handleCancellation(business.id, validatedData.data)
        break
        
      case 'guest.created':
      case 'guest.updated':
        await handleGuestEvent(business.id, validatedData.data)
        break
    }
    
    // Log webhook receipt (stored as a message for now)
    await prisma.message.create({
      data: {
        conversationId: 'webhook-log', // Special conversation ID for webhooks
        role: 'system',
        content: JSON.stringify({
          businessId: business.id,
          event: validatedData.event,
          payload: body,
          status: 'processed',
          processedAt: new Date()
        })
      }
    })
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Webhook processed successfully',
        event: validatedData.event
      },
      { headers: corsHeaders }
    )
    
  } catch (error) {
    console.error('PMS webhook error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid webhook format',
          details: error.errors,
          example: {
            apiKey: 'your-api-key',
            event: 'booking.created',
            data: {
              guest: {
                email: 'guest@example.com',
                name: 'John Doe',
                phone: '+1234567890'
              },
              booking: {
                confirmationNumber: 'ABC123',
                checkIn: '2024-03-15',
                checkOut: '2024-03-20',
                totalAmount: 1500,
                roomRevenue: 1200,
                status: 'confirmed'
              }
            }
          }
        },
        { status: 400, headers: corsHeaders }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500, headers: corsHeaders }
    )
  }
}

async function handleBookingEvent(businessId: string, data: any) {
  const { guest, booking } = data
  
  if (!guest?.email && !guest?.phone) {
    console.warn('No guest contact information provided')
    return
  }
  
  // Find or create guest profile
  let guestProfile = null
  
  if (guest.email) {
    guestProfile = await prisma.guestProfile.findFirst({
      where: {
        businessId,
        email: guest.email
      }
    })
  }
  
  if (!guestProfile && guest.phone) {
    guestProfile = await prisma.guestProfile.findFirst({
      where: {
        businessId,
        phone: guest.phone
      }
    })
  }
  
  const bookingAmount = booking?.totalAmount || 0
  
  if (guestProfile) {
    // Update existing profile
    await prisma.guestProfile.update({
      where: { id: guestProfile.id },
      data: {
        name: guest.name || guestProfile.name,
        email: guest.email || guestProfile.email,
        phone: guest.phone || guestProfile.phone,
        totalBookings: { increment: 1 },
        lifetimeValue: { increment: bookingAmount },
        lastVisit: new Date(),
        metadata: {
          ...((guestProfile.metadata as any) || {}),
          lastBooking: booking,
          vipStatus: guest.vipStatus,
          loyaltyTier: guest.loyaltyTier
        }
      }
    })
  } else {
    // Create new profile
    guestProfile = await prisma.guestProfile.create({
      data: {
        businessId,
        email: guest.email,
        phone: guest.phone,
        name: guest.name,
        totalBookings: 1,
        lifetimeValue: bookingAmount,
        lastVisit: new Date(),
        metadata: {
          lastBooking: booking,
          vipStatus: guest.vipStatus,
          loyaltyTier: guest.loyaltyTier
        }
      }
    })
  }
  
  // Record the interaction
  if (guestProfile) {
    await prisma.guestInteraction.create({
      data: {
        guestProfileId: guestProfile.id,
        businessId,
        interactionType: 'booking',
        channel: 'pms_webhook',
        content: `Booking ${booking?.confirmationNumber}: ${booking?.checkIn} to ${booking?.checkOut}`,
        metadata: booking
      }
    })
  }
}

async function handleCancellation(businessId: string, data: any) {
  const { guest, booking } = data
  
  if (!guest?.email && !guest?.phone) return
  
  // Find guest profile
  const guestProfile = await prisma.guestProfile.findFirst({
    where: {
      businessId,
      OR: [
        { email: guest.email || undefined },
        { phone: guest.phone || undefined }
      ]
    }
  })
  
  if (guestProfile && booking?.totalAmount) {
    // Reduce lifetime value and booking count
    await prisma.guestProfile.update({
      where: { id: guestProfile.id },
      data: {
        totalBookings: { decrement: 1 },
        lifetimeValue: { decrement: booking.totalAmount },
        metadata: {
          ...((guestProfile.metadata as any) || {}),
          lastCancellation: booking
        }
      }
    })
    
    // Record cancellation
    await prisma.guestInteraction.create({
      data: {
        guestProfileId: guestProfile.id,
        businessId,
        interactionType: 'booking',
        channel: 'pms_webhook',
        content: `Cancelled booking ${booking.confirmationNumber}`,
        metadata: { ...booking, cancelled: true }
      }
    })
  }
}

async function handleGuestEvent(businessId: string, data: any) {
  const { guest } = data
  
  if (!guest?.email && !guest?.phone) return
  
  // Find or create guest profile
  let guestProfile = await prisma.guestProfile.findFirst({
    where: {
      businessId,
      OR: [
        { email: guest.email || undefined },
        { phone: guest.phone || undefined }
      ]
    }
  })
  
  if (guestProfile) {
    // Update existing profile
    await prisma.guestProfile.update({
      where: { id: guestProfile.id },
      data: {
        name: guest.name || guestProfile.name,
        email: guest.email || guestProfile.email,
        phone: guest.phone || guestProfile.phone,
        tags: guest.vipStatus ? ['VIP'] : guestProfile.tags,
        metadata: {
          ...((guestProfile.metadata as any) || {}),
          vipStatus: guest.vipStatus,
          loyaltyTier: guest.loyaltyTier
        }
      }
    })
  } else {
    // Create new profile
    await prisma.guestProfile.create({
      data: {
        businessId,
        email: guest.email,
        phone: guest.phone,
        name: guest.name,
        tags: guest.vipStatus ? ['VIP'] : [],
        metadata: {
          vipStatus: guest.vipStatus,
          loyaltyTier: guest.loyaltyTier
        }
      }
    })
  }
}