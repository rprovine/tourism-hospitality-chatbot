import OpenAI from 'openai'
import { KnowledgeBaseMatch } from './knowledge-base-search'

// Use OpenAI's cheapest model for embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

// Cache for embeddings to reduce API calls
const embeddingCache = new Map<string, number[]>()

/**
 * Generate embedding for a text using OpenAI's cheapest embedding model
 */
async function getEmbedding(text: string): Promise<number[]> {
  // Check cache first
  const cached = embeddingCache.get(text)
  if (cached) return cached
  
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small', // Cheapest embedding model
      input: text,
      encoding_format: 'float'
    })
    
    const embedding = response.data[0].embedding
    
    // Cache the result
    embeddingCache.set(text, embedding)
    
    return embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    // Return empty array as fallback
    return []
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0
  
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  
  normA = Math.sqrt(normA)
  normB = Math.sqrt(normB)
  
  if (normA === 0 || normB === 0) return 0
  
  return dotProduct / (normA * normB)
}

/**
 * Find semantically similar questions using AI embeddings
 */
export async function findSemanticMatches(
  query: string,
  knowledgeBaseItems: Array<{
    question: string
    answer: string
    category: string
    keywords: string
  }>,
  threshold: number = 0.7,
  limit: number = 3
): Promise<KnowledgeBaseMatch[]> {
  // If OpenAI API key is not available, return empty array
  if (!process.env.OPENAI_API_KEY) {
    console.log('OpenAI API key not configured - semantic search disabled')
    return []
  }
  
  try {
    // Get embedding for the query
    const queryEmbedding = await getEmbedding(query.toLowerCase())
    
    if (queryEmbedding.length === 0) {
      return []
    }
    
    // Calculate similarity scores for all items
    const scoredItems = await Promise.all(
      knowledgeBaseItems.map(async (item) => {
        // Combine question and keywords for better matching
        const itemText = `${item.question} ${item.keywords}`.toLowerCase()
        const itemEmbedding = await getEmbedding(itemText)
        
        if (itemEmbedding.length === 0) {
          return { ...item, score: 0 }
        }
        
        const similarity = cosineSimilarity(queryEmbedding, itemEmbedding)
        
        // Convert similarity to a 0-100 score
        const score = Math.round(similarity * 100)
        
        return {
          question: item.question,
          answer: item.answer,
          category: item.category,
          score
        }
      })
    )
    
    // Filter by threshold and sort by score
    const matches = scoredItems
      .filter(item => item.score >= threshold * 100)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
    
    return matches
  } catch (error) {
    console.error('Semantic search error:', error)
    return []
  }
}

/**
 * Use GPT-3.5-turbo (cheapest chat model) to determine if a query matches a knowledge base item
 */
export async function checkSemanticMatch(
  userQuery: string,
  kbQuestion: string,
  kbKeywords: string
): Promise<boolean> {
  if (!process.env.OPENAI_API_KEY) {
    return false
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Cheapest chat model
      messages: [
        {
          role: 'system',
          content: 'You are a semantic matching assistant. Determine if the user query is asking about the same topic as the knowledge base question. Consider synonyms, different phrasings, and related concepts. Respond with only "yes" or "no".'
        },
        {
          role: 'user',
          content: `User Query: "${userQuery}"
Knowledge Base Question: "${kbQuestion}"
Related Keywords: "${kbKeywords}"

Is the user asking about the same topic?`
        }
      ],
      temperature: 0,
      max_tokens: 10
    })
    
    const answer = response.choices[0]?.message?.content?.toLowerCase().trim()
    return answer === 'yes'
  } catch (error) {
    console.error('Error checking semantic match:', error)
    return false
  }
}