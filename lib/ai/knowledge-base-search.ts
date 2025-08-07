import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface KnowledgeBaseMatch {
  question: string
  answer: string
  category: string
  score: number
}

export async function searchKnowledgeBase(
  businessId: string,
  query: string,
  language: string = 'en',
  limit: number = 3
): Promise<KnowledgeBaseMatch[]> {
  try {
    // Get all active knowledge base items for the business
    const items = await prisma.knowledgeBase.findMany({
      where: {
        businessId,
        isActive: true,
        language
      },
      orderBy: [
        { priority: 'desc' },
        { usageCount: 'desc' }
      ]
    })

    if (items.length === 0) return []

    // Simple keyword matching algorithm
    const queryLower = query.toLowerCase()
    const queryWords = queryLower.split(/\s+/)
    
    const matches = items.map(item => {
      let score = 0
      
      // Check exact question match
      if (item.question.toLowerCase() === queryLower) {
        score += 100
      }
      
      // Check question contains query
      if (item.question.toLowerCase().includes(queryLower)) {
        score += 50
      }
      
      // Check keywords
      const keywords = item.keywords.toLowerCase().split(',').map(k => k.trim())
      for (const keyword of keywords) {
        if (queryLower.includes(keyword) || keyword.includes(queryLower)) {
          score += 30
        }
        for (const word of queryWords) {
          if (keyword.includes(word) || word.includes(keyword)) {
            score += 10
          }
        }
      }
      
      // Check question word matching
      const questionWords = item.question.toLowerCase().split(/\s+/)
      for (const queryWord of queryWords) {
        for (const questionWord of questionWords) {
          if (questionWord === queryWord) {
            score += 5
          } else if (questionWord.includes(queryWord) || queryWord.includes(questionWord)) {
            score += 2
          }
        }
      }
      
      // Boost by priority
      score += item.priority * 5
      
      return {
        question: item.question,
        answer: item.answer,
        category: item.category,
        score,
        id: item.id
      }
    })
    
    // Filter and sort by score
    const relevantMatches = matches
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
    
    // Update usage statistics for matched items
    if (relevantMatches.length > 0) {
      const topMatch = relevantMatches[0]
      await prisma.knowledgeBase.update({
        where: { id: (topMatch as any).id },
        data: {
          usageCount: { increment: 1 },
          lastUsed: new Date()
        }
      }).catch(console.error) // Don't fail if update fails
    }
    
    return relevantMatches.map(({ question, answer, category, score }) => ({
      question,
      answer,
      category,
      score
    }))
  } catch (error) {
    console.error('Knowledge base search error:', error)
    return []
  }
}

export async function getBusinessKnowledgeContext(
  businessId: string,
  language: string = 'en'
): Promise<string> {
  try {
    const items = await prisma.knowledgeBase.findMany({
      where: {
        businessId,
        isActive: true,
        language
      },
      orderBy: [
        { category: 'asc' },
        { priority: 'desc' }
      ],
      take: 50 // Limit context size
    })

    if (items.length === 0) return ''

    // Group by category for better context
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(`Q: ${item.question}\nA: ${item.answer}`)
      return acc
    }, {} as Record<string, string[]>)

    // Format as context
    const context = Object.entries(grouped)
      .map(([category, qas]) => {
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')
        return `## ${categoryName}\n${qas.join('\n\n')}`
      })
      .join('\n\n')

    return `Business Knowledge Base:\n\n${context}`
  } catch (error) {
    console.error('Error getting knowledge context:', error)
    return ''
  }
}