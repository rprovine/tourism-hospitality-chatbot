import { PrismaClient } from '@prisma/client'

interface TouchPoint {
  id: string
  timestamp: Date
  channel: string
  type: 'awareness' | 'consideration' | 'decision' | 'purchase' | 'retention'
  action: string
  sentiment?: number
  value?: number
  metadata?: any
}

interface CustomerJourney {
  customerId: string
  startDate: Date
  endDate?: Date
  status: 'active' | 'converted' | 'abandoned' | 'churned'
  touchPoints: TouchPoint[]
  totalValue: number
  conversionProbability: number
  nextBestAction: string
  riskFactors: string[]
  opportunities: string[]
}

interface JourneyStage {
  name: string
  duration: number // hours
  touchPointCount: number
  dropOffRate: number
  conversionRate: number
  averageValue: number
  commonActions: string[]
  bottlenecks: string[]
}

interface JourneyAnalytics {
  totalJourneys: number
  completedJourneys: number
  averageJourneyLength: number // days
  averageTouchPoints: number
  conversionRate: number
  averageCustomerValue: number
  stages: JourneyStage[]
  topPaths: Array<{
    path: string[]
    count: number
    conversionRate: number
  }>
  dropOffPoints: Array<{
    stage: string
    reason: string
    count: number
  }>
}

