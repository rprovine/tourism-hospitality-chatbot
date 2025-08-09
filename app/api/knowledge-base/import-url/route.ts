import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth/jwt'

const prisma = new PrismaClient()

// Simple HTML to text conversion
function htmlToText(html: string): string {
  // Remove script and style elements
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  
  // Replace common block elements with newlines
  text = text.replace(/<\/?(div|p|br|h[1-6]|li|tr|blockquote)[^>]*>/gi, '\n')
  
  // Remove all other HTML tags
  text = text.replace(/<[^>]+>/g, ' ')
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ')
  text = text.replace(/&amp;/g, '&')
  text = text.replace(/&lt;/g, '<')
  text = text.replace(/&gt;/g, '>')
  text = text.replace(/&quot;/g, '"')
  text = text.replace(/&#39;/g, "'")
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ')
  text = text.replace(/\n\s*\n/g, '\n\n')
  
  return text.trim()
}

// Extract Q&A pairs from content
function extractQAPairs(content: string, url: string): Array<{question: string, answer: string, category: string}> {
  const pairs: Array<{question: string, answer: string, category: string}> = []
  
  // Split content into sections
  const sections = content.split(/\n\n+/)
  
  // Try to identify FAQ sections
  const faqPattern = /(?:frequently asked questions?|faq|q\s*&\s*a)/i
  let inFAQ = false
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim()
    
    if (faqPattern.test(section)) {
      inFAQ = true
      continue
    }
    
    // Look for Q&A patterns
    if (section.match(/^(q:|question:|what|how|why|when|where|who|is|can|do|does|should)/i)) {
      const question = section.replace(/^(q:|question:)/i, '').trim()
      const answer = sections[i + 1]?.trim() || ''
      
      if (answer && !answer.match(/^(q:|question:|what|how|why|when|where|who)/i)) {
        pairs.push({
          question,
          answer: answer.substring(0, 1000), // Limit answer length
          category: inFAQ ? 'FAQ' : 'General'
        })
        i++ // Skip the answer in next iteration
      }
    }
    
    // Create general entries for substantial content
    if (section.length > 100 && section.length < 1500 && !section.match(/^(q:|question:)/i)) {
      // Extract the first sentence as a pseudo-question
      const firstSentence = section.match(/^[^.!?]+[.!?]/)?.[0] || section.substring(0, 100)
      
      pairs.push({
        question: `Information about: ${firstSentence.substring(0, 200)}`,
        answer: section.substring(0, 1000),
        category: 'Website Content'
      })
    }
  }
  
  // If no Q&A pairs found, create some basic entries
  if (pairs.length === 0 && content.length > 100) {
    const chunks = content.match(/.{1,1000}/g) || []
    chunks.slice(0, 5).forEach((chunk, index) => {
      pairs.push({
        question: `Website information part ${index + 1} from ${url}`,
        answer: chunk.trim(),
        category: 'Website Content'
      })
    })
  }
  
  return pairs
}

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
    const { url, type } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Fetch the URL content
    let content = ''
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LeniLani/1.0)'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status}`)
      }
      
      const html = await response.text()
      content = htmlToText(html)
      
    } catch (fetchError: any) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${fetchError.message}` },
        { status: 400 }
      )
    }

    if (!content || content.length < 50) {
      return NextResponse.json(
        { error: 'No meaningful content found at the URL' },
        { status: 400 }
      )
    }

    // Extract Q&A pairs from content
    const qaPairs = extractQAPairs(content, url)

    if (qaPairs.length === 0) {
      return NextResponse.json(
        { error: 'Could not extract any Q&A pairs from the content' },
        { status: 400 }
      )
    }

    // Create knowledge base entries
    const entries = qaPairs.map(pair => ({
      businessId: payload.businessId,
      category: pair.category,
      question: pair.question,
      answer: pair.answer,
      keywords: '',
      priority: 0,
      language: 'en',
      isActive: true,
      source: url
    }))

    // Bulk create entries
    const created = await prisma.knowledgeBase.createMany({
      data: entries,
      skipDuplicates: true
    })

    return NextResponse.json({
      success: true,
      imported: created.count,
      total: qaPairs.length,
      message: `Successfully imported ${created.count} Q&A pairs from ${url}`
    })

  } catch (error: any) {
    console.error('URL import error:', error)
    return NextResponse.json(
      { error: 'Failed to import from URL', details: error.message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}