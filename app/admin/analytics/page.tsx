'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AdminNav from '@/components/admin/AdminNav'
import { 
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PlatformAnalytics {
  overview: {
    totalRevenue: number
    totalUsers: number
    activeUsers: number
    growthRate: number
    churnRate: number
    avgLifetimeValue: number
  }
  userMetrics: {
    newSignups: number
    trialConversions: number
    upgrades: number
    downgrades: number
    cancellations: number
  }
  revenueMetrics: {
    mrr: number
    arr: number
    avgRevenuePerUser: number
    revenueByTier: {
      starter: number
      professional: number
      premium: number
      enterprise: number
    }
  }
  usageMetrics: {
    totalConversations: number
    avgConversationsPerUser: number
    peakHours: string[]
    topFeatures: string[]
  }
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null)
  const [period, setPeriod] = useState('30d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token')
      const response = await fetch(`/api/admin/analytics?period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else {
        // Mock data for demo
        setAnalytics(getMockAnalytics())
      }
    } catch (error) {
      setAnalytics(getMockAnalytics())
    } finally {
      setLoading(false)
    }
  }

  const getMockAnalytics = (): PlatformAnalytics => ({
    overview: {
      totalRevenue: 45678,
      totalUsers: 127,
      activeUsers: 89,
      growthRate: 12.5,
      churnRate: 2.3,
      avgLifetimeValue: 2340
    },
    userMetrics: {
      newSignups: 23,
      trialConversions: 15,
      upgrades: 8,
      downgrades: 2,
      cancellations: 3
    },
    revenueMetrics: {
      mrr: 8947,
      arr: 107364,
      avgRevenuePerUser: 135.56,
      revenueByTier: {
        starter: 1305,
        professional: 3576,
        premium: 2697,
        enterprise: 1369
      }
    },
    usageMetrics: {
      totalConversations: 34567,
      avgConversationsPerUser: 272,
      peakHours: ['10am', '2pm', '8pm'],
      topFeatures: ['Bookings', 'FAQ', 'Concierge']
    }
  })

  const exportReport = () => {
    const data = JSON.stringify(analytics, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `platform-analytics-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">Loading analytics...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
            <p className="text-gray-600 mt-2">System-wide performance metrics and insights</p>
          </div>
          <div className="flex gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Button onClick={exportReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${analytics?.overview.totalRevenue.toLocaleString()}
              </div>
              <div className="flex items-center text-xs mt-2">
                <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-green-600">+{analytics?.overview.growthRate}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {analytics?.overview.activeUsers}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                of {analytics?.overview.totalUsers} total
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">MRR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${analytics?.revenueMetrics.mrr.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                ${analytics?.revenueMetrics.avgRevenuePerUser.toFixed(2)} per user
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Churn Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {analytics?.overview.churnRate}%
              </div>
              <div className="flex items-center text-xs mt-2">
                <ArrowDown className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-green-600">Improving</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Funnel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>User Funnel</CardTitle>
            <CardDescription>User journey from signup to conversion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">New Signups</span>
                <div className="flex items-center gap-4">
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }} />
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-12">{analytics?.userMetrics.newSignups}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Trial Conversions</span>
                <div className="flex items-center gap-4">
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '65%' }} />
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-12">{analytics?.userMetrics.trialConversions}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Upgrades</span>
                <div className="flex items-center gap-4">
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '35%' }} />
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-12">{analytics?.userMetrics.upgrades}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Cancellations</span>
                <div className="flex items-center gap-4">
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{ width: '13%' }} />
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-12">{analytics?.userMetrics.cancellations}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Tier */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Tier</CardTitle>
              <CardDescription>Monthly recurring revenue breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics?.revenueMetrics.revenueByTier || {}).map(([tier, revenue]) => (
                  <div key={tier} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize text-gray-700">{tier}</span>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            tier === 'enterprise' ? 'bg-yellow-600' :
                            tier === 'premium' ? 'bg-purple-600' :
                            tier === 'professional' ? 'bg-cyan-600' :
                            'bg-gray-600'
                          }`}
                          style={{ width: `${(revenue / (analytics?.revenueMetrics.mrr || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-900 w-20 text-right">
                        ${revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Usage</CardTitle>
              <CardDescription>System-wide activity metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Total Conversations</span>
                    <span className="font-bold text-gray-900">
                      {analytics?.usageMetrics.totalConversations.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Avg per User</span>
                    <span className="font-bold text-gray-900">
                      {analytics?.usageMetrics.avgConversationsPerUser}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 mb-2">Peak Hours</div>
                  <div className="flex gap-2">
                    {analytics?.usageMetrics.peakHours.map(hour => (
                      <span key={hour} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {hour}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 mb-2">Top Features</div>
                  <div className="flex gap-2 flex-wrap">
                    {analytics?.usageMetrics.topFeatures.map(feature => (
                      <span key={feature} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}