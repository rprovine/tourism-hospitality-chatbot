import { PrismaClient } from '@prisma/client'
import { OpenAIService } from './openai-service'
import { SentimentAnalyzer } from './sentiment-analyzer'

interface LearningData {
  question: string
  answer: string
  feedback: 'positive' | 'negative' | 'neutral'
  context?: any
  timestamp: Date
}

interface Pattern {
  pattern: string
  frequency: number
  avgSentiment: number
  successRate: number
  suggestedResponse?: string
}

interface Insight {
  type: 'improvement' | 'issue' | 'opportunity' | 'trend'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  recommendation: string
  metrics?: any
}

export class LearningEngine {
  private prisma: PrismaClient
  private openAI: OpenAIService
  private sentimentAnalyzer: SentimentAnalyzer
  private learningData: LearningData[] = []
  private patterns: Map<string, Pattern> = new Map()
  private insights: Insight[] = []
  
  constructor(
    prisma: PrismaClient,
    openAIService?: OpenAIService,
    sentimentAnalyzer?: SentimentAnalyzer
  ) {
    this.prisma = prisma
    this.openAI = openAIService || new OpenAIService()
    this.sentimentAnalyzer = sentimentAnalyzer || new SentimentAnalyzer(this.openAI)
  }
  
  // Learn from conversation feedback
  async learnFromFeedback(
    conversationId: string,
    feedback: 'positive' | 'negative' | 'neutral',
    additionalContext?: any
  ): Promise<void> {
    try {
      // Fetch conversation details
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      })
      
      if (!conversation) return
      
      // Extract Q&A pairs
      const messages = conversation.messages
      for (let i = 0; i < messages.length - 1; i++) {
        if (messages[i].role === 'user' && messages[i + 1].role === 'assistant') {
          this.learningData.push({
            question: messages[i].content,
            answer: messages[i + 1].content,
            feedback,
            context: additionalContext,
            timestamp: new Date()
          })
          
          // Update pattern recognition
          await this.updatePatterns(messages[i].content, feedback)
        }
      }
      
      // Store feedback in database
      await this.prisma.conversationFeedback.create({
        data: {
          conversationId,
          feedback,
          context: additionalContext || {},
          timestamp: new Date()
        }
      })
      
