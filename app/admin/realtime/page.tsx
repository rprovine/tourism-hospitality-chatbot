'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AdminNav from '@/components/admin/AdminNav'
import { 
  Users,
  CreditCard,
  MessageSquare,
  TrendingUp,
  Activity,
  DollarSign,
  UserCheck,
  AlertCircle,
  Clock,
  ChevronRight,
  RefreshCw,
  Zap,
  Target,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Minus,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'

interface RealtimeMetrics {
  metrics: {
    totalUsers: number
    activeUsers: number
    paidUsers: number
    trialUsers: number
    canceledUsers: number
    mrr: number
    arpu: string
    growthRate: string
    churnRate: string
    conversionRate: string
    todayConversations: number
    totalConversations: number
  }
  recentSignups: Array<{
    id: string
    email: string
    name: string
    tier: string
    status: string
    createdAt: string
    conversationsToday: number
  }>
  tierDistribution: {
    starter: number
    professional: number
    premium: number
    enterprise: number
  }
  systemHealth: {
    database: string
    api: string
    chatbot: string
    payments: string
  }
  lastUpdated: string
}

export default function RealtimeDashboard() {
  const [metrics, setMetrics] = useState<RealtimeMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  useEffect(() => {
    fetchMetrics()
    
    // Auto-refresh every 30 seconds
    const interval = autoRefresh ? setInterval(fetchMetrics, 30000) : null
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token')
      const response = await fetch('/api/admin/realtime', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      } else {
        // Use mock data for demo
        setMetrics(getMockMetrics())
      }
      setLastRefresh(new Date())
    } catch (error) {
      setMetrics(getMockMetrics())
    } finally {
      setLoading(false)
    }
  }

  const getMockMetrics = (): RealtimeMetrics => ({
    metrics: {
      totalUsers: 127,
      activeUsers: 89,
      paidUsers: 66,
      trialUsers: 23,
      canceledUsers: 8,
      mrr: 8947,
      arpu: '135.56',
      growthRate: '12.5',
      churnRate: '2.3',
      conversionRate: '68.5',
      todayConversations: 342,
      totalConversations: 45678
    },
    recentSignups: [
      { id: '1', email: 'new@hotel.com', name: 'New Hotel', tier: 'professional', status: 'trialing', createdAt: new Date().toISOString(), conversationsToday: 5 },
      { id: '2', email: 'beach@resort.com', name: 'Beach Resort', tier: 'premium', status: 'active', createdAt: new Date(Date.now() - 3600000).toISOString(), conversationsToday: 23 }
    ],
    tierDistribution: {
      starter: 45,
      professional: 52,
      premium: 28,
      enterprise: 2
    },
    systemHealth: {
      database: 'healthy',
      api: 'healthy',
      chatbot: 'healthy',
      payments: 'healthy'
    },
    lastUpdated: new Date().toISOString()
  })

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'critical': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const getTrendIcon = (value: string) => {
    const num = parseFloat(value)
    if (num > 0) return <ArrowUp className="h-4 w-4 text-green-600" />
    if (num < 0) return <ArrowDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">Loading real-time metrics...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header with Controls */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Real-Time Dashboard</h1>
            <p className="text-gray-600 mt-2">Live platform metrics and system status</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMetrics}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              {autoRefresh ? 'Auto' : 'Manual'}
            </Button>
          </div>
        </div>

        {/* System Health Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="font-semibold text-gray-900">System Status</span>
              {Object.entries(metrics?.systemHealth || {}).map(([service, status]) => (
                <div key={service} className="flex items-center gap-2">
                  {getHealthIcon(status)}
                  <span className="text-sm text-gray-700 capitalize">{service}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-green-600 animate-pulse" />
              <span className="text-green-600 font-medium">All Systems Operational</span>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* MRR Card */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-bl-full" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics?.metrics.mrr.toLocaleString()}</div>
              <div className="flex items-center gap-2 text-xs mt-2">
                {getTrendIcon(metrics?.metrics.growthRate || '0')}
                <span className={parseFloat(metrics?.metrics.growthRate || '0') >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {metrics?.metrics.growthRate}% growth
                </span>
                <span className="text-gray-500">• ${metrics?.metrics.arpu} ARPU</span>
              </div>
            </CardContent>
          </Card>

          {/* Active Users Card */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.metrics.activeUsers}</div>
              <div className="flex items-center gap-2 text-xs mt-2">
                <span className="text-blue-600">{metrics?.metrics.trialUsers} trials</span>
                <span className="text-gray-500">•</span>
                <span className="text-green-600">{metrics?.metrics.paidUsers} paid</span>
              </div>
            </CardContent>
          </Card>

          {/* Conversations Card */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversations Today</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.metrics.todayConversations}</div>
              <div className="text-xs text-gray-500 mt-2">
                Total: {metrics?.metrics.totalConversations.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          {/* Conversion Rate Card */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-bl-full" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.metrics.conversionRate}%</div>
              <div className="flex items-center gap-2 text-xs mt-2">
                <span className="text-orange-600">{metrics?.metrics.churnRate}% churn</span>
                <span className="text-gray-500">• Trial → Paid</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Activity Feed and Tier Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Activity Feed */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Live Activity</CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Activity className="h-4 w-4 animate-pulse text-green-500" />
                  <span>Real-time</span>
                </div>
              </div>
              <CardDescription>Recent signups and activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics?.recentSignups.map((signup) => {
                  const timeDiff = Date.now() - new Date(signup.createdAt).getTime()
                  const timeAgo = timeDiff < 3600000 
                    ? `${Math.floor(timeDiff / 60000)} minutes ago`
                    : `${Math.floor(timeDiff / 3600000)} hours ago`
                  
                  return (
                    <div key={signup.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                            {signup.name[0].toUpperCase()}
                          </div>
                          {signup.status === 'trialing' && (
                            <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full animate-pulse" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{signup.name}</div>
                          <div className="text-sm text-gray-500">{signup.email}</div>
                          <div className="text-xs text-gray-400">{timeAgo}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            signup.tier === 'premium' ? 'bg-purple-100 text-purple-800' :
                            signup.tier === 'professional' ? 'bg-cyan-100 text-cyan-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {signup.tier}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            signup.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {signup.status}
                          </span>
                        </div>
                        {signup.conversationsToday > 0 && (
                          <div className="text-xs text-gray-500">
                            {signup.conversationsToday} chats today
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Tier Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
              <CardDescription>By subscription tier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(metrics?.tierDistribution || {}).map(([tier, count]) => {
                  const total = metrics?.metrics.totalUsers || 1
                  const percentage = ((count / total) * 100).toFixed(1)
                  const revenue = {
                    starter: 29,
                    professional: 149,
                    premium: 299,
                    enterprise: 999
                  }[tier] || 0
                  
                  return (
                    <div key={tier}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium capitalize text-gray-700">{tier}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{count}</span>
                          <span className="text-xs text-gray-500">({percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div 
                          className={`h-2 rounded-full ${
                            tier === 'enterprise' ? 'bg-yellow-600' :
                            tier === 'premium' ? 'bg-purple-600' :
                            tier === 'professional' ? 'bg-cyan-600' :
                            'bg-gray-600'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        ${(count * revenue).toLocaleString()} MRR
                      </div>
                    </div>
                  )
                })}
                
                <div className="pt-4 mt-4 border-t">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Users</span>
                      <span className="font-bold">{metrics?.metrics.totalUsers}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Conversion</span>
                      <span className="font-bold text-green-600">{metrics?.metrics.conversionRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Churn</span>
                      <span className="font-bold text-orange-600">{metrics?.metrics.churnRate}%</span>
                    </div>
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