import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createEnterpriseQuoteRequest } from '@/lib/payments/hubspot'

const enterpriseQuoteSchema = z.object({
  businessName: z.string().min(2),
  contactName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  estimatedRooms: z.number().min(100),
  properties: z.number().min(1),
  requirements: z.string().min(10),
  currentSystem: z.string().optional(),
  timeline: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = enterpriseQuoteSchema.parse(body)

    // Create enterprise quote request in HubSpot
    const result = await createEnterpriseQuoteRequest({
      businessName: validatedData.businessName,
      contactName: validatedData.contactName,
      email: validatedData.email,
      phone: validatedData.phone,
      estimatedRooms: validatedData.estimatedRooms,
      properties: validatedData.properties,
      requirements: validatedData.requirements
    })

    // Send notification email to sales team
    // You can integrate with HubSpot's email API or another service here
    
    return NextResponse.json({
      success: true,
      message: 'Enterprise quote request submitted successfully',
      contactId: result.contactId,
      dealId: result.dealId
    })
  } catch (error) {
    console.error('Enterprise quote error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to submit enterprise quote request' },
      { status: 500 }
    )
  }
}