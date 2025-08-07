import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth/jwt'
import { stringify } from 'csv-stringify/sync'

const prisma = new PrismaClient()

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
    const format = searchParams.get('format') || 'csv'

    // Fetch all knowledge base items
    const items = await prisma.knowledgeBase.findMany({
      where: { businessId: payload.businessId },
      orderBy: [
        { category: 'asc' },
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    if (format === 'json') {
      // Return as JSON
      return NextResponse.json(items)
    } else if (format === 'csv') {
      // Convert to CSV
      const csvData = stringify(items, {
        header: true,
        columns: [
          'category',
          'question',
          'answer',
          'keywords',
          'priority',
          'language',
          'isActive'
        ]
      })

      // Return as CSV file
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="knowledge-base-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else {
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 })
    }
  } catch (error) {
    console.error('Knowledge base export error:', error)
    return NextResponse.json(
      { error: 'Failed to export knowledge base' },
      { status: 500 }
    )
  }
}