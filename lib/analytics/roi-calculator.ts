interface ROIInputs {
  subscriptionCost: number
  averageBookingValue: number
  monthlyWebsiteVisitors: number
  currentConversionRate: number
  currentResponseTime: number // hours
  currentStaffCost: number // monthly
  currentSupportTickets: number // monthly
}

interface ROIResults {
  // Financial Metrics
  monthlyRevenueBefore: number
  monthlyRevenueAfter: number
  additionalRevenue: number
  costSavings: number
  totalBenefit: number
  netROI: number
  roiPercentage: number
  paybackPeriod: number // months
  
  // Operational Metrics
  conversationVolume: number
  automatedConversations: number
  staffHoursSaved: number
  responseTimeImprovement: number
  
  // Customer Metrics
  improvedConversionRate: number
  additionalBookings: number
  customerSatisfactionIncrease: number
  
  // Projections
  yearOneROI: number
  yearTwoROI: number
  yearThreeROI: number
  fiveYearValue: number
}

export class ROICalculator {
  // Industry benchmarks
  private readonly AI_CONVERSION_LIFT = 0.23 // 23% improvement
  private readonly RESPONSE_TIME_REDUCTION = 0.95 // 95% faster
  private readonly AUTOMATION_RATE = 0.85 // 85% of conversations
  private readonly UPSELL_RATE = 0.15 // 15% upsell success
  private readonly ABANDONMENT_RECOVERY = 0.25 // 25% recovery rate
  private readonly STAFF_EFFICIENCY_GAIN = 0.7 // 70% reduction in support time
  
  calculateROI(inputs: ROIInputs): ROIResults {
    // Current state calculations
    const currentMonthlyBookings = inputs.monthlyWebsiteVisitors * inputs.currentConversionRate
    const currentMonthlyRevenue = currentMonthlyBookings * inputs.averageBookingValue
    
    // With AI chatbot improvements
    const improvedConversionRate = inputs.currentConversionRate * (1 + this.AI_CONVERSION_LIFT)
    const newMonthlyBookings = inputs.monthlyWebsiteVisitors * improvedConversionRate
    const baseNewRevenue = newMonthlyBookings * inputs.averageBookingValue
    
    // Additional revenue streams
    const upsellRevenue = baseNewRevenue * this.UPSELL_RATE * 0.3 // 30% increase per upsell
    const recoveredRevenue = (newMonthlyBookings * 0.1) * this.ABANDONMENT_RECOVERY * inputs.averageBookingValue
    const totalNewRevenue = baseNewRevenue + upsellRevenue + recoveredRevenue
    
    // Cost savings
    const conversationVolume = inputs.monthlyWebsiteVisitors * 0.3 // 30% engage with chat
    const automatedConversations = conversationVolume * this.AUTOMATION_RATE
    const staffHoursSaved = (automatedConversations * 0.25) // 15 min per conversation
    const staffCostSavings = inputs.currentStaffCost * this.STAFF_EFFICIENCY_GAIN
    
    // Response time improvement
    const newResponseTime = inputs.currentResponseTime * (1 - this.RESPONSE_TIME_REDUCTION)
    const responseTimeImprovement = inputs.currentResponseTime - newResponseTime
    
    // Total benefits
    const additionalRevenue = totalNewRevenue - currentMonthlyRevenue
    const totalBenefit = additionalRevenue + staffCostSavings
    const netROI = totalBenefit - inputs.subscriptionCost
    const roiPercentage = (netROI / inputs.subscriptionCost) * 100
    const paybackPeriod = inputs.subscriptionCost / totalBenefit
    
    // Multi-year projections (with growth)
    const yearOneROI = netROI * 12
    const yearTwoROI = yearOneROI * 1.2 // 20% growth
    const yearThreeROI = yearTwoROI * 1.15 // 15% growth
    const fiveYearValue = yearOneROI + yearTwoROI + yearThreeROI + (yearThreeROI * 1.1) + (yearThreeROI * 1.1 * 1.1)
    
    return {
      // Financial Metrics
      monthlyRevenueBefore: currentMonthlyRevenue,
      monthlyRevenueAfter: totalNewRevenue,
      additionalRevenue,
      costSavings: staffCostSavings,
      totalBenefit,
      netROI,
      roiPercentage,
      paybackPeriod,
      
      // Operational Metrics
      conversationVolume,
      automatedConversations,
      staffHoursSaved,
      responseTimeImprovement,
      
      // Customer Metrics
      improvedConversionRate,
      additionalBookings: newMonthlyBookings - currentMonthlyBookings,
      customerSatisfactionIncrease: 0.25, // 25% improvement
      
      // Projections
      yearOneROI,
      yearTwoROI,
      yearThreeROI,
      fiveYearValue
    }
  }
  
  // Calculate ROI by tier
  calculateTierROI(tier: 'starter' | 'professional' | 'premium' | 'enterprise'): ROIResults {
    const tierInputs: Record<string, ROIInputs> = {
      starter: {
        subscriptionCost: 29,
        averageBookingValue: 200,
        monthlyWebsiteVisitors: 1000,
        currentConversionRate: 0.02,
        currentResponseTime: 24,
        currentStaffCost: 2000,
        currentSupportTickets: 50
      },
      professional: {
        subscriptionCost: 99,
        averageBookingValue: 350,
        monthlyWebsiteVisitors: 5000,
        currentConversionRate: 0.025,
        currentResponseTime: 12,
        currentStaffCost: 5000,
        currentSupportTickets: 200
      },
      premium: {
        subscriptionCost: 299,
        averageBookingValue: 500,
        monthlyWebsiteVisitors: 15000,
        currentConversionRate: 0.03,
        currentResponseTime: 6,
        currentStaffCost: 10000,
        currentSupportTickets: 500
      },
      enterprise: {
        subscriptionCost: 999,
        averageBookingValue: 750,
        monthlyWebsiteVisitors: 50000,
        currentConversionRate: 0.035,
        currentResponseTime: 2,
        currentStaffCost: 25000,
        currentSupportTickets: 2000
      }
    }
    
    return this.calculateROI(tierInputs[tier])
  }
  