      // Generate insights if enough data
      if (this.learningData.length % 50 === 0) {
        await this.generateInsights()
      }
    } catch (error) {
      console.error('Learning from feedback failed:', error)
    }
  }
  
  // Update pattern recognition
  private async updatePatterns(question: string, feedback: 'positive' | 'negative' | 'neutral'): Promise<void> {
    // Extract key phrases
    const keyPhrases = this.extractKeyPhrases(question)
    
    for (const phrase of keyPhrases) {
      const existing = this.patterns.get(phrase) || {
        pattern: phrase,
        frequency: 0,
        avgSentiment: 0,
        successRate: 0
      }
      
      existing.frequency++
      
      // Update success rate
      const feedbackScore = feedback === 'positive' ? 1 : feedback === 'negative' ? 0 : 0.5
      existing.successRate = (existing.successRate * (existing.frequency - 1) + feedbackScore) / existing.frequency
      
      // Analyze sentiment
      const sentiment = await this.sentimentAnalyzer.analyzeMessage(question)
      existing.avgSentiment = (existing.avgSentiment * (existing.frequency - 1) + sentiment.score) / existing.frequency
      
      this.patterns.set(phrase, existing)
    }
  }
  
  // Extract key phrases from text
  private extractKeyPhrases(text: string): string[] {
    const phrases: string[] = []
    const words = text.toLowerCase().split(/\s+/)
    
    // Single words
    const importantWords = words.filter(word => 
      word.length > 4 && !this.isStopWord(word)
    )
    phrases.push(...importantWords)
    
    // Bi-grams
    for (let i = 0; i < words.length - 1; i++) {
      if (!this.isStopWord(words[i]) || !this.isStopWord(words[i + 1])) {
        phrases.push(`${words[i]} ${words[i + 1]}`)
      }
    }
    
    // Tri-grams for questions
    if (text.includes('?')) {
      for (let i = 0; i < words.length - 2; i++) {
        phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`)
      }
    }
    
    return phrases
  }
  
  // Check if word is a stop word
  private isStopWord(word: string): boolean {
    const stopWords = [
      'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
      'in', 'with', 'to', 'for', 'of', 'as', 'from', 'by', 'that', 'this',
      'it', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might'
    ]
    return stopWords.includes(word.toLowerCase())
  }
  
  // Generate insights from learned data
  async generateInsights(): Promise<Insight[]> {
    this.insights = []
    
    // Analyze pattern performance
    const lowPerformingPatterns = Array.from(this.patterns.values())
      .filter(p => p.frequency > 5 && p.successRate < 0.5)
      .sort((a, b) => a.successRate - b.successRate)
      .slice(0, 5)
    
    for (const pattern of lowPerformingPatterns) {
      this.insights.push({
        type: 'issue',
        title: `Low Success Rate for "${pattern.pattern}"`,
        description: `Questions containing "${pattern.pattern}" have only ${(pattern.successRate * 100).toFixed(0)}% success rate`,
        impact: pattern.frequency > 20 ? 'high' : 'medium',
        recommendation: `Review and improve responses for questions about "${pattern.pattern}"`,
        metrics: {
          frequency: pattern.frequency,
          successRate: pattern.successRate,
          avgSentiment: pattern.avgSentiment
        }
      })
    }
    
    // Identify trending topics
    const recentPatterns = Array.from(this.patterns.values())
      .filter(p => p.frequency > 3)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10)
    
    if (recentPatterns.length > 0) {
      this.insights.push({
        type: 'trend',
        title: 'Trending Topics',
        description: `Most frequent topics: ${recentPatterns.slice(0, 3).map(p => p.pattern).join(', ')}`,
        impact: 'medium',
        recommendation: 'Consider creating dedicated FAQ entries or improving responses for these topics',
        metrics: {
          topPatterns: recentPatterns.slice(0, 5).map(p => ({
            pattern: p.pattern,
            frequency: p.frequency
          }))
        }
      })
    }
    
    // Sentiment-based insights
    const negativePatterns = Array.from(this.patterns.values())
      .filter(p => p.avgSentiment < -0.3 && p.frequency > 3)
    
    if (negativePatterns.length > 0) {
      this.insights.push({
        type: 'improvement',
        title: 'Negative Sentiment Patterns',
        description: `${negativePatterns.length} topics consistently show negative sentiment`,
        impact: 'high',
        recommendation: 'Prioritize improving responses for these topics to enhance customer satisfaction',
        metrics: {
          patterns: negativePatterns.map(p => ({
            pattern: p.pattern,
            sentiment: p.avgSentiment,
            frequency: p.frequency
          }))
        }
      })
    }
    
    // Success opportunities
    const highPerformingPatterns = Array.from(this.patterns.values())
      .filter(p => p.frequency > 10 && p.successRate > 0.8)
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 3)
    
    if (highPerformingPatterns.length > 0) {
      this.insights.push({
        type: 'opportunity',
        title: 'High-Performing Response Areas',
        description: `Excellent performance in: ${highPerformingPatterns.map(p => p.pattern).join(', ')}`,
        impact: 'low',
        recommendation: 'Use these successful patterns as templates for improving other responses',
        metrics: {
          patterns: highPerformingPatterns.map(p => ({
            pattern: p.pattern,
            successRate: p.successRate,
            frequency: p.frequency
          }))
        }
      })
    }
    
    return this.insights
  }
  
  // Get response suggestions based on learning
  async getSuggestedResponse(question: string): Promise<{
    suggestion: string | null
    confidence: number
    reasoning: string
  }> {
    // Extract phrases from question
    const phrases = this.extractKeyPhrases(question)
    
    // Find matching patterns
    const matches: Pattern[] = []
    for (const phrase of phrases) {
      const pattern = this.patterns.get(phrase)
      if (pattern && pattern.frequency > 3) {
        matches.push(pattern)
      }
    }
    
    if (matches.length === 0) {
      return {
        suggestion: null,
        confidence: 0,
        reasoning: 'No matching patterns found'
      }
    }
    
    // Sort by success rate and frequency
    matches.sort((a, b) => {
      const scoreA = a.successRate * Math.log(a.frequency + 1)
      const scoreB = b.successRate * Math.log(b.frequency + 1)
      return scoreB - scoreA
    })
    
    const bestMatch = matches[0]
    
    // Find similar successful responses
    const similarResponses = this.learningData
      .filter(d => 
        d.feedback === 'positive' &&
        d.question.toLowerCase().includes(bestMatch.pattern)
      )
      .slice(-5) // Get last 5 successful responses
    
    if (similarResponses.length === 0) {
      return {
        suggestion: null,
        confidence: 0,
        reasoning: 'No successful responses found for this pattern'
      }
    }
    
    // Use OpenAI to generate a response based on successful examples
    if (this.openAI.isConfigured()) {
      try {
        const examples = similarResponses
          .map(r => `Q: ${r.question}\nA: ${r.answer}`)
          .join('\n\n')
        
        const prompt = `Based on these successful customer service interactions:

${examples}

Generate a similar helpful response for this question:
"${question}"

Response:`
        
        const suggestion = await this.openAI.createChatCompletion(
          [
            {
              role: 'system',
              content: 'You are a helpful hospitality AI assistant. Generate responses based on successful examples.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          {
            temperature: 0.7,
            maxTokens: 200
          }
        )
        
        return {
          suggestion,
          confidence: bestMatch.successRate,
          reasoning: `Based on ${similarResponses.length} successful responses to similar questions about "${bestMatch.pattern}"`
        }
      } catch (error) {
        console.error('Failed to generate suggestion:', error)
      }
    }
    
    // Fallback: return most successful similar response
    const bestResponse = similarResponses[similarResponses.length - 1]
    return {
      suggestion: bestResponse.answer,
      confidence: bestMatch.successRate * 0.8, // Lower confidence for direct reuse
      reasoning: `Reusing successful response for "${bestMatch.pattern}" (${(bestMatch.successRate * 100).toFixed(0)}% success rate)`
    }
  }
  
  // Get learning statistics
  async getStatistics(): Promise<{
    totalLearned: number
    patternsIdentified: number
    avgSuccessRate: number
    topPatterns: Pattern[]
    insights: Insight[]
    improvementAreas: string[]
  }> {
    const patterns = Array.from(this.patterns.values())
    const avgSuccessRate = patterns.length > 0
      ? patterns.reduce((sum, p) => sum + p.successRate, 0) / patterns.length
      : 0
    
    const improvementAreas = patterns
      .filter(p => p.frequency > 5 && p.successRate < 0.6)
      .map(p => p.pattern)
      .slice(0, 5)
    
    return {
      totalLearned: this.learningData.length,
      patternsIdentified: this.patterns.size,
      avgSuccessRate,
      topPatterns: patterns
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10),
      insights: this.insights,
      improvementAreas
    }
  }
  
  // Export learning data for fine-tuning
  async exportForFineTuning(): Promise<any[]> {
    const successfulInteractions = this.learningData
      .filter(d => d.feedback === 'positive')
      .map(d => ({
        messages: [
          { role: 'user', content: d.question },
          { role: 'assistant', content: d.answer }
        ]
      }))
    
    return successfulInteractions
  }
  
  // Clear old learning data
  async pruneOldData(daysToKeep: number = 90): Promise<void> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
    
    this.learningData = this.learningData.filter(
      d => d.timestamp > cutoffDate
    )
    
    // Rebuild patterns from remaining data
    this.patterns.clear()
    for (const data of this.learningData) {
      await this.updatePatterns(data.question, data.feedback)
    }
  }
}

export default LearningEngine