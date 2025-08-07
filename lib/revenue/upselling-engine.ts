import { PrismaClient } from '@prisma/client'
import { OpenAIService } from '../ai/openai-service'

interface UpsellOffer {
  id: string
  type: 'addon' | 'upgrade' | 'bundle' | 'extended_stay' | 'experience'
  title: string
  description: string
  originalPrice: number
  offerPrice: number
  discount: number
  image?: string
  validUntil: Date
  conditions?: string[]
  priority: number
  estimatedRevenue: number
}

interface CustomerContext {
  customerId?: string
  bookingDetails?: {
    checkIn: Date
    checkOut: Date
    roomType: string
    guestCount: number
    totalAmount: number
  }
  preferences?: string[]
  previousPurchases?: string[]
  segment?: 'budget' | 'standard' | 'premium' | 'luxury'
  intent?: string
  browsingHistory?: string[]
}

interface UpsellMetrics {
  totalOffers: number
  acceptedOffers: number
  rejectedOffers: number
  conversionRate: number
  additionalRevenue: number
  averageUpsellValue: number
  topPerformingOffers: string[]
}

export class UpsellingEngine {
  private prisma: PrismaClient
  private openAI: OpenAIService
  
  constructor(prisma: PrismaClient, openAI?: OpenAIService) {
    this.prisma = prisma
    this.openAI = openAI || new OpenAIService()
  }
  
  // Generate personalized upsell offers
  async generateUpsellOffers(
    context: CustomerContext,
    maxOffers: number = 3
  ): Promise<UpsellOffer[]> {
    const offers: UpsellOffer[] = []
    
    // Room upgrade offers
    if (context.bookingDetails?.roomType === 'standard') {
      offers.push({
        id: 'upgrade_deluxe',
        type: 'upgrade',
        title: 'Upgrade to Ocean View Deluxe Room',
        description: 'Enjoy breathtaking ocean views, larger space, and premium amenities',
        originalPrice: 150,
        offerPrice: 89,
        discount: 40,
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
        conditions: ['Valid for your current dates only'],
        priority: 9,
        estimatedRevenue: 89
      })
    }
    
    // Extended stay offer
    if (context.bookingDetails) {
      const nights = Math.floor(
        (context.bookingDetails.checkOut.getTime() - context.bookingDetails.checkIn.getTime()) / 
        (1000 * 60 * 60 * 24)
      )
      
      if (nights <= 3) {
        offers.push({
          id: 'extended_stay',
          type: 'extended_stay',
          title: 'Extend Your Paradise',
          description: 'Add 2 more nights and save 25% on the additional nights',
          originalPrice: 400,
          offerPrice: 300,
          discount: 25,
          validUntil: new Date(Date.now() + 48 * 60 * 60 * 1000),
          priority: 8,
          estimatedRevenue: 300
        })
      }
    }
    
    // Experience packages based on segment
    if (context.segment === 'premium' || context.segment === 'luxury') {
      offers.push({
        id: 'spa_package',
        type: 'experience',
        title: 'Rejuvenation Spa Package',
        description: 'Full day spa access with massage, facial, and wellness treatments',
        originalPrice: 350,
        offerPrice: 280,
        discount: 20,
        validUntil: new Date(Date.now() + 72 * 60 * 60 * 1000),
        priority: 7,
        estimatedRevenue: 280
      })
      
      offers.push({
        id: 'dining_experience',
        type: 'experience',
        title: 'Exclusive Chef\'s Table Experience',
        description: '7-course tasting menu with wine pairing at our signature restaurant',
        originalPrice: 250,
        offerPrice: 199,
        discount: 20,
        validUntil: new Date(Date.now() + 72 * 60 * 60 * 1000),
        priority: 6,
        estimatedRevenue: 199
      })
    }
    
    // Bundle offers
    offers.push({
      id: 'romance_bundle',
      type: 'bundle',
      title: 'Romance Package',
      description: 'Champagne, couples massage, sunset dinner, and late checkout',
      originalPrice: 450,
      offerPrice: 349,
      discount: 22,
      validUntil: new Date(Date.now() + 48 * 60 * 60 * 1000),
      conditions: ['Must be booked 24 hours in advance'],
      priority: 7,
      estimatedRevenue: 349
    })
    
    // Activity addons
    offers.push({
      id: 'adventure_pack',
      type: 'addon',
      title: 'Island Adventure Pack',
      description: 'Snorkeling tour, hiking guide, and equipment rental',
      originalPrice: 180,
      offerPrice: 149,
      discount: 17,
      validUntil: new Date(Date.now() + 72 * 60 * 60 * 1000),
      priority: 5,
      estimatedRevenue: 149
    })
    
    // Transportation addon
    offers.push({
      id: 'airport_transfer',
      type: 'addon',
      title: 'VIP Airport Transfer',
      description: 'Skip the taxi line with our luxury vehicle service',
      originalPrice: 120,
      offerPrice: 95,
      discount: 21,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priority: 4,
      estimatedRevenue: 95
    })
    
    // Filter and prioritize offers
    let relevantOffers = this.filterOffersByContext(offers, context)
    relevantOffers = this.rankOffers(relevantOffers, context)
    
    return relevantOffers.slice(0, maxOffers)
  }
  
