import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { verifyToken } from '@/lib/auth/jwt'

const prisma = new PrismaClient()

const knowledgeBaseSchema = z.object({
  category: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
  keywords: z.string(),
  priority: z.number().int().min(0).max(10).default(0),
  language: z.string().default('en'),
  isActive: z.boolean().default(true)
})

// GET - Fetch all knowledge base items for a business
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const language = searchParams.get('language')
    const isActive = searchParams.get('isActive')

    const where: any = { businessId: payload.businessId }
    
    if (category) where.category = category
    if (language) where.language = language
    if (isActive !== null) where.isActive = isActive === 'true'

    const items = await prisma.knowledgeBase.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { category: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    // Get categories for filtering
    const categories = await prisma.knowledgeBase.findMany({
      where: { businessId: payload.businessId },
      select: { category: true },
      distinct: ['category']
    })

    return NextResponse.json({
      items,
      categories: [...new Set(categories.map(c => c.category))],
      total: items.length
    })
  } catch (error) {
    console.error('Knowledge base GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch knowledge base' },
      { status: 500 }
    )
  }
}

// POST - Create a new knowledge base item
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = knowledgeBaseSchema.parse(body)

    const item = await prisma.knowledgeBase.create({
      data: {
        businessId: payload.businessId,
        ...validatedData
      }
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Knowledge base POST error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create knowledge base item' },
      { status: 500 }
    )
  }
}

// PUT - Update a knowledge base item
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 })
    }

    // Verify ownership
    const existing = await prisma.knowledgeBase.findFirst({
      where: { id, businessId: payload.businessId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const validatedData = knowledgeBaseSchema.partial().parse(data)

    const updated = await prisma.knowledgeBase.update({
      where: { id },
      data: validatedData
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Knowledge base PUT error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update knowledge base item' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a knowledge base item
export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 })
    }

    // Verify ownership
    const existing = await prisma.knowledgeBase.findFirst({
      where: { id, businessId: payload.businessId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    await prisma.knowledgeBase.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Knowledge base DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete knowledge base item' },
      { status: 500 }
    )
  }
}