import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { checkKnowledgeBaseLimit, checkApiRateLimit, isLanguageSupported } from '@/lib/tier-limits'

const prisma = new PrismaClient()

const knowledgeBaseSchema = z.object({
  question: z.string().min(1).max(500),
  answer: z.string().min(1).max(2000),
  category: z.string().default('general'),
  keywords: z.string().optional(),
  language: z.string().default('en'),
  priority: z.number().min(0).max(10).default(0)
})

// Authenticate API request
async function authenticateRequest(request: NextRequest) {
  const apiKey = request.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!apiKey) {
    return { error: 'API key required', status: 401 }
  }

  const business = await prisma.business.findUnique({
    where: { apiKey }
  })

  if (!business) {
    return { error: 'Invalid API key', status: 401 }
  }

  if (business.tier === 'starter') {
    return { error: 'API access not available for Starter plan', status: 403 }
  }

  // Check rate limits
  const rateLimit = await checkApiRateLimit(business.id, business.tier, prisma)
  if (!rateLimit.allowed) {
    return { 
      error: 'Rate limit exceeded',
      limit: rateLimit.limit,
      status: 429 
    }
  }

  // Log API request
  await prisma.apiLog.create({
    data: {
      businessId: business.id,
      endpoint: '/api/v1/knowledge-base',
      method: request.method,
      statusCode: 200,
      responseTime: 0
    }
  })

  return { business, rateLimit }
}

// GET - List knowledge base items
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const language = searchParams.get('language') || 'en'
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {
      businessId: auth.business.id,
      isActive: true
    }

    if (category) where.category = category
    if (language) where.language = language

    const [items, total] = await Promise.all([
      prisma.knowledgeBase.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { updatedAt: 'desc' }
        ],
        take: limit,
        skip: offset,
        select: {
          id: true,
          question: true,
          answer: true,
          category: true,
          keywords: true,
          language: true,
          priority: true,
          usageCount: true,
          lastUsed: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.knowledgeBase.count({ where })
    ])

    return NextResponse.json({
      items,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      usage: {
        rateLimit: {
          remaining: auth.rateLimit.remaining,
          limit: auth.rateLimit.limit
        }
      }
    })
  } catch (error) {
    console.error('Knowledge base API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create knowledge base item
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const validatedData = knowledgeBaseSchema.parse(body)

    // Check knowledge base limits
    const kbLimit = await checkKnowledgeBaseLimit(
      auth.business.id,
      auth.business.tier,
      prisma
    )
    
    if (!kbLimit.allowed) {
      return NextResponse.json({
        error: `Knowledge base limit reached (${kbLimit.limit} items)`,
        limit: kbLimit.limit,
        used: kbLimit.limit
      }, { status: 429 })
    }

    // Check language support
    if (!isLanguageSupported(auth.business.tier, validatedData.language)) {
      return NextResponse.json({
        error: `Language '${validatedData.language}' not supported in ${auth.business.tier} plan`
      }, { status: 400 })
    }

    // Create knowledge base item
    const item = await prisma.knowledgeBase.create({
      data: {
        businessId: auth.business.id,
        ...validatedData,
        keywords: validatedData.keywords || '',
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      item,
      usage: {
        knowledgeBaseRemaining: kbLimit.remaining ? kbLimit.remaining - 1 : null,
        rateLimit: {
          remaining: auth.rateLimit.remaining,
          limit: auth.rateLimit.limit
        }
      }
    })
  } catch (error) {
    console.error('Knowledge base create error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update knowledge base item
export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const existing = await prisma.knowledgeBase.findFirst({
      where: {
        id,
        businessId: auth.business.id
      }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    // Update item
    const updated = await prisma.knowledgeBase.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      item: updated
    })
  } catch (error) {
    console.error('Knowledge base update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete knowledge base item
export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID required' },
        { status: 400 }
      )
    }

    // Verify ownership and delete
    const deleted = await prisma.knowledgeBase.deleteMany({
      where: {
        id,
        businessId: auth.business.id
      }
    })

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully'
    })
  } catch (error) {
    console.error('Knowledge base delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}