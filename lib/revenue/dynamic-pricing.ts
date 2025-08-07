import { PrismaClient } from '@prisma/client'

interface PricingFactors {
  basePrice: number
  demandMultiplier: number
  seasonalMultiplier: number
  occupancyRate: number
  competitorPricing?: number
  eventPremium?: number
  lastMinuteDiscount?: number
  advanceBookingDiscount?: number
  loyaltyDiscount?: number
  groupDiscount?: number
}

interface DynamicPrice {
  originalPrice: number
  adjustedPrice: number
  factors: PricingFactors
  reasoning: string[]
  confidence: number
  expiresAt: Date
}

interface RevenueMetrics {
  totalRevenue: number
  averageOrderValue: number
  conversionRate: number
  revenuePerVisitor: number
  monthlyRecurringRevenue: number
  customerLifetimeValue: number
  churnRate: number
}

export class DynamicPricingEngine {
  private prisma: PrismaClient
  private readonly HIGH_DEMAND_THRESHOLD = 0.8
  private readonly LOW_DEMAND_THRESHOLD = 0.3
  
  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }
  
  // Calculate dynamic price based on multiple factors
  async calculateDynamicPrice(
    productId: string,
    productType: 'room' | 'package' | 'addon' | 'subscription',
    requestDate: Date,
    options: {
      checkInDate?: Date
      checkOutDate?: Date
      guestCount?: number
      isRepeatCustomer?: boolean
      customerSegment?: string
      promoCode?: string
    } = {}
  ): Promise<DynamicPrice> {
    const factors: PricingFactors = {
      basePrice: await this.getBasePrice(productId, productType),
      demandMultiplier: 1,
      seasonalMultiplier: 1,
      occupancyRate: 0,
      competitorPricing: undefined,
      eventPremium: undefined,
      lastMinuteDiscount: undefined,
      advanceBookingDiscount: undefined,
      loyaltyDiscount: undefined,
      groupDiscount: undefined
    }
    
    const reasoning: string[] = []
    
    // Calculate demand multiplier
    if (productType === 'room' && options.checkInDate) {
      const demand = await this.calculateDemand(options.checkInDate)
      if (demand > this.HIGH_DEMAND_THRESHOLD) {
        factors.demandMultiplier = 1.2 + (demand - this.HIGH_DEMAND_THRESHOLD) * 0.5
        reasoning.push(`High demand period (+${((factors.demandMultiplier - 1) * 100).toFixed(0)}%)`)
      } else if (demand < this.LOW_DEMAND_THRESHOLD) {
        factors.demandMultiplier = 0.85 + demand * 0.5
        reasoning.push(`Low demand period (-${((1 - factors.demandMultiplier) * 100).toFixed(0)}%)`)
      }
      factors.occupancyRate = demand
    }
    
    // Seasonal adjustments
    const season = this.getSeason(options.checkInDate || requestDate)
    if (season === 'peak') {
      factors.seasonalMultiplier = 1.3
      reasoning.push('Peak season (+30%)')
    } else if (season === 'shoulder') {
      factors.seasonalMultiplier = 1.1
      reasoning.push('Shoulder season (+10%)')
    } else if (season === 'off') {
      factors.seasonalMultiplier = 0.8
      reasoning.push('Off season (-20%)')
    }
    
    // Event-based pricing
    const events = await this.getLocalEvents(options.checkInDate || requestDate)
    if (events.length > 0) {
      factors.eventPremium = 0.15 * events.length
      reasoning.push(`Local events (+${(factors.eventPremium * 100).toFixed(0)}%)`)
    }
    
    // Last-minute booking
    if (options.checkInDate) {
      const daysUntilCheckIn = Math.floor(
        (options.checkInDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      
      if (daysUntilCheckIn <= 3 && factors.occupancyRate < 0.6) {
        factors.lastMinuteDiscount = 0.2
        reasoning.push('Last-minute discount (-20%)')
      } else if (daysUntilCheckIn >= 60) {
        factors.advanceBookingDiscount = 0.1
        reasoning.push('Advance booking discount (-10%)')
      }
    }
    
    // Loyalty discount
    if (options.isRepeatCustomer) {
      factors.loyaltyDiscount = 0.05
      reasoning.push('Loyalty discount (-5%)')
    }
    
    // Group discount
    if (options.guestCount && options.guestCount >= 5) {
      factors.groupDiscount = Math.min(0.15, options.guestCount * 0.02)
      reasoning.push(`Group discount (-${(factors.groupDiscount * 100).toFixed(0)}%)`)
    }
    
    // Calculate final price
    let adjustedPrice = factors.basePrice
    adjustedPrice *= factors.demandMultiplier
    adjustedPrice *= factors.seasonalMultiplier
    adjustedPrice *= (1 + (factors.eventPremium || 0))
    adjustedPrice *= (1 - (factors.lastMinuteDiscount || 0))
    adjustedPrice *= (1 - (factors.advanceBookingDiscount || 0))
    adjustedPrice *= (1 - (factors.loyaltyDiscount || 0))
    adjustedPrice *= (1 - (factors.groupDiscount || 0))
    
    // Round to nearest $5
    adjustedPrice = Math.round(adjustedPrice / 5) * 5
    
    // Calculate confidence based on data availability
    const confidence = this.calculateConfidence(factors)
    
    return {
      originalPrice: factors.basePrice,
      adjustedPrice,
      factors,
      reasoning,
      confidence,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    }
  }
  
  // Get base price for product
  private async getBasePrice(productId: string, productType: string): Promise<number> {
    // In production, fetch from database
    const basePrices: Record<string, number> = {
      'room_standard': 200,
      'room_deluxe': 350,
      'room_suite': 500,
      'package_romantic': 450,
      'package_family': 380,
      'addon_spa': 150,
      'addon_dining': 75,
      'subscription_starter': 29,
      'subscription_professional': 99,
      'subscription_premium': 299
    }
    
    return basePrices[`${productType}_${productId}`] || 100
  }
  
  // Calculate demand based on occupancy and bookings
  private async calculateDemand(date: Date): Promise<number> {
    // Simulate demand calculation
    // In production, query actual booking data
    const dayOfWeek = date.getDay()
    const month = date.getMonth()
    
    // Weekend premium
    let demand = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 0.5
    
    // Summer/winter peak
    if (month === 6 || month === 7 || month === 11 || month === 0) {
      demand += 0.2
    }
    
    // Add some randomness for simulation
    demand += (Math.random() - 0.5) * 0.2
    
    return Math.max(0, Math.min(1, demand))
  }
  
  // Determine season
  private getSeason(date: Date): 'peak' | 'shoulder' | 'off' {
    const month = date.getMonth()
    
    // Hawaii peak seasons
    if (month === 11 || month === 0 || month === 1) return 'peak' // Winter
    if (month === 6 || month === 7) return 'peak' // Summer
    if (month === 2 || month === 3 || month === 10) return 'shoulder'
    return 'off'
  }
  
  // Get local events
  private async getLocalEvents(date: Date): Promise<string[]> {
    // Simulate event data
    // In production, integrate with event APIs
    const events = []
    
    // Check for major holidays
    const month = date.getMonth()
    const day = date.getDate()
    
    if (month === 11 && day >= 20 && day <= 31) events.push('Christmas Season')
    if (month === 0 && day === 1) events.push('New Year')
    if (month === 6 && day === 4) events.push('Independence Day')
    if (month === 9 && day === 31) events.push('Halloween')
    
    // Random local events
    if (Math.random() > 0.7) events.push('Local Festival')
    if (Math.random() > 0.8) events.push('Concert')
    
    return events
  }
  
  // Calculate pricing confidence
  private calculateConfidence(factors: PricingFactors): number {
    let confidence = 0.5
    
    if (factors.occupancyRate > 0) confidence += 0.2
    if (factors.competitorPricing !== undefined) confidence += 0.15
    if (factors.eventPremium !== undefined) confidence += 0.1
    if (factors.seasonalMultiplier !== 1) confidence += 0.05
    
    return Math.min(1, confidence)
  }
  
  // Get competitor pricing
  async getCompetitorPricing(productType: string, date: Date): Promise<number[]> {
    // Simulate competitor data
    // In production, use web scraping or API integrations
    const baseCompetitorPrice = productType === 'room' ? 250 : 100
    return [
      baseCompetitorPrice * 0.9,
      baseCompetitorPrice,
      baseCompetitorPrice * 1.1,
      baseCompetitorPrice * 1.2
    ]
  }
  
  // Calculate revenue metrics
  async calculateRevenueMetrics(businessId: string, period: 'day' | 'week' | 'month' | 'year'): Promise<RevenueMetrics> {
    // Simulate revenue data
    // In production, aggregate from actual transactions
    const multiplier = 
      period === 'day' ? 1 :
      period === 'week' ? 7 :
      period === 'month' ? 30 :
      365
    
    return {
      totalRevenue: 5000 * multiplier,
      averageOrderValue: 350,
      conversionRate: 0.023,
      revenuePerVisitor: 8.05,
      monthlyRecurringRevenue: 15000,
      customerLifetimeValue: 2500,
      churnRate: 0.05
    }
  }
  
  // Price optimization recommendations
  async getPricingRecommendations(businessId: string): Promise<{
    recommendations: Array<{
      type: string
      title: string
      description: string
      impact: number
      implementation: string
    }>
  }> {
    const recommendations = []
    
    // Analyze current pricing performance
    const metrics = await this.calculateRevenueMetrics(businessId, 'month')
    
    if (metrics.conversionRate < 0.02) {
      recommendations.push({
        type: 'price_reduction',
        title: 'Consider Lower Entry Pricing',
        description: 'Your conversion rate is below industry average. Testing lower prices could increase volume.',
        impact: 0.15,
        implementation: 'Run A/B test with 10-15% price reduction'
      })
    }
    
    if (metrics.averageOrderValue < 300) {
      recommendations.push({
        type: 'upselling',
        title: 'Implement Upselling Strategy',
        description: 'AOV is low. Add premium packages and addons to increase transaction value.',
        impact: 0.25,
        implementation: 'Create bundle deals and highlight premium options'
      })
    }
    
    recommendations.push({
      type: 'dynamic_pricing',
      title: 'Enable Weekend Premium Pricing',
      description: 'Charge 15-20% more for Friday-Sunday bookings during high demand.',
      impact: 0.12,
      implementation: 'Activate dynamic pricing for weekends'
    })
    
    recommendations.push({
      type: 'early_bird',
      title: 'Introduce Early Bird Discounts',
      description: 'Offer 10% off for bookings made 30+ days in advance.',
      impact: 0.08,
      implementation: 'Add advance booking discount rule'
    })
    
    return { recommendations }
  }
}

export default DynamicPricingEngine