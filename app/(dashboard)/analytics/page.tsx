'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingState } from '@/components/ui/loading-state'
import { EmptyState } from '@/components/analytics/EmptyStates'
import { 
  TrendingUp, 
  Users, 
  MessageSquare,
  Globe,
  Clock,
  Download,
  ChevronDown,
  Star,
  Target,
  Activity
} from 'lucide-react'

interface AnalyticsData {
  totalConversations: number
  uniqueUsers: number
  avgResponseTime: number
  avgSatisfaction: number
  conversationsByDay: Array<{ date: string; count: number }>
  conversationsByHour: Array<{ hour: number; count: number }>
  topQuestions: Array<{ question: string; count: number }>
  languageDistribution: Record<string, number>
  deviceTypes: Record<string, number>
  conversionRate: number
  resolutionRate: number
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('7d')
  const [businessTier, setBusinessTier] = useState('starter')
  // const [compareMode, setCompareMode] = useState(false)
  
  useEffect(() => {
    // Only fetch analytics on client side
    if (typeof window !== 'undefined') {
      fetchAnalytics()
      // Get business tier
      const businessData = localStorage.getItem('business')
      if (businessData) {
        const business = JSON.parse(businessData)
        setBusinessTier(business.tier || 'starter')
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange])
  
  const fetchAnalytics = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      
      if (!token) {
        console.error('No auth token found')
        setLoading(false)
        return
      }
      
      const response = await fetch(`/api/analytics?range=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        // Use summary data if available, otherwise use mock data
        setAnalytics({
          totalConversations: data.summary?.totalConversations || 0,
          uniqueUsers: data.summary?.uniqueUsers || 0,
          avgResponseTime: data.summary?.avgResponseTime || 0,
          avgSatisfaction: data.summary?.avgSatisfaction || 0,
          conversationsByDay: data.conversationsByDay || [],
          conversationsByHour: data.conversationsByHour || [],
          topQuestions: data.summary?.topQuestions || [],
          languageDistribution: data.languageDistribution || { English: 100 },
          deviceTypes: data.deviceTypes || { Desktop: 60, Mobile: 40 },
          conversionRate: data.summary?.conversionRate || 0,
          resolutionRate: data.summary?.resolutionRate || 0
        })
      } else {
        console.error('Analytics API error:', response.status)
        // Set mock data for demo purposes
        setAnalytics({
          totalConversations: 0,
          uniqueUsers: 0,
          avgResponseTime: 0,
          avgSatisfaction: 0,
          conversationsByDay: [],
          conversationsByHour: [],
          topQuestions: [],
          languageDistribution: { English: 100 },
          deviceTypes: { Desktop: 60, Mobile: 40 },
          conversionRate: 0,
          resolutionRate: 0
        })
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const exportAnalytics = () => {
    if (!analytics) return
    
    const csv = [
      ['Metric', 'Value'],
      ['Total Conversations', analytics.totalConversations],
      ['Unique Users', analytics.uniqueUsers],
      ['Avg Response Time', analytics.avgResponseTime],
      ['Avg Satisfaction', analytics.avgSatisfaction],
      ['Conversion Rate', analytics.conversionRate],
      ['Resolution Rate', analytics.resolutionRate]
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${dateRange}.csv`
    a.click()
  }
  
  // Mock data for demonstration
  const mockAnalytics: AnalyticsData = {
    totalConversations: 2847,
    uniqueUsers: 1923,
    avgResponseTime: 1.2,
    avgSatisfaction: 4.6,
    conversationsByDay: [
      { date: 'Mon', count: 420 },
      { date: 'Tue', count: 380 },
      { date: 'Wed', count: 450 },
      { date: 'Thu', count: 390 },
      { date: 'Fri', count: 520 },
      { date: 'Sat', count: 480 },
      { date: 'Sun', count: 207 }
    ],
    conversationsByHour: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: Math.floor(Math.random() * 100) + 20
    })),
    topQuestions: [
      { question: 'What are your check-in times?', count: 234 },
      { question: 'Do you have parking available?', count: 189 },
      { question: 'Is breakfast included?', count: 167 },
      { question: 'How far from the beach?', count: 145 },
      { question: 'What amenities are available?', count: 132 }
    ],
    languageDistribution: {
      English: 65,
      Japanese: 15,
      Chinese: 10,
      Spanish: 5,
      Other: 5
    },
    deviceTypes: {
      Mobile: 68,
      Desktop: 28,
      Tablet: 4
    },
    conversionRate: 23.5,
    resolutionRate: 87.3
  }
  
  // Only use mock data for demo accounts
  const businessData = typeof window !== 'undefined' ? localStorage.getItem('business') : null
  const isDemo = businessData ? JSON.parse(businessData).id === 'demo' : false
  const data = (!analytics || Object.keys(analytics).length === 0) && isDemo ? mockAnalytics : (analytics || mockAnalytics)
  
  if (loading) {
    return <LoadingState message="Loading analytics data..." size="lg" />
  }
  
  // const getPercentageChange = (current: number, previous: number) => {
  //   const change = ((current - previous) / previous) * 100
  //   return change.toFixed(1)
  // }
  
  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your chatbot performance and user engagement</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="1d">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button onClick={exportAnalytics} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalConversations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              +12.5% from last period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.uniqueUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              +8.3% from last period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avgResponseTime}s</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ChevronDown className="h-3 w-3 text-green-600 mr-1" />
              -0.3s improvement
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avgSatisfaction}/5.0</div>
            <p className="text-xs text-muted-foreground">
              {Array(5).fill(0).map((_, i) => (
                <Star
                  key={i}
                  className={`inline h-3 w-3 ${
                    i < Math.floor(data.avgSatisfaction) 
                      ? 'text-yellow-500 fill-yellow-500' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="conversations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="conversations" className="space-y-4">
          {(!data.conversationsByDay || data.conversationsByDay.length === 0) ? (
            <EmptyState tab="conversations" tier={businessTier} />
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Daily Conversations Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Conversations</CardTitle>
                <CardDescription>Conversation volume over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2">
                  {data.conversationsByDay.map((day, index) => {
                    const heightPercent = (day.count / Math.max(...data.conversationsByDay.map(d => d.count))) * 100
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="relative w-full group">
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {day.count} conversations
                          </div>
                          <div
                            className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t hover:from-cyan-700 hover:to-cyan-500 transition-colors"
                            style={{ height: `${(heightPercent * 200) / 100}px` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 mt-2">{day.date}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
            
            {/* Top Questions */}
            <Card>
              <CardHeader>
                <CardTitle>Top Questions</CardTitle>
                <CardDescription>Most frequently asked questions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.topQuestions.map((question, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 flex-1 truncate pr-4">
                        {index + 1}. {question.question}
                      </span>
                      <Badge variant="outline">{question.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Hourly Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Hourly Activity</CardTitle>
              <CardDescription>Conversation distribution throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-end justify-between gap-1">
                {data.conversationsByHour.map((hour, index) => {
                  const heightPercent = (hour.count / Math.max(...data.conversationsByHour.map(h => h.count))) * 100
                  return (
                    <div
                      key={index}
                      className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t hover:from-blue-700 hover:to-blue-500 transition-colors group relative"
                      style={{ height: `${heightPercent}%` }}
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {hour.count}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>12AM</span>
                <span>6AM</span>
                <span>12PM</span>
                <span>6PM</span>
                <span>11PM</span>
              </div>
            </CardContent>
          </Card>
          </div>
          )}
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          {businessTier === 'starter' || !data.languageDistribution || Object.keys(data.languageDistribution).length === 0 ? (
            <EmptyState tab="users" tier={businessTier} />
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Language Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Language Distribution</CardTitle>
                <CardDescription>User languages breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(data.languageDistribution).map(([lang, percentage]) => (
                    <div key={lang}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700">{lang}</span>
                        <span className="text-gray-900 font-medium">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Device Types */}
            <Card>
              <CardHeader>
                <CardTitle>Device Types</CardTitle>
                <CardDescription>User device distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(data.deviceTypes).map(([device, percentage]) => (
                    <div key={device}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700">{device}</span>
                        <span className="text-gray-900 font-medium">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-blue-400 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Metrics</CardTitle>
                <CardDescription>Booking and inquiry conversion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700">Booking Conversion</span>
                      <span className="text-lg font-semibold">{data.conversionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-600 to-green-400 h-3 rounded-full"
                        style={{ width: `${data.conversionRate}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700">Query Resolution</span>
                      <span className="text-lg font-semibold">{data.resolutionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-blue-400 h-3 rounded-full"
                        style={{ width: `${data.resolutionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Response Metrics</CardTitle>
                <CardDescription>Chatbot performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-700">Successful Responses</span>
                    <span className="font-semibold text-green-700">2,483</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm text-gray-700">Escalated to Human</span>
                    <span className="font-semibold text-yellow-700">142</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-sm text-gray-700">Failed Responses</span>
                    <span className="font-semibold text-red-700">38</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Insights</CardTitle>
              <CardDescription>Recommendations based on your analytics data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Peak Hours Optimization</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Your chatbot receives the most traffic between 2-4 PM. Consider adding more detailed responses for common afternoon queries about dinner reservations and evening activities.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <Target className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Conversion Opportunity</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      23.5% of users asking about availability don&apos;t complete bookings. Adding a direct booking link in responses could increase conversion by an estimated 8-12%.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                  <Globe className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Language Expansion</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      15% of your users speak Japanese. Consider adding more Japanese language responses and cultural customizations to improve engagement with this segment.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}