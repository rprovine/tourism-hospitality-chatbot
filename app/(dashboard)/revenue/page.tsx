'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { LoadingState } from '@/components/ui/loading-state'
import { 
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Percent,
  Target,
  Gift,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Calendar,
  Users,
  Package,
  Zap,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface RevenueMetrics {
  totalRevenue: number
  averageOrderValue: number
  conversionRate: number
  revenuePerVisitor: number
  monthlyRecurringRevenue: number
  customerLifetimeValue: number
  churnRate: number
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

interface RecoveryMetrics {
  totalAbandoned: number
  totalRecovered: number
  recoveryRate: number
  averageRecoveryTime: number
  revenueRecovered: number
  topRecoveryReasons: string[]
  channelPerformance: Record<string, number>
}

export default function RevenuePage() {
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics | null>(null)
  const [upsellMetrics, setUpsellMetrics] = useState<UpsellMetrics | null>(null)
  const [recoveryMetrics, setRecoveryMetrics] = useState<RecoveryMetrics | null>(null)
  const [pricingRecommendations, setPricingRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')
  
  useEffect(() => {
    fetchRevenueData()
  }, [period])
  
  const fetchRevenueData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Fetch revenue metrics
      const revenueRes = await fetch(`/api/revenue/pricing?action=metrics&period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (revenueRes.ok) {
        setRevenueMetrics(await revenueRes.json())
      }
      
      // Fetch upsell metrics
      const upsellRes = await fetch(`/api/revenue/upsell?type=metrics&period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (upsellRes.ok) {
        setUpsellMetrics(await upsellRes.json())
      }
      
      // Fetch recovery metrics
      const recoveryRes = await fetch(`/api/revenue/recovery?type=metrics&period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (recoveryRes.ok) {
        setRecoveryMetrics(await recoveryRes.json())
      }
      
      // Fetch pricing recommendations
      const recommendationsRes = await fetch('/api/revenue/pricing?action=recommendations', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (recommendationsRes.ok) {
        const data = await recommendationsRes.json()
        setPricingRecommendations(data.recommendations || [])
      }
    } catch (error) {
      console.error('Failed to fetch revenue data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const runAutomatedRecovery = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/revenue/recovery', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'automate' })
      })
      
      if (response.ok) {
        alert('Automated recovery process started successfully!')
        fetchRevenueData()
      }
    } catch (error) {
      console.error('Failed to run automated recovery:', error)
      alert('Failed to start automated recovery')
    }
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }
  
  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }
  
  if (loading) {
    return <LoadingState message="Loading revenue optimization data..." size="lg" />
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenue Optimization</h1>
          <p className="text-gray-800 font-semibold text-lg">Dynamic pricing, upselling, and abandonment recovery</p>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <Button onClick={runAutomatedRecovery} variant="outline">
            <Zap className="h-4 w-4 mr-2" />
            Run Recovery
          </Button>
        </div>
      </div>
      
      {/* Integration Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Integration Required for Real Revenue Data</h3>
              <p className="text-sm text-gray-700 mb-2">
                The revenue optimization system provides AI-powered recommendations and strategies. To track actual revenue and enable automated optimization:
              </p>
              <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                <li><strong>Booking System:</strong> Connect your PMS or booking engine to track real reservations, rates, and occupancy</li>
                <li><strong>Payment Processing:</strong> Integrate payment data to monitor actual revenue, refunds, and transaction values</li>
                <li><strong>Dynamic Pricing:</strong> Link with your rate management system to automatically adjust prices based on demand</li>
                <li><strong>Upsell Tracking:</strong> Connect ancillary services (spa, dining, activities) to measure upsell success</li>
                <li><strong>Cart Recovery:</strong> Integrate booking flow to detect and automatically recover abandoned bookings</li>
              </ul>
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 text-sm mb-2">Available: PMS Webhook for Revenue Tracking</h4>
                <p className="text-sm text-gray-700 mb-1">
                  Send booking and revenue data to: <code className="bg-white px-1 rounded border border-green-300 text-xs">POST /api/webhooks/pms</code>
                </p>
                <p className="text-xs text-gray-600">
                  Supported events: booking.created, booking.updated, booking.cancelled
                </p>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Currently showing sample data and AI recommendations. Contact support@lenilani.com for integration help.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="opacity-60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(revenueMetrics?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-gray-600">
              Sample data
            </p>
          </CardContent>
        </Card>
        
        <Card className="opacity-60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Avg Order Value</CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(revenueMetrics?.averageOrderValue || 0)}
            </div>
            <p className="text-xs text-gray-600">
              Requires PMS integration
            </p>
          </CardContent>
        </Card>
        
        <Card className="opacity-60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Conversion Rate</CardTitle>
            <Percent className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatPercent(revenueMetrics?.conversionRate || 0)}
            </div>
            <p className="text-xs text-gray-600">
              Requires booking data
            </p>
          </CardContent>
        </Card>
        
        <Card className="opacity-60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Customer LTV</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(revenueMetrics?.customerLifetimeValue || 0)}
            </div>
            <p className="text-xs text-gray-600">
              Requires payment data
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="pricing" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pricing">Dynamic Pricing</TabsTrigger>
          <TabsTrigger value="upselling">Upselling</TabsTrigger>
          <TabsTrigger value="recovery">Abandonment Recovery</TabsTrigger>
          <TabsTrigger value="insights">Revenue Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pricing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Pricing Recommendations</CardTitle>
                <CardDescription>AI-powered pricing optimization suggestions</CardDescription>
              </CardHeader>
              <CardContent>
                {pricingRecommendations.length > 0 ? (
                  <div className="space-y-3">
                    {pricingRecommendations.map((rec, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                          <Badge variant="outline">
                            +{(rec.impact * 100).toFixed(0)}% impact
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                        <p className="text-xs text-blue-600">
                          Implementation: {rec.implementation}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No recommendations available</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Price Factors</CardTitle>
                <CardDescription>Current pricing adjustments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-sm font-semibold text-gray-900">Peak Season</span>
                    <span className="text-gray-900 font-bold">+30%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-sm font-semibold text-gray-900">Weekend Premium</span>
                    <span className="text-gray-900 font-bold">+15%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <span className="text-sm font-semibold text-gray-900">Local Events</span>
                    <span className="text-gray-900 font-bold">+10%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <span className="text-sm font-semibold text-gray-900">Early Bird Discount</span>
                    <span className="text-gray-900 font-bold">-10%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="upselling" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-700">Upsell Conversion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatPercent(upsellMetrics?.conversionRate || 0)}
                </div>
                <p className="text-xs text-gray-600">
                  {upsellMetrics?.acceptedOffers || 0} of {upsellMetrics?.totalOffers || 0} accepted
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-700">Additional Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(upsellMetrics?.additionalRevenue || 0)}
                </div>
                <p className="text-xs text-gray-600">
                  Avg: {formatCurrency(upsellMetrics?.averageUpsellValue || 0)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-700">Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {upsellMetrics?.topPerformingOffers?.slice(0, 3).map((offer, i) => (
                    <div key={i} className="text-xs">
                      {i + 1}. {offer}
                    </div>
                  )) || <span className="text-xs text-gray-500">No data</span>}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Active Upsell Campaigns</CardTitle>
              <CardDescription>Current upselling strategies in action</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Room Upgrade Campaign</h4>
                    <p className="text-sm text-gray-600">Ocean view upgrades at 40% off</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                    <p className="text-xs text-gray-500 mt-1">23% conversion</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Spa Package Bundle</h4>
                    <p className="text-sm text-gray-600">Relaxation package with 20% savings</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                    <p className="text-xs text-gray-500 mt-1">18% conversion</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Extended Stay Offer</h4>
                    <p className="text-sm text-gray-600">25% off additional nights</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-yellow-100 text-yellow-700">Paused</Badge>
                    <p className="text-xs text-gray-500 mt-1">12% conversion</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recovery" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-700">Recovery Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatPercent(recoveryMetrics?.recoveryRate || 0)}
                </div>
                <p className="text-xs text-gray-600">
                  {recoveryMetrics?.totalRecovered || 0} of {recoveryMetrics?.totalAbandoned || 0}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-700">Revenue Recovered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(recoveryMetrics?.revenueRecovered || 0)}
                </div>
                <p className="text-xs text-gray-600">
                  Avg time: {recoveryMetrics?.averageRecoveryTime?.toFixed(1) || 0}h
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-700">Best Channel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">Email</div>
                <p className="text-xs text-gray-600">
                  {formatPercent(recoveryMetrics?.channelPerformance?.email || 0)} success
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Abandonment Patterns</CardTitle>
              <CardDescription>Common reasons for conversation abandonment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recoveryMetrics?.topRecoveryReasons?.map((reason, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">{reason}</span>
                    <Badge variant="outline">{20 - i * 5}%</Badge>
                  </div>
                )) || (
                  <p className="text-gray-500">No abandonment data available</p>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2 text-gray-900">Channel Performance</h4>
                <div className="space-y-2">
                  {Object.entries(recoveryMetrics?.channelPerformance || {}).map(([channel, rate]) => (
                    <div key={channel} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{channel}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${rate * 100}%` }}
                          />
                        </div>
                        <span className="text-xs">{formatPercent(rate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Optimization Insights</CardTitle>
              <CardDescription>AI-generated recommendations to maximize revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="border-l-4 border-l-blue-500">
                  <Target className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Opportunity: Weekend Pricing</p>
                    <p className="text-sm text-gray-700 mt-1">
                      Your weekend occupancy is 85%. Consider increasing weekend rates by 20% to maximize revenue without impacting demand.
                    </p>
                  </div>
                </Alert>
                
                <Alert className="border-l-4 border-l-purple-500">
                  <Gift className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Upsell Potential: Spa Packages</p>
                    <p className="text-sm text-gray-700 mt-1">
                      Guests who book deluxe rooms are 3x more likely to purchase spa packages. Target them with personalized offers.
                    </p>
                  </div>
                </Alert>
                
                <Alert className="border-l-4 border-l-amber-500">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Recovery Gap: Mobile Users</p>
                    <p className="text-sm text-gray-700 mt-1">
                      Mobile abandonment rate is 40% higher than desktop. Implement SMS recovery for better mobile engagement.
                    </p>
                  </div>
                </Alert>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">Revenue Growth</span>
                    <ArrowUpRight className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">+24.5%</div>
                  <p className="text-sm text-gray-700 font-medium">vs. last {period}</p>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">Optimization Score</span>
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">78/100</div>
                  <p className="text-sm text-gray-700 font-medium">Good performance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}