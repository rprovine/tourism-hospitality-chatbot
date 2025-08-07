import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth/jwt'
import { parse } from 'csv-parse/sync'

const prisma = new PrismaClient()

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

    const formData = await request.formData()
    const file = formData.get('file') as File
    const format = formData.get('format') as string || 'csv'
    const mode = formData.get('mode') as string || 'append' // append or replace

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const content = await file.text()
    let items: any[] = []

    if (format === 'csv') {
      // Parse CSV
      items = parse(content, {
        columns: true,
        skip_empty_lines: true
      })
    } else if (format === 'json') {
      // Parse JSON
      items = JSON.parse(content)
    } else {
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 })
    }

    // Validate and clean data
    const validItems = items.map(item => ({
      businessId: payload.businessId,
      category: item.category || 'general',
      question: item.question || '',
      answer: item.answer || '',
      keywords: item.keywords || '',
      priority: parseInt(item.priority) || 0,
      language: item.language || 'en',
      isActive: item.isActive !== 'false' && item.isActive !== false
    })).filter(item => item.question && item.answer)

    if (validItems.length === 0) {
      return NextResponse.json({ error: 'No valid items found' }, { status: 400 })
    }

    // If replace mode, delete existing items first
    if (mode === 'replace') {
      await prisma.knowledgeBase.deleteMany({
        where: { businessId: payload.businessId }
      })
    }

    // Bulk create items
    const created = await prisma.knowledgeBase.createMany({
      data: validItems,
      skipDuplicates: true
    })

    return NextResponse.json({
      success: true,
      imported: created.count,
      total: validItems.length
    })
  } catch (error) {
    console.error('Knowledge base import error:', error)
    return NextResponse.json(
      { error: 'Failed to import knowledge base' },
      { status: 500 }
    )
  }
}