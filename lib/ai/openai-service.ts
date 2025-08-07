import OpenAI from 'openai'
import { encode } from 'gpt-3-encoder'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface CompletionOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  stream?: boolean
}

interface EmbeddingOptions {
  model?: string
  dimensions?: number
}

export class OpenAIService {
  private client: OpenAI | null = null
  private apiKey: string
  private organizationId?: string
  
  constructor(apiKey?: string, organizationId?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || ''
    this.organizationId = organizationId || process.env.OPENAI_ORG_ID
    
    if (this.apiKey) {
      this.client = new OpenAI({
        apiKey: this.apiKey,
        organization: this.organizationId
      })
    }
  }
  
  isConfigured(): boolean {
    return !!this.client
  }
  
  // GPT-4 Chat Completion
  async createChatCompletion(
    messages: ChatMessage[],
    options: CompletionOptions = {}
  ): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI client not configured')
    }
    
    const {
      model = 'gpt-4-turbo-preview',
      temperature = 0.7,
      maxTokens = 500,
      topP = 1,
      frequencyPenalty = 0,
      presencePenalty = 0
    } = options
    
    try {
      const response = await this.client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        top_p: topP,
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty
      })
      
      return response.choices[0]?.message?.content || ''
    } catch (error: any) {
      console.error('OpenAI API error:', error)
      throw new Error(`Failed to generate response: ${error.message}`)
    }
  }
  
  // Streaming Chat Completion
  async createStreamingChatCompletion(
    messages: ChatMessage[],
    options: CompletionOptions = {},
    onChunk: (chunk: string) => void
  ): Promise<void> {
    if (!this.client) {
      throw new Error('OpenAI client not configured')
    }
    
    const {
      model = 'gpt-4-turbo-preview',
      temperature = 0.7,
      maxTokens = 500
    } = options
    
    try {
      const stream = await this.client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true
      })
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          onChunk(content)
        }
      }
    } catch (error: any) {
      console.error('OpenAI streaming error:', error)
      throw new Error(`Streaming failed: ${error.message}`)
    }
  }
  
  // Generate Embeddings for Semantic Search
  async createEmbedding(
    text: string,
    options: EmbeddingOptions = {}
  ): Promise<number[]> {
    if (!this.client) {
      throw new Error('OpenAI client not configured')
    }
    
    const { model = 'text-embedding-3-small' } = options
    
    try {
      const response = await this.client.embeddings.create({
        model,
        input: text
      })
      
      return response.data[0].embedding
    } catch (error: any) {
      console.error('Embedding error:', error)
      throw new Error(`Failed to create embedding: ${error.message}`)
    }
  }
  
  // Batch Embeddings
  async createBatchEmbeddings(
    texts: string[],
    options: EmbeddingOptions = {}
  ): Promise<number[][]> {
    if (!this.client) {
      throw new Error('OpenAI client not configured')
    }
    
    const { model = 'text-embedding-3-small' } = options
    
    try {
      const response = await this.client.embeddings.create({
        model,
        input: texts
      })
      
      return response.data.map(item => item.embedding)
    } catch (error: any) {
      console.error('Batch embedding error:', error)
      throw new Error(`Failed to create embeddings: ${error.message}`)
    }
  }
  
  // Count Tokens
  countTokens(text: string): number {
    try {
      return encode(text).length
    } catch (error) {
      console.error('Token counting error:', error)
      // Rough estimate: 1 token ≈ 4 characters
      return Math.ceil(text.length / 4)
    }
  }
  
  // Estimate Cost
  estimateCost(tokens: number, model: string = 'gpt-4-turbo-preview'): number {
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
      'text-embedding-3-small': { input: 0.00002, output: 0 },
      'text-embedding-3-large': { input: 0.00013, output: 0 }
    }
    
    const modelPricing = pricing[model] || pricing['gpt-4-turbo-preview']
    // Estimate assuming equal input/output
    return (tokens * (modelPricing.input + modelPricing.output)) / 1000
  }
  
  // Generate System Prompt for Hospitality
  generateHospitalityPrompt(businessInfo: any): string {
    return `You are an AI assistant for ${businessInfo.name}, a ${businessInfo.type} in Hawaii.
    
Your personality:
- Warm, welcoming, and professional
- Embody the Aloha spirit in all interactions
- Knowledgeable about local culture and attractions
- Helpful and eager to assist guests

Business details:
- Name: ${businessInfo.name}
- Type: ${businessInfo.type}
- Location: ${businessInfo.location || 'Hawaii'}
- Special features: ${businessInfo.features || 'Beautiful accommodations and excellent service'}

Always:
- Provide accurate information about the property
- Be helpful with booking inquiries
- Share local recommendations when appropriate
- Use a friendly, conversational tone
- Include relevant emojis occasionally 🌺

Never:
- Make up information you don't know
- Share sensitive business information
- Provide legal or medical advice
- Discuss competitors negatively`
  }
  
  // Fine-tuning Data Preparation
  prepareFinetuningData(conversations: any[]): any[] {
    return conversations.map(conv => ({
      messages: [
        {
          role: 'system',
          content: this.generateHospitalityPrompt(conv.business)
        },
        {
          role: 'user',
          content: conv.userMessage
        },
        {
          role: 'assistant',
          content: conv.assistantResponse
        }
      ]
    }))
  }
  
  // Check Model Availability
  async listAvailableModels(): Promise<string[]> {
    if (!this.client) {
      throw new Error('OpenAI client not configured')
    }
    
    try {
      const response = await this.client.models.list()
      return response.data
        .filter(model => model.id.includes('gpt'))
        .map(model => model.id)
    } catch (error: any) {
      console.error('Failed to list models:', error)
      return ['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo']
    }
  }
}

// Singleton instance
let openAIService: OpenAIService | null = null

export function getOpenAIService(): OpenAIService {
  if (!openAIService) {
    openAIService = new OpenAIService()
  }
  return openAIService
}

export default OpenAIService