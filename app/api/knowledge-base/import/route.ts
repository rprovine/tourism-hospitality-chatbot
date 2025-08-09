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

    try {
      if (format === 'csv') {
        // Parse CSV
        items = parse(content, {
          columns: true,
          skip_empty_lines: true,
          relax_quotes: true,
          skip_records_with_error: true
        })
      } else if (format === 'json') {
        // Parse JSON
        const jsonData = JSON.parse(content)
        // Handle both array and object with items property
        items = Array.isArray(jsonData) ? jsonData : (jsonData.items || jsonData.data || [])
      } else if (format === 'txt') {
        // Parse TXT file - assume Q&A format with Q: and A: prefixes
        const lines = content.split('\n').filter(line => line.trim())
        let currentQ = ''
        let currentA = ''
        
        for (const line of lines) {
          if (line.startsWith('Q:') || line.startsWith('Question:')) {
            if (currentQ && currentA) {
              items.push({
                question: currentQ.trim(),
                answer: currentA.trim(),
                category: 'general'
              })
            }
            currentQ = line.replace(/^(Q:|Question:)\s*/i, '')
            currentA = ''
          } else if (line.startsWith('A:') || line.startsWith('Answer:')) {
            currentA = line.replace(/^(A:|Answer:)\s*/i, '')
          } else if (currentA) {
            // Continue answer on new line
            currentA += ' ' + line
          }
        }
        
        // Add last Q&A pair
        if (currentQ && currentA) {
          items.push({
            question: currentQ.trim(),
            answer: currentA.trim(),
            category: 'general'
          })
        }
        
        // If no Q&A format found, treat each line as a simple FAQ
        if (items.length === 0) {
          alert('Could not parse TXT file. Please use Q: and A: format.')
        }
      } else {
        return NextResponse.json({ error: 'Unsupported format. Please use CSV, JSON, or TXT.' }, { status: 400 })
      }
    } catch (parseError) {
      console.error('Parse error:', parseError)
      return NextResponse.json({ 
        error: `Failed to parse ${format.toUpperCase()} file. Please check the file format.`,
        details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
      }, { status: 400 })
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