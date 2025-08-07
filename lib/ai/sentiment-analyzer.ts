import { OpenAIService } from './openai-service'

export interface SentimentAnalysis {
  score: number // -1 to 1 (-1 = negative, 0 = neutral, 1 = positive)
  label: 'positive' | 'neutral' | 'negative'
  confidence: number // 0 to 1
  emotions: {
    joy: number
    anger: number
    sadness: number
    fear: number
    surprise: number
    disgust: number
  }
  topics: string[]
  intent: string
  urgency: 'low' | 'medium' | 'high'
  requiresHumanReview: boolean
}

export class SentimentAnalyzer {
  private openAI: OpenAIService
  
  constructor(openAIService?: OpenAIService) {
    this.openAI = openAIService || new OpenAIService()
  }
  
  async analyzeMessage(message: string): Promise<SentimentAnalysis> {
    if (!this.openAI.isConfigured()) {
      // Fallback to basic sentiment analysis
      return this.basicSentimentAnalysis(message)
    }
    
    try {
      const prompt = `Analyze the following customer message and provide a detailed sentiment analysis in JSON format:

Message: "${message}"

Provide the analysis with these exact fields:
{
  "score": <number from -1 to 1>,
  "label": <"positive", "neutral", or "negative">,
  "confidence": <number from 0 to 1>,
  "emotions": {
    "joy": <0-1>,
    "anger": <0-1>,
    "sadness": <0-1>,
    "fear": <0-1>,
    "surprise": <0-1>,
    "disgust": <0-1>
  },
  "topics": [<list of main topics>],
  "intent": <primary intent>,
  "urgency": <"low", "medium", or "high">,
  "requiresHumanReview": <boolean>
}`
      
      const response = await this.openAI.createChatCompletion(
        [
          {
            role: 'system',
            content: 'You are a sentiment analysis expert for hospitality customer service. Analyze messages and provide detailed emotional insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        {
          model: 'gpt-3.5-turbo',
          temperature: 0.3,
          maxTokens: 300
        }
      )
      
      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0])
        return this.validateAnalysis(analysis)
      }
      