  // Generate ROI report
  generateROIReport(results: ROIResults): string {
    return `
# ROI Analysis Report

## Executive Summary
- **Net Monthly ROI**: $${results.netROI.toLocaleString()}
- **ROI Percentage**: ${results.roiPercentage.toFixed(0)}%
- **Payback Period**: ${results.paybackPeriod.toFixed(1)} months
- **5-Year Value**: $${results.fiveYearValue.toLocaleString()}

## Financial Impact

### Revenue Growth
- Monthly Revenue Before: $${results.monthlyRevenueBefore.toLocaleString()}
- Monthly Revenue After: $${results.monthlyRevenueAfter.toLocaleString()}
- **Additional Revenue**: $${results.additionalRevenue.toLocaleString()}/month

### Cost Savings
- Staff Cost Savings: $${results.costSavings.toLocaleString()}/month
- Staff Hours Saved: ${results.staffHoursSaved.toFixed(0)} hours/month
- **Total Monthly Benefit**: $${results.totalBenefit.toLocaleString()}

## Operational Improvements

### Efficiency Gains
- Conversations Handled: ${results.conversationVolume.toLocaleString()}/month
- Automated Conversations: ${results.automatedConversations.toLocaleString()} (${(results.automatedConversations/results.conversationVolume*100).toFixed(0)}%)
- Response Time: ${results.responseTimeImprovement.toFixed(1)} hours faster

### Customer Experience
- Conversion Rate: ${(results.improvedConversionRate * 100).toFixed(2)}% (up from ${(results.improvedConversionRate / (1 + this.AI_CONVERSION_LIFT) * 100).toFixed(2)}%)
- Additional Bookings: ${results.additionalBookings.toFixed(0)}/month
- Customer Satisfaction: +${(results.customerSatisfactionIncrease * 100).toFixed(0)}%

## Long-Term Projections

### Annual ROI Growth
- Year 1: $${results.yearOneROI.toLocaleString()}
- Year 2: $${results.yearTwoROI.toLocaleString()}
- Year 3: $${results.yearThreeROI.toLocaleString()}

### Key Benefits
1. **24/7 Availability**: Never miss a booking opportunity
2. **Instant Response**: 95% faster than human agents
3. **Scalability**: Handle unlimited conversations simultaneously
4. **Data Insights**: Learn from every interaction
5. **Consistent Quality**: Perfect responses every time

## Recommendation
Based on this analysis, implementing the AI chatbot will deliver a ${results.roiPercentage.toFixed(0)}% ROI with a payback period of just ${results.paybackPeriod.toFixed(1)} months. The system will pay for itself through increased conversions and operational savings.
`
  }
  
  // Compare scenarios
  compareScenarios(scenarios: Array<{name: string, inputs: ROIInputs}>): {
    comparison: Array<{name: string, results: ROIResults}>
    bestScenario: string
    recommendations: string[]
  } {
    const comparison = scenarios.map(scenario => ({
      name: scenario.name,
      results: this.calculateROI(scenario.inputs)
    }))
    
    // Find best scenario
    const bestScenario = comparison.reduce((best, current) => 
      current.results.roiPercentage > best.results.roiPercentage ? current : best
    )
    
    // Generate recommendations
    const recommendations: string[] = []
    
    comparison.forEach(scenario => {
      if (scenario.results.paybackPeriod > 3) {
        recommendations.push(`${scenario.name}: Consider increasing prices or reducing costs`)
      }
      if (scenario.results.roiPercentage < 100) {
        recommendations.push(`${scenario.name}: ROI below 100% - evaluate pricing strategy`)
      }
      if (scenario.results.additionalBookings < 10) {
        recommendations.push(`${scenario.name}: Low booking impact - focus on conversion optimization`)
      }
    })
    
    return {
      comparison,
      bestScenario: bestScenario.name,
      recommendations
    }
  }
  
  // Industry benchmarks
  getIndustryBenchmarks(): {
    metrics: Record<string, { value: number, unit: string, description: string }>
  } {
    return {
      metrics: {
        conversionRate: {
          value: 2.35,
          unit: '%',
          description: 'Average website conversion rate for hospitality'
        },
        responseTime: {
          value: 12,
          unit: 'hours',
          description: 'Average customer service response time'
        },
        chatbotROI: {
          value: 400,
          unit: '%',
          description: 'Average ROI for AI chatbot implementation'
        },
        automationRate: {
          value: 75,
          unit: '%',
          description: 'Percentage of queries handled without human intervention'
        },
        customerSatisfaction: {
          value: 85,
          unit: '%',
          description: 'Customer satisfaction with AI assistance'
        },
        costReduction: {
          value: 60,
          unit: '%',
          description: 'Reduction in customer service costs'
        },
        conversionLift: {
          value: 23,
          unit: '%',
          description: 'Average increase in conversion rate with AI'
        },
        averageOrderValue: {
          value: 15,
          unit: '%',
          description: 'Increase in AOV through upselling'
        }
      }
    }
  }
}

export default ROICalculator