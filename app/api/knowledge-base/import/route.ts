import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth/jwt'
import { parse } from 'csv-parse/sync'
import * as XLSX from 'xlsx'

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

    // Get business tier for feature gating
    const business = await prisma.business.findUnique({
      where: { id: payload.businessId },
      select: { tier: true }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const format = formData.get('format') as string || 'csv'
    const mode = formData.get('mode') as string || 'append' // append or replace

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Check tier restrictions for file formats
    const tierRestrictions: Record<string, string[]> = {
      starter: ['csv', 'json', 'txt'],
      professional: ['csv', 'json', 'txt', 'xlsx', 'xls'],
      premium: ['csv', 'json', 'txt', 'xlsx', 'xls', 'pdf', 'docx'],
      enterprise: ['csv', 'json', 'txt', 'xlsx', 'xls', 'pdf', 'docx', 'pptx']
    }

    const allowedFormats = tierRestrictions[business.tier] || tierRestrictions.starter
    
    if (!allowedFormats.includes(format)) {
      return NextResponse.json({ 
        error: `${format.toUpperCase()} files are not available in your ${business.tier} plan`,
        upgrade: format === 'xlsx' || format === 'xls' ? 'professional' : 'premium',
        message: `Upgrade to ${format === 'xlsx' || format === 'xls' ? 'Professional' : 'Premium'} to upload ${format.toUpperCase()} files`
      }, { status: 403 })
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
          return NextResponse.json({ error: 'Could not parse TXT file. Please use Q: and A: format.' }, { status: 400 })
        }
      } else if (format === 'xlsx' || format === 'xls') {
        // Parse Excel file (Professional+ tiers)
        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        // Map Excel data to knowledge base format
        items = jsonData.map((row: any) => ({
          question: row.question || row.Question || row.q || row.Q || '',
          answer: row.answer || row.Answer || row.a || row.A || '',
          category: row.category || row.Category || 'general',
          keywords: row.keywords || row.Keywords || '',
          priority: parseInt(row.priority || row.Priority || '0') || 0,
          language: row.language || row.Language || 'en'
        })).filter(item => item.question && item.answer)
        
        if (items.length === 0) {
          return NextResponse.json({ 
            error: 'No valid Q&A pairs found in Excel file. Please ensure columns are named: question, answer, category' 
          }, { status: 400 })
        }
      } else if (format === 'pdf') {
        // Parse PDF file (Premium+ tiers)
        try {
          // Dynamic import to avoid build issues
          const pdf = (await import('pdf-parse')).default
          const buffer = await file.arrayBuffer()
          const data = await pdf(Buffer.from(buffer))
          const text = data.text
          
          // Extract Q&A patterns from PDF text
          const lines = text.split('\n').filter(line => line.trim())
          let currentQ = ''
          let currentA = ''
          
          for (const line of lines) {
            // Look for Q&A patterns, FAQs, or numbered questions
            if (line.match(/^(Q:|Question:|FAQ:|^\d+\.\s)/i)) {
              if (currentQ && currentA) {
                items.push({
                  question: currentQ.trim(),
                  answer: currentA.trim(),
                  category: 'imported_from_pdf'
                })
              }
              currentQ = line.replace(/^(Q:|Question:|FAQ:|^\d+\.\s)/i, '').trim()
              currentA = ''
            } else if (line.match(/^(A:|Answer:)/i)) {
              currentA = line.replace(/^(A:|Answer:)/i, '').trim()
            } else if (currentQ && !currentA && line.trim()) {
              // If we have a question but no answer marker, next non-empty line might be the answer
              currentA = line.trim()
            } else if (currentA && line.trim()) {
              // Continue answer on new line
              currentA += ' ' + line.trim()
            }
          }
          
          // Add last Q&A pair
          if (currentQ && currentA) {
            items.push({
              question: currentQ.trim(),
              answer: currentA.trim(),
              category: 'imported_from_pdf'
            })
          }
          
          if (items.length === 0) {
            // Try alternative parsing - look for FAQ sections or help content
            const faqs = text.match(/(?:^|\n)([^?\n]+\?)\s*\n+([^?\n]+?)(?=\n[^?\n]+\?|\n\n|\$)/gi) || []
            items = faqs.map(faq => {
              const parts = faq.trim().split('\n').filter(p => p.trim())
              if (parts.length >= 2) {
                return {
                  question: parts[0].trim(),
                  answer: parts.slice(1).join(' ').trim(),
                  category: 'imported_from_pdf'
                }
              }
              return null
            }).filter(Boolean)
          }
          
          if (items.length === 0) {
            return NextResponse.json({ 
              error: 'Could not extract Q&A pairs from PDF. Please ensure the PDF contains question and answer patterns.' 
            }, { status: 400 })
          }
        } catch (pdfError) {
          console.error('PDF parsing error:', pdfError)
          return NextResponse.json({ 
            error: 'Failed to parse PDF file. Please ensure it\'s a valid PDF document.' 
          }, { status: 400 })
        }
      } else {
        return NextResponse.json({ error: 'Unsupported format.' }, { status: 400 })
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