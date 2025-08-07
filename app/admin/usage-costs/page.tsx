'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  BarChart3,
  Calculator
} from 'lucide-react'
import { TIER_LIMITS } from '@/lib/tier-limits'

export default function UsageCostsPage() {
  const [costData, setCostData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCostData()
  }, [])

  const fetchCostData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/usage', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCostData(data)
      }
    } catch (error) {
      console.error('Failed to fetch cost data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  const tier = costData?.tier || 'professional'
  const limits = TIER_LIMITS[tier]
  const dailyUsage = costData?.conversationsUsed || 0
  const monthlyProjected = dailyUsage * 30

  // Cost calculations (rough estimates)
  const COST_PER_1K_TOKENS = {
    'claude-3-5-haiku-20241022': 0.001,  // $0.001 per 1K tokens
    'claude-3-5-sonnet-20241022': 0.003  // $0.003 per 1K tokens
  }

  const avgTokensPerConversation = limits.maxTokensPerRequest * 2 // Request + response
  const model = tier === 'starter' ? 'claude-3-5-haiku-20241022' : 'claude-3-5-sonnet-20241022'
  const costPerConversation = (avgTokensPerConversation / 1000) * COST_PER_1K_TOKENS[model]
  
  const dailyCost = dailyUsage * costPerConversation
  const monthlyCost = monthlyProjected * costPerConversation
  const revenue = tier === 'starter' ? 299 : tier === 'professional' ? 899 : tier === 'premium' ? 2499 : 5000
  const profit = revenue - monthlyCost
  const margin = (profit / revenue) * 100

  // Risk assessment
  const riskLevel = 
    monthlyCost > revenue ? 'critical' :
    monthlyCost > revenue * 0.5 ? 'high' :
    monthlyCost > revenue * 0.3 ? 'medium' : 'low'

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Usage & Cost Analysis</h1>
        <p className="text-gray-600">
          Monitor your API costs and profitability per customer
        </p>
      </div>

      {/* Risk Alert */}
      {riskLevel === 'critical' && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <XCircle className="h-6 w-6 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Critical: Losing Money!</h3>
              <p className="text-red-800">
                This customer's usage costs exceed their monthly payment. 
                Consider upgrading them or implementing stricter limits.
              </p>
            </div>
          </div>
        </div>
      )}

      {riskLevel === 'high' && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-900">Warning: Low Margin</h3>
              <p className="text-orange-800">
                API costs are over 50% of revenue. Monitor closely.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Daily Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Usage</CardTitle>
            <CardDescription>Conversations today vs limit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-3xl font-bold">
                {dailyUsage} / {limits.conversationsPerDay}
              </div>
              <Progress 
                value={(dailyUsage / limits.conversationsPerDay) * 100} 
                className="h-2"
              />
              <p className="text-sm text-gray-600">
                {limits.conversationsPerDay - dailyUsage} remaining today
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Cost</CardTitle>
            <CardDescription>Estimated Claude API cost</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-red-600">
                ${dailyCost.toFixed(2)}
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Per conversation:</span>
                  <span>${costPerConversation.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Model:</span>
                  <span className="text-xs">{model.split('-').slice(0, 3).join('-')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg tokens:</span>
                  <span>{avgTokensPerConversation}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Projection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Projection</CardTitle>
            <CardDescription>At current usage rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-orange-600">
                ${monthlyCost.toFixed(2)}
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="text-green-600">${revenue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profit:</span>
                  <span className={profit > 0 ? 'text-green-600' : 'text-red-600'}>
                    ${profit.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Margin:</span>
                  <span className={margin > 50 ? 'text-green-600' : margin > 20 ? 'text-orange-600' : 'text-red-600'}>
                    {margin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Limits */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Tier Limits & Protection</CardTitle>
          <CardDescription>
            Hard limits to prevent cost overruns for {tier} tier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Conversation Limits</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b">
                  <span>Daily cap:</span>
                  <span className="font-semibold">{limits.conversationsPerDay}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Monthly cap:</span>
                  <span className="font-semibold">
                    {limits.conversationsPerMonth || 'Unlimited (but daily cap applies)'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Max tokens/request:</span>
                  <span className="font-semibold">{limits.maxTokensPerRequest}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">API Limits</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b">
                  <span>Hourly cap:</span>
                  <span className="font-semibold">{limits.apiRequestsPerHour || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Daily cap:</span>
                  <span className="font-semibold">{limits.apiRequestsPerDay || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Knowledge base limit:</span>
                  <span className="font-semibold">{limits.knowledgeBaseItems || 'Unlimited'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-blue-900">Protection Active</p>
                <p className="text-blue-800">
                  These limits prevent any single customer from costing more than $
                  {(limits.conversationsPerDay * costPerConversation).toFixed(2)}/day
                  or ${(limits.conversationsPerDay * costPerConversation * 30).toFixed(2)}/month
                  in API costs.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Cost Optimization Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {margin < 30 && (
              <div className="flex items-start gap-2">
                <span className="text-orange-600">⚠️</span>
                <p className="text-sm">
                  Consider upgrading this customer to a higher tier or implementing caching to reduce API calls.
                </p>
              </div>
            )}
            <div className="flex items-start gap-2">
              <span className="text-blue-600">💡</span>
              <p className="text-sm">
                Implement response caching for common questions to reduce Claude API usage by up to 40%.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✅</span>
              <p className="text-sm">
                Your daily caps ensure maximum loss is limited to ${(limits.conversationsPerDay * costPerConversation).toFixed(2)}/day.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}