  // Filter offers based on customer context
  private filterOffersByContext(offers: UpsellOffer[], context: CustomerContext): UpsellOffer[] {
    return offers.filter(offer => {
      // Filter by customer segment
      if (context.segment === 'budget' && offer.offerPrice > 150) {
        return false
      }
      
      // Filter by previous purchases
      if (context.previousPurchases?.includes(offer.id)) {
        return false
      }
      
      // Filter by preferences
      if (context.preferences?.includes('no_spa') && offer.id === 'spa_package') {
        return false
      }
      
      return true
    })
  }
  
  // Rank offers by relevance and revenue potential
  private rankOffers(offers: UpsellOffer[], context: CustomerContext): UpsellOffer[] {
    return offers.sort((a, b) => {
      // Prioritize by customer segment match
      if (context.segment === 'luxury') {
        if (a.type === 'experience' && b.type !== 'experience') return -1
        if (b.type === 'experience' && a.type !== 'experience') return 1
      }
      
      // Then by priority
      if (a.priority !== b.priority) {
        return b.priority - a.priority
      }
      
      // Then by estimated revenue
      return b.estimatedRevenue - a.estimatedRevenue
    })
  }
  
  // Generate AI-powered upsell message
  async generateUpsellMessage(
    offer: UpsellOffer,
    context: CustomerContext
  ): Promise<string> {
    if (!this.openAI.isConfigured()) {
      return this.generateDefaultMessage(offer)
    }
    
    try {
      const prompt = `Create a personalized, compelling upsell message for a hotel guest.

Offer: ${offer.title}
Description: ${offer.description}
Original Price: $${offer.originalPrice}
Special Price: $${offer.offerPrice}
Discount: ${offer.discount}%
Customer Segment: ${context.segment || 'standard'}

Create a short, friendly message (2-3 sentences) that:
1. Highlights the value and experience
2. Creates urgency
3. Emphasizes the special discount
4. Uses warm, hospitality-focused language

Message:`
      
      const message = await this.openAI.createChatCompletion(
        [
          {
            role: 'system',
            content: 'You are a luxury hotel concierge skilled at presenting valuable offers to guests.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        {
          temperature: 0.7,
          maxTokens: 150
        }
      )
      
      return message
    } catch (error) {
      console.error('Failed to generate AI message:', error)
      return this.generateDefaultMessage(offer)
    }
  }
  
  // Generate default upsell message
  private generateDefaultMessage(offer: UpsellOffer): string {
    const savings = offer.originalPrice - offer.offerPrice
    return `Enhance your stay with our ${offer.title}! ${offer.description}. ` +
           `Save $${savings} when you book now - special price of just $${offer.offerPrice} ` +
           `(${offer.discount}% off). This exclusive offer expires soon!`
  }
  
  // Track offer performance
  async trackOfferInteraction(
    offerId: string,
    customerId: string,
    action: 'viewed' | 'clicked' | 'accepted' | 'rejected',
    revenue?: number
  ): Promise<void> {
    // In production, store in database
    console.log('Tracking offer interaction:', {
      offerId,
      customerId,
      action,
      revenue,
      timestamp: new Date()
    })
  }
  
  // Get upselling metrics
  async getUpsellMetrics(businessId: string, period: 'day' | 'week' | 'month'): Promise<UpsellMetrics> {
    // Simulate metrics
    // In production, aggregate from database
    return {
      totalOffers: 450,
      acceptedOffers: 67,
      rejectedOffers: 383,
      conversionRate: 0.149,
      additionalRevenue: 18750,
      averageUpsellValue: 280,
      topPerformingOffers: [
        'Room Upgrade',
        'Spa Package',
        'Extended Stay'
      ]
    }
  }
  
  // Smart bundling recommendations
  async generateBundleRecommendations(
    items: string[],
    context: CustomerContext
  ): Promise<{
    bundles: Array<{
      items: string[]
      title: string
      totalPrice: number
      bundlePrice: number
      savings: number
    }>
  }> {
    const bundles = []
    
    // Check for common bundle patterns
    if (items.includes('room') && items.includes('dining')) {
      bundles.push({
        items: ['room', 'dining', 'spa'],
        title: 'Complete Relaxation Package',
        totalPrice: 650,
        bundlePrice: 549,
        savings: 101
      })
    }
    
    if (items.includes('room') && context.segment === 'luxury') {
      bundles.push({
        items: ['room', 'airport_transfer', 'butler_service', 'dining_credit'],
        title: 'VIP Experience Package',
        totalPrice: 850,
        bundlePrice: 699,
        savings: 151
      })
    }
    
    return { bundles }
  }
  
  // Cross-sell recommendations
  async getCrossSellRecommendations(
    purchasedItem: string,
    context: CustomerContext
  ): Promise<UpsellOffer[]> {
    const recommendations: UpsellOffer[] = []
    
    // Map of item relationships
    const crossSellMap: Record<string, string[]> = {
      'spa_package': ['dining_experience', 'yoga_class'],
      'adventure_pack': ['photography_tour', 'equipment_upgrade'],
      'romantic_dinner': ['couples_spa', 'champagne_package'],
      'family_room': ['kids_club', 'family_dining', 'beach_toys']
    }
    
    const relatedItems = crossSellMap[purchasedItem] || []
    
    for (const item of relatedItems) {
      recommendations.push({
        id: item,
        type: 'addon',
        title: this.getItemTitle(item),
        description: this.getItemDescription(item),
        originalPrice: 150,
        offerPrice: 120,
        discount: 20,
        validUntil: new Date(Date.now() + 48 * 60 * 60 * 1000),
        priority: 5,
        estimatedRevenue: 120
      })
    }
    
    return recommendations
  }
  
  private getItemTitle(itemId: string): string {
    const titles: Record<string, string> = {
      'dining_experience': 'Fine Dining Experience',
      'yoga_class': 'Sunrise Yoga Session',
      'photography_tour': 'Professional Photography Tour',
      'equipment_upgrade': 'Premium Equipment Package',
      'couples_spa': 'Couples Spa Treatment',
      'champagne_package': 'Celebration Champagne Package',
      'kids_club': 'Kids Adventure Club',
      'family_dining': 'Family Dining Plan',
      'beach_toys': 'Beach Fun Package'
    }
    return titles[itemId] || 'Special Offer'
  }
  
  private getItemDescription(itemId: string): string {
    const descriptions: Record<string, string> = {
      'dining_experience': 'Exclusive chef-prepared meal with wine pairing',
      'yoga_class': 'Peaceful morning yoga with ocean views',
      'photography_tour': 'Capture memories with a professional photographer',
      'equipment_upgrade': 'Access to premium sports and adventure gear',
      'couples_spa': 'Relaxing spa treatment for two',
      'champagne_package': 'Premium champagne and celebration setup',
      'kids_club': 'Supervised activities and entertainment for children',
      'family_dining': 'All-inclusive dining for the whole family',
      'beach_toys': 'Beach games, toys, and equipment for family fun'
    }
    return descriptions[itemId] || 'Enhance your experience'
  }
}

export default UpsellingEngine