export class JourneyMapper {
  private prisma: PrismaClient
  
  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }
  
  // Map customer journey from interactions
  async mapCustomerJourney(
    customerId: string,
    businessId: string
  ): Promise<CustomerJourney> {
    try {
      // Get all customer interactions
      const guestProfile = await this.prisma.guestProfile.findFirst({
        where: {
          id: customerId,
          businessId
        },
        include: {
          conversations: {
            include: {
              messages: true
            }
          },
          interactions: true,
          sessions: true
        }
      })
      
      if (!guestProfile) {
        throw new Error('Customer not found')
      }
      
      // Convert interactions to touchpoints
      const touchPoints: TouchPoint[] = []
      
      // Add conversation touchpoints
      guestProfile.conversations.forEach(conv => {
        conv.messages.forEach(msg => {
          touchPoints.push({
            id: msg.id,
            timestamp: msg.createdAt,
            channel: 'chat',
            type: this.determineStageFromMessage(msg.content),
            action: this.extractAction(msg.content),
            sentiment: msg.metadata?.sentiment as number || 0,
            metadata: msg.metadata
          })
        })
      })
      
      // Add other interactions
      guestProfile.interactions.forEach(interaction => {
        touchPoints.push({
          id: interaction.id,
          timestamp: interaction.createdAt,
          channel: interaction.channel,
          type: this.determineStageFromInteraction(interaction.interactionType),
          action: interaction.interactionType,
          sentiment: interaction.sentiment ? Number(interaction.sentiment) : undefined,
          metadata: interaction.metadata
        })
      })
      
      // Sort by timestamp
      touchPoints.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      
      // Calculate journey metrics
      const startDate = touchPoints[0]?.timestamp || new Date()
      const endDate = touchPoints[touchPoints.length - 1]?.timestamp
      const hasBooking = touchPoints.some(tp => tp.action === 'booking')
      const totalValue = guestProfile.totalSpent ? Number(guestProfile.totalSpent) : 0
      
      // Determine status
      let status: CustomerJourney['status'] = 'active'
      if (hasBooking) status = 'converted'
      else if (guestProfile.sessions.some(s => s.abandonedAt)) status = 'abandoned'
      else if (guestProfile.churnedAt) status = 'churned'
      
      // Calculate conversion probability
      const conversionProbability = this.calculateConversionProbability(touchPoints, status)
      
      // Determine next best action
      const nextBestAction = this.determineNextBestAction(touchPoints, status)
      
      // Identify risk factors and opportunities
      const riskFactors = this.identifyRiskFactors(touchPoints)
      const opportunities = this.identifyOpportunities(touchPoints, guestProfile)
      
      return {
        customerId,
        startDate,
        endDate,
        status,
        touchPoints,
        totalValue,
        conversionProbability,
        nextBestAction,
        riskFactors,
        opportunities
      }
    } catch (error) {
      console.error('Journey mapping error:', error)
      return {
        customerId,
        startDate: new Date(),
        status: 'active',
        touchPoints: [],
        totalValue: 0,
        conversionProbability: 0,
        nextBestAction: 'Engage with personalized offer',
        riskFactors: [],
        opportunities: []
      }
    }
  }
  
  // Analyze journey patterns
  async analyzeJourneyPatterns(
    businessId: string,
    period: 'day' | 'week' | 'month' = 'month'
  ): Promise<JourneyAnalytics> {
    try {
      const periodDays = period === 'day' ? 1 : period === 'week' ? 7 : 30
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - periodDays)
      
      // Get all guest profiles with interactions
      const guestProfiles = await this.prisma.guestProfile.findMany({
        where: {
          businessId,
          createdAt: { gte: startDate }
        },
        include: {
          conversations: true,
          interactions: true,
          sessions: true
        }
      })
      
      // Map all journeys
      const journeys = await Promise.all(
        guestProfiles.map(profile => this.mapCustomerJourney(profile.id, businessId))
      )
      
      // Calculate analytics
      const completedJourneys = journeys.filter(j => j.status === 'converted').length
      const totalValue = journeys.reduce((sum, j) => sum + j.totalValue, 0)
      
      // Calculate average journey length
      const journeyLengths = journeys
        .filter(j => j.endDate)
        .map(j => (j.endDate!.getTime() - j.startDate.getTime()) / (1000 * 60 * 60 * 24))
      const averageJourneyLength = journeyLengths.length > 0
        ? journeyLengths.reduce((a, b) => a + b, 0) / journeyLengths.length
        : 0
      
      // Calculate average touchpoints
      const averageTouchPoints = journeys.length > 0
        ? journeys.reduce((sum, j) => sum + j.touchPoints.length, 0) / journeys.length
        : 0
      
      // Analyze stages
      const stages = this.analyzeStages(journeys)
      
      // Find top paths
      const topPaths = this.findTopPaths(journeys)
      
      // Identify drop-off points
      const dropOffPoints = this.identifyDropOffPoints(journeys)
      
      return {
        totalJourneys: journeys.length,
        completedJourneys,
        averageJourneyLength,
        averageTouchPoints,
        conversionRate: journeys.length > 0 ? completedJourneys / journeys.length : 0,
        averageCustomerValue: completedJourneys > 0 ? totalValue / completedJourneys : 0,
        stages,
        topPaths,
        dropOffPoints
      }
    } catch (error) {
      console.error('Journey analysis error:', error)
      return {
        totalJourneys: 0,
        completedJourneys: 0,
        averageJourneyLength: 0,
        averageTouchPoints: 0,
        conversionRate: 0,
        averageCustomerValue: 0,
        stages: [],
        topPaths: [],
        dropOffPoints: []
      }
    }
  }
  
  // Helper: Determine stage from message content
  private determineStageFromMessage(content: string): TouchPoint['type'] {
    const lowerContent = content.toLowerCase()
    
    if (lowerContent.includes('book') || lowerContent.includes('reserve')) {
      return 'decision'
    } else if (lowerContent.includes('price') || lowerContent.includes('availability')) {
      return 'consideration'
    } else if (lowerContent.includes('what') || lowerContent.includes('where')) {
      return 'awareness'
    } else if (lowerContent.includes('confirm') || lowerContent.includes('payment')) {
      return 'purchase'
    } else if (lowerContent.includes('stay') || lowerContent.includes('experience')) {
      return 'retention'
    }
    
    return 'consideration'
  }
  
  // Helper: Determine stage from interaction type
  private determineStageFromInteraction(type: string): TouchPoint['type'] {
    switch (type) {
      case 'booking': return 'purchase'
      case 'review': return 'retention'
      case 'complaint': return 'retention'
      case 'inquiry': return 'consideration'
      default: return 'awareness'
    }
  }
  
  // Helper: Extract action from message
  private extractAction(content: string): string {
    const lowerContent = content.toLowerCase()
    
    if (lowerContent.includes('book')) return 'booking_intent'
    if (lowerContent.includes('price')) return 'price_inquiry'
    if (lowerContent.includes('cancel')) return 'cancellation'
    if (lowerContent.includes('amenities')) return 'amenities_inquiry'
    if (lowerContent.includes('room')) return 'room_inquiry'
    
    return 'general_inquiry'
  }
  
  // Helper: Calculate conversion probability
  private calculateConversionProbability(
    touchPoints: TouchPoint[],
    status: CustomerJourney['status']
  ): number {
    if (status === 'converted') return 1
    if (status === 'churned') return 0
    
    let probability = 0.1
    
    // Increase based on journey progression
    const stages = new Set(touchPoints.map(tp => tp.type))
    if (stages.has('consideration')) probability += 0.2
    if (stages.has('decision')) probability += 0.4
    
    // Increase based on engagement
    if (touchPoints.length > 5) probability += 0.1
    if (touchPoints.length > 10) probability += 0.1
    
    // Adjust based on sentiment
    const avgSentiment = touchPoints
      .filter(tp => tp.sentiment !== undefined)
      .reduce((sum, tp) => sum + tp.sentiment!, 0) / touchPoints.length
    
    if (avgSentiment > 0) probability += 0.1
    
    return Math.min(probability, 0.95)
  }
  
  // Helper: Determine next best action
  private determineNextBestAction(
    touchPoints: TouchPoint[],
    status: CustomerJourney['status']
  ): string {
    if (status === 'converted') return 'Send post-purchase follow-up'
    if (status === 'abandoned') return 'Send recovery offer'
    
    const lastTouchPoint = touchPoints[touchPoints.length - 1]
    if (!lastTouchPoint) return 'Send welcome message'
    
    switch (lastTouchPoint.type) {
      case 'awareness':
        return 'Provide property highlights and virtual tour'
      case 'consideration':
        return 'Share special offers and availability'
      case 'decision':
        return 'Offer booking assistance and incentives'
      case 'purchase':
        return 'Send confirmation and pre-arrival information'
      case 'retention':
        return 'Request feedback and offer loyalty rewards'
      default:
        return 'Engage with personalized content'
    }
  }
  
  // Helper: Identify risk factors
  private identifyRiskFactors(touchPoints: TouchPoint[]): string[] {
    const risks: string[] = []
    
    // Long gaps between touchpoints
    for (let i = 1; i < touchPoints.length; i++) {
      const gap = touchPoints[i].timestamp.getTime() - touchPoints[i-1].timestamp.getTime()
      if (gap > 7 * 24 * 60 * 60 * 1000) { // 7 days
        risks.push('Long engagement gaps')
        break
      }
    }
    
    // Negative sentiment
    const negativeSentiments = touchPoints.filter(tp => tp.sentiment && tp.sentiment < -0.3)
    if (negativeSentiments.length > 0) {
      risks.push('Negative sentiment detected')
    }
    
    // Price sensitivity
    if (touchPoints.filter(tp => tp.action === 'price_inquiry').length > 3) {
      risks.push('High price sensitivity')
    }
    
    // No progression
    const uniqueStages = new Set(touchPoints.map(tp => tp.type))
    if (uniqueStages.size === 1 && touchPoints.length > 5) {
      risks.push('No journey progression')
    }
    
    return risks
  }
  
  // Helper: Identify opportunities
  private identifyOpportunities(
    touchPoints: TouchPoint[],
    profile: any
  ): string[] {
    const opportunities: string[] = []
    
    // Upsell potential
    if (profile.totalSpent > 500) {
      opportunities.push('High-value customer - premium upsell potential')
    }
    
    // Loyalty potential
    if (profile.visitCount > 1) {
      opportunities.push('Repeat customer - loyalty program candidate')
    }
    
    // Referral potential
    const positiveSentiments = touchPoints.filter(tp => tp.sentiment && tp.sentiment > 0.5)
    if (positiveSentiments.length > touchPoints.length * 0.7) {
      opportunities.push('Satisfied customer - referral potential')
    }
    
    // Cross-sell potential
    if (!touchPoints.some(tp => tp.action === 'spa' || tp.action === 'dining')) {
      opportunities.push('Cross-sell spa and dining experiences')
    }
    
    return opportunities
  }
  
  // Helper: Analyze stages
  private analyzeStages(journeys: CustomerJourney[]): JourneyStage[] {
    const stageNames: TouchPoint['type'][] = ['awareness', 'consideration', 'decision', 'purchase', 'retention']
    
    return stageNames.map(stageName => {
      const stageTouchPoints = journeys.flatMap(j => 
        j.touchPoints.filter(tp => tp.type === stageName)
      )
      
      const journeysWithStage = journeys.filter(j => 
        j.touchPoints.some(tp => tp.type === stageName)
      )
      
      const convertedWithStage = journeysWithStage.filter(j => j.status === 'converted')
      
      return {
        name: stageName,
        duration: 24, // Default 24 hours
        touchPointCount: stageTouchPoints.length,
        dropOffRate: journeysWithStage.length > 0
          ? 1 - (convertedWithStage.length / journeysWithStage.length)
          : 0,
        conversionRate: journeysWithStage.length > 0
          ? convertedWithStage.length / journeysWithStage.length
          : 0,
        averageValue: convertedWithStage.length > 0
          ? convertedWithStage.reduce((sum, j) => sum + j.totalValue, 0) / convertedWithStage.length
          : 0,
        commonActions: this.getCommonActions(stageTouchPoints),
        bottlenecks: this.identifyBottlenecks(stageName, journeysWithStage)
      }
    })
  }
  
  // Helper: Get common actions
  private getCommonActions(touchPoints: TouchPoint[]): string[] {
    const actionCounts = new Map<string, number>()
    
    touchPoints.forEach(tp => {
      const count = actionCounts.get(tp.action) || 0
      actionCounts.set(tp.action, count + 1)
    })
    
    return Array.from(actionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([action]) => action)
  }
  
  // Helper: Identify bottlenecks
  private identifyBottlenecks(
    stage: string,
    journeys: CustomerJourney[]
  ): string[] {
    const bottlenecks: string[] = []
    
    const abandonedAtStage = journeys.filter(j => {
      const stageIndex = j.touchPoints.findIndex(tp => tp.type === stage)
      return stageIndex >= 0 && 
             stageIndex === j.touchPoints.length - 1 && 
             j.status === 'abandoned'
    })
    
    if (abandonedAtStage.length > journeys.length * 0.2) {
      bottlenecks.push(`High abandonment rate (${(abandonedAtStage.length / journeys.length * 100).toFixed(0)}%)`)
    }
    
    return bottlenecks
  }
  
  // Helper: Find top paths
  private findTopPaths(journeys: CustomerJourney[]): Array<{
    path: string[]
    count: number
    conversionRate: number
  }> {
    const pathCounts = new Map<string, { count: number, converted: number }>()
    
    journeys.forEach(journey => {
      const path = journey.touchPoints
        .map(tp => tp.type)
        .filter((type, index, array) => index === 0 || array[index - 1] !== type) // Remove duplicates
        .join(' → ')
      
      const existing = pathCounts.get(path) || { count: 0, converted: 0 }
      existing.count++
      if (journey.status === 'converted') existing.converted++
      pathCounts.set(path, existing)
    })
    
    return Array.from(pathCounts.entries())
      .map(([path, data]) => ({
        path: path.split(' → '),
        count: data.count,
        conversionRate: data.count > 0 ? data.converted / data.count : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }
  
  // Helper: Identify drop-off points
  private identifyDropOffPoints(journeys: CustomerJourney[]): Array<{
    stage: string
    reason: string
    count: number
  }> {
    const dropOffs: Map<string, number> = new Map()
    
    journeys
      .filter(j => j.status === 'abandoned')
      .forEach(journey => {
        const lastStage = journey.touchPoints[journey.touchPoints.length - 1]?.type || 'unknown'
        const key = `${lastStage}|${journey.riskFactors[0] || 'Unknown reason'}`
        dropOffs.set(key, (dropOffs.get(key) || 0) + 1)
      })
    
    return Array.from(dropOffs.entries())
      .map(([key, count]) => {
        const [stage, reason] = key.split('|')
        return { stage, reason, count }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }
}

export default JourneyMapper