      throw new Error('Failed to parse sentiment analysis')
    } catch (error) {
      console.error('OpenAI sentiment analysis failed:', error)
      return this.basicSentimentAnalysis(message)
    }
  }
  
  private validateAnalysis(analysis: any): SentimentAnalysis {
    return {
      score: Math.max(-1, Math.min(1, analysis.score || 0)),
      label: analysis.label || 'neutral',
      confidence: Math.max(0, Math.min(1, analysis.confidence || 0.5)),
      emotions: {
        joy: analysis.emotions?.joy || 0,
        anger: analysis.emotions?.anger || 0,
        sadness: analysis.emotions?.sadness || 0,
        fear: analysis.emotions?.fear || 0,
        surprise: analysis.emotions?.surprise || 0,
        disgust: analysis.emotions?.disgust || 0
      },
      topics: analysis.topics || [],
      intent: analysis.intent || 'inquiry',
      urgency: analysis.urgency || 'medium',
      requiresHumanReview: analysis.requiresHumanReview || false
    }
  }
  
  private basicSentimentAnalysis(message: string): SentimentAnalysis {
    const lowerMessage = message.toLowerCase()
    
    // Keywords for sentiment detection
    const positiveWords = [
      'great', 'excellent', 'wonderful', 'amazing', 'fantastic', 'love',
      'perfect', 'beautiful', 'thank', 'appreciate', 'happy', 'satisfied',
      'awesome', 'best', 'recommend', 'enjoy', 'nice', 'good'
    ]
    
    const negativeWords = [
      'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'angry',
      'disappointed', 'frustrat', 'unhappy', 'problem', 'issue', 'complaint',
      'unacceptable', 'poor', 'fail', 'wrong', 'upset', 'annoyed'
    ]
    
    const urgentWords = [
      'urgent', 'emergency', 'immediate', 'asap', 'now', 'help',
      'critical', 'important', 'quickly', 'hurry'
    ]
    
    // Count sentiment indicators
    let positiveCount = 0
    let negativeCount = 0
    let urgentCount = 0
    
    positiveWords.forEach(word => {
      if (lowerMessage.includes(word)) positiveCount++
    })
    
    negativeWords.forEach(word => {
      if (lowerMessage.includes(word)) negativeCount++
    })
    
    urgentWords.forEach(word => {
      if (lowerMessage.includes(word)) urgentCount++
    })
    
    // Calculate sentiment score
    const totalWords = positiveCount + negativeCount || 1
    const score = (positiveCount - negativeCount) / totalWords
    
    // Determine label
    let label: 'positive' | 'neutral' | 'negative' = 'neutral'
    if (score > 0.3) label = 'positive'
    else if (score < -0.3) label = 'negative'
    
    // Determine urgency
    let urgency: 'low' | 'medium' | 'high' = 'medium'
    if (urgentCount > 1 || lowerMessage.includes('urgent')) urgency = 'high'
    else if (positiveCount > negativeCount) urgency = 'low'
    
    // Check if human review needed
    const requiresHumanReview = 
      negativeCount > 2 || 
      urgentCount > 0 || 
      lowerMessage.includes('manager') ||
      lowerMessage.includes('supervisor') ||
      lowerMessage.includes('complaint')
    
    // Extract topics (simple keyword extraction)
    const topics = []
    if (lowerMessage.includes('room')) topics.push('room')
    if (lowerMessage.includes('service')) topics.push('service')
    if (lowerMessage.includes('food')) topics.push('food')
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) topics.push('pricing')
    if (lowerMessage.includes('book') || lowerMessage.includes('reserv')) topics.push('booking')
    if (lowerMessage.includes('check')) topics.push('check-in/out')
    
    // Determine intent
    let intent = 'inquiry'
    if (negativeCount > 0) intent = 'complaint'
    else if (lowerMessage.includes('book') || lowerMessage.includes('reserv')) intent = 'booking'
    else if (lowerMessage.includes('?')) intent = 'question'
    else if (positiveCount > 1) intent = 'feedback'
    
    return {
      score,
      label,
      confidence: 0.7, // Basic analysis has moderate confidence
      emotions: {
        joy: positiveCount > 0 ? 0.5 : 0,
        anger: negativeCount > 1 ? 0.5 : 0,
        sadness: negativeCount > 0 ? 0.3 : 0,
        fear: 0,
        surprise: 0,
        disgust: negativeCount > 2 ? 0.3 : 0
      },
      topics,
      intent,
      urgency,
      requiresHumanReview
    }
  }
  
  // Analyze conversation history for trends
  async analyzeConversationTrend(messages: string[]): Promise<{
    overallSentiment: SentimentAnalysis
    trend: 'improving' | 'declining' | 'stable'
    summary: string
  }> {
    const analyses = await Promise.all(
      messages.map(msg => this.analyzeMessage(msg))
    )
    
    // Calculate average sentiment
    const avgScore = analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length
    const avgConfidence = analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length
    
    // Determine trend
    let trend: 'improving' | 'declining' | 'stable' = 'stable'
    if (analyses.length > 1) {
      const firstHalf = analyses.slice(0, Math.floor(analyses.length / 2))
      const secondHalf = analyses.slice(Math.floor(analyses.length / 2))
      
      const firstAvg = firstHalf.reduce((sum, a) => sum + a.score, 0) / firstHalf.length
      const secondAvg = secondHalf.reduce((sum, a) => sum + a.score, 0) / secondHalf.length
      
      if (secondAvg - firstAvg > 0.2) trend = 'improving'
      else if (firstAvg - secondAvg > 0.2) trend = 'declining'
    }
    
    // Aggregate emotions
    const emotions = {
      joy: 0,
      anger: 0,
      sadness: 0,
      fear: 0,
      surprise: 0,
      disgust: 0
    }
    
    analyses.forEach(a => {
      Object.keys(emotions).forEach(emotion => {
        emotions[emotion as keyof typeof emotions] += a.emotions[emotion as keyof typeof a.emotions]
      })
    })
    
    Object.keys(emotions).forEach(emotion => {
      emotions[emotion as keyof typeof emotions] /= analyses.length
    })
    
    // Collect all topics
    const allTopics = new Set<string>()
    analyses.forEach(a => a.topics.forEach(t => allTopics.add(t)))
    
    const overallSentiment: SentimentAnalysis = {
      score: avgScore,
      label: avgScore > 0.3 ? 'positive' : avgScore < -0.3 ? 'negative' : 'neutral',
      confidence: avgConfidence,
      emotions,
      topics: Array.from(allTopics),
      intent: analyses[analyses.length - 1].intent, // Latest intent
      urgency: analyses.some(a => a.urgency === 'high') ? 'high' : 
               analyses.some(a => a.urgency === 'medium') ? 'medium' : 'low',
      requiresHumanReview: analyses.some(a => a.requiresHumanReview)
    }
    
    const summary = `Conversation sentiment is ${overallSentiment.label} (${(avgScore * 100).toFixed(0)}%) and ${trend}. ` +
                   `Topics discussed: ${Array.from(allTopics).join(', ')}. ` +
                   `${overallSentiment.requiresHumanReview ? 'Human review recommended.' : ''}`
    
    return {
      overallSentiment,
      trend,
      summary
    }
  }
  
  // Real-time sentiment monitoring
  monitorSentiment(
    onAlert: (alert: { type: string; message: string; sentiment: SentimentAnalysis }) => void
  ) {
    return {
      analyze: async (message: string) => {
        const sentiment = await this.analyzeMessage(message)
        
        // Check for alerts
        if (sentiment.score < -0.5) {
          onAlert({
            type: 'negative_sentiment',
            message: `High negative sentiment detected (${(sentiment.score * 100).toFixed(0)}%)`,
            sentiment
          })
        }
        
        if (sentiment.urgency === 'high') {
          onAlert({
            type: 'urgent_request',
            message: 'Urgent customer request detected',
            sentiment
          })
        }
        
        if (sentiment.requiresHumanReview) {
          onAlert({
            type: 'human_review_needed',
            message: 'Customer message requires human review',
            sentiment
          })
        }
        
        return sentiment
      }
    }
  }
}

export default SentimentAnalyzer