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
  
  // Clean up content
  const cleanContent = content
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  
  // Split content into paragraphs
  const paragraphs = cleanContent.split(/\n+/).filter(p => p.trim().length > 30)
  
  // Extract meaningful sections
  for (let i = 0; i < paragraphs.length && pairs.length < 20; i++) {
    const para = paragraphs[i].trim()
    
    // Skip very short paragraphs
    if (para.length < 50) continue
    
    // Look for headings followed by content
    if (para.length < 200 && i + 1 < paragraphs.length) {
      const nextPara = paragraphs[i + 1].trim()
      if (nextPara.length > 100) {
        pairs.push({
          question: para.replace(/[:\-–—]$/, ''),
          answer: nextPara.substring(0, 1000),
          category: 'Website Content'
        })
        i++ // Skip the next paragraph
        continue
      }
    }
    
    // Extract as informational content
    if (para.length > 100 && para.length < 1500) {
      // Use first 100 chars or first sentence as the topic
      const firstSentence = para.match(/^[^.!?]{20,}[.!?]/)?.[0] || para.substring(0, 100)
      
      pairs.push({
        question: `Tell me about: ${firstSentence.substring(0, 150)}${firstSentence.length > 150 ? '...' : ''}`,
        answer: para.substring(0, 1000),
        category: 'Website Information'
      })
    }
  }
  
  // If we still don't have enough content, create basic entries
  if (pairs.length < 3 && cleanContent.length > 200) {
    // Split into reasonable chunks
    const chunkSize = 800
    const chunks = []
    for (let i = 0; i < cleanContent.length && chunks.length < 5; i += chunkSize) {
      chunks.push(cleanContent.substring(i, i + chunkSize))
    }
    
    chunks.forEach((chunk, index) => {
      const preview = chunk.substring(0, 100).replace(/\s+/g, ' ')
      pairs.push({
        question: `Website content (${index + 1}/${chunks.length}): ${preview}...`,
        answer: chunk.trim(),
        category: 'Imported Content'
      })
    })
  }
  
  // Add source attribution
  if (pairs.length > 0) {
    const hostname = new URL(url).hostname
    pairs.forEach(pair => {
      pair.answer = `${pair.answer}\n\n[Source: ${hostname}]`
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

    // Validate URL format
    let validUrl: URL
    try {
      validUrl = new URL(url)
      if (!['http:', 'https:'].includes(validUrl.protocol)) {
        throw new Error('Only HTTP/HTTPS URLs are supported')
      }
    } catch (urlError: any) {
      return NextResponse.json(
        { error: `Invalid URL format: ${urlError.message}` },
        { status: 400 }
      )
    }

    // Fetch the URL content
    let content = ''
    try {
      console.log(`Attempting to fetch URL: ${validUrl.toString()}`)
      
      // Create timeout controller
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch(validUrl.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
        throw new Error(`Unsupported content type: ${contentType}`)
      }
      
      const html = await response.text()
      content = htmlToText(html)
      
      console.log(`Successfully fetched ${html.length} characters, converted to ${content.length} text characters`)
      
    } catch (fetchError: any) {
      console.error('URL fetch error:', fetchError)
      
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout - the website took too long to respond' },
          { status: 408 }
        )
      }
      
      return NextResponse.json(
        { error: `Failed to fetch website: ${fetchError.message}` },
        { status: 400 }
      )
    }

    if (!content || content.length < 50) {
      console.log('Content too short:', content.length, 'characters')
      return NextResponse.json(
        { error: 'The webpage appears to be empty or has very little text content. Please try a different URL.' },
        { status: 400 }
      )
    }

    console.log(`Extracting Q&A pairs from ${content.length} characters of content`)
    
    // Extract Q&A pairs from content
    const qaPairs = extractQAPairs(content, validUrl.toString())

    if (qaPairs.length === 0) {
      console.log('No Q&A pairs extracted from content')
      return NextResponse.json(
        { error: 'Could not extract meaningful information from the webpage. The content may be too dynamic or image-based.' },
        { status: 400 }
      )
    }
    
    console.log(`Extracted ${qaPairs.length} Q&A pairs`)

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