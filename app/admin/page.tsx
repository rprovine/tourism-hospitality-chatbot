'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  MessageSquare,
  Users,
  TrendingUp,
  Calendar,
  Globe,
  Star,
  Clock,
  BookOpen,
  Settings,
  Download,
  LogOut,
  ChevronRight,
  Activity,
  Bot,
  Check
} from 'lucide-react'

interface DashboardStats {
  totalConversations: number
  todayConversations: number
  averageSatisfaction: number
  activeUsers: number
  topQuestions: Array<{ question: string; count: number }>
  languageBreakdown: Record<string, number>
  weeklyTrend: Array<{ date: string; count: number }>
  responseTime: number
}

interface Business {
  id: string
  name: string
  tier: string
  subscriptionStatus: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [dateRange, setDateRange] = useState('7d')

  useEffect(() => {
    fetchDashboardData()
  }, [dateRange])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        router.push('/login')
        return
      }

      // Get business data from localStorage
      const businessData = localStorage.getItem('business')
      let businessInfo = {
        id: '1',
        name: 'Demo Resort Hawaii',
        tier: 'professional',
        subscriptionStatus: 'active'
      }
      
      if (businessData) {
        try {
          const parsed = JSON.parse(businessData)
          businessInfo = {
            id: parsed.id,
            name: parsed.name,
            tier: parsed.tier,
            subscriptionStatus: parsed.subscriptionStatus || 'active'
          }
        } catch (e) {
          console.error('Error parsing business data:', e)
        }
      }
      
      setBusiness(businessInfo)
      
      // Use tier-specific mock data
      const tierMultiplier = 
        businessInfo.tier === 'starter' ? 0.5 :
        businessInfo.tier === 'professional' ? 1 :
        businessInfo.tier === 'premium' ? 2.5 :
        businessInfo.tier === 'enterprise' ? 5 : 1
      
      setStats({
        totalConversations: Math.round(1247 * tierMultiplier),
        todayConversations: Math.round(43 * tierMultiplier),
        averageSatisfaction: businessInfo.tier === 'premium' ? 4.8 : businessInfo.tier === 'enterprise' ? 4.9 : 4.6,
        activeUsers: Math.round(186 * tierMultiplier),
        topQuestions: [
          { question: businessInfo.tier === 'premium' ? 'What spa services are available?' : 'What time is check-in?', count: 89 },
          { question: businessInfo.tier === 'premium' ? 'Can you arrange private dining?' : 'Do you have parking?', count: 67 },
          { question: businessInfo.tier === 'premium' ? 'What are the VIP benefits?' : 'Is breakfast included?', count: 54 },
          { question: 'What are your pool hours?', count: 48 },
          { question: 'How far from the beach?', count: 41 }
        ],
        languageBreakdown: 
          businessInfo.tier === 'premium' ? {
            English: 40,
            Japanese: 25,
            Chinese: 20,
            Spanish: 10,
            Korean: 5
          } : businessInfo.tier === 'enterprise' ? {
            English: 35,
            Japanese: 20,
            Chinese: 15,
            Spanish: 10,
            Korean: 8,
            French: 5,
            German: 4,
            Portuguese: 3
          } : {
            English: 65,
            Japanese: 20,
            Chinese: 10,
            Spanish: 5
          },
        weeklyTrend: [
          { date: 'Mon', count: Math.round(145 * tierMultiplier) },
          { date: 'Tue', count: Math.round(178 * tierMultiplier) },
          { date: 'Wed', count: Math.round(203 * tierMultiplier) },
          { date: 'Thu', count: Math.round(189 * tierMultiplier) },
          { date: 'Fri', count: Math.round(224 * tierMultiplier) },
          { date: 'Sat', count: Math.round(267 * tierMultiplier) },
          { date: 'Sun', count: Math.round(241 * tierMultiplier) }
        ],
        responseTime: businessInfo.tier === 'premium' ? 0.8 : businessInfo.tier === 'enterprise' ? 0.5 : 1.2
      })
      setLoading(false)
    } catch (error) {
      console.error('Dashboard error:', error)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    // Clear both localStorage and cookies
    localStorage.removeItem('token')
    localStorage.removeItem('business')
    document.cookie = 'token=; path=/; max-age=0'
    router.push('/login')
  }

  const exportData = async (format: 'csv' | 'json') => {
    // Mock export for demo
    const data = JSON.stringify(stats, null, 2)
    const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${dateRange}.${format}`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-700"></div>
      </div>
    )
  }

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-700'
      case 'premium': return 'bg-amber-100 text-amber-700'
      case 'professional': return 'bg-cyan-100 text-cyan-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Bot className="h-8 w-8 text-cyan-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                {business && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTierBadgeColor(business.tier)}`}>
                      {business.tier.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-600">{business.name}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="1d">Today</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button
                onClick={() => exportData('csv')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                <Download className="h-4 w-4 text-gray-600" />
                Export
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="h-8 w-8 text-cyan-600" />
              <span className="text-xs text-green-600 font-medium">
                +{stats?.todayConversations || 0} today
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalConversations.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-600">Total Conversations</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-blue-600" />
              <span className="text-xs text-gray-500">Active now</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.activeUsers || 0}
            </div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <Star className="h-8 w-8 text-yellow-600" />
              <span className="text-xs text-gray-500">/5.0</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.averageSatisfaction.toFixed(1) || 0}
            </div>
            <div className="text-sm text-gray-600">Avg Satisfaction</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-8 w-8 text-green-600" />
              <span className="text-xs text-gray-500">seconds</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.responseTime.toFixed(1) || 0}
            </div>
            <div className="text-sm text-gray-600">Avg Response Time</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Trend Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cyan-600" />
              Conversation Trend
            </h2>
            <div className="relative">
              {/* Chart container with fixed height */}
              <div className="flex gap-2">
                {/* Y-axis labels */}
                <div className="w-12 h-64 flex flex-col justify-between text-xs text-gray-500 text-right">
                  <span>{Math.max(...(stats?.weeklyTrend.map(d => d.count) || [0]))}</span>
                  <span>{Math.round(Math.max(...(stats?.weeklyTrend.map(d => d.count) || [0])) * 0.75)}</span>
                  <span>{Math.round(Math.max(...(stats?.weeklyTrend.map(d => d.count) || [0])) * 0.5)}</span>
                  <span>{Math.round(Math.max(...(stats?.weeklyTrend.map(d => d.count) || [0])) * 0.25)}</span>
                  <span>0</span>
                </div>
                
                {/* Chart area */}
                <div className="flex-1 relative h-64">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="border-b border-gray-100"></div>
                    <div className="border-b border-gray-100"></div>
                    <div className="border-b border-gray-100"></div>
                    <div className="border-b border-gray-100"></div>
                    <div className="border-b border-gray-200"></div>
                  </div>
                  
                  {/* Bars container */}
                  <div className="relative h-full flex items-end justify-between gap-2">
                    {stats?.weeklyTrend.map((day, index) => {
                      const maxValue = Math.max(...stats.weeklyTrend.map(d => d.count))
                      const heightPercent = (day.count / maxValue) * 100
                      return (
                        <div key={index} className="flex-1 h-full flex flex-col justify-end items-center">
                          <div className="relative w-full flex flex-col items-center" style={{ height: '100%' }}>
                            {/* Bar with proper height calculation */}
                            <div className="w-full flex flex-col justify-end" style={{ height: '100%' }}>
                              <div className="relative group">
                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                  {day.count} conversations
                                </div>
                                {/* Bar */}
                                <div
                                  className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t transition-all duration-300 hover:from-cyan-700 hover:to-cyan-500"
                                  style={{ height: `${(heightPercent * 256) / 100}px` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* X-axis labels */}
                  <div className="absolute -bottom-6 left-0 right-0 flex justify-between">
                    {stats?.weeklyTrend.map((day, index) => (
                      <div key={index} className="flex-1 text-center">
                        <span className="text-xs text-gray-600 font-medium">{day.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Language Breakdown */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-cyan-600" />
              Languages
            </h2>
            <div className="space-y-3">
              {stats && Object.entries(stats.languageBreakdown).map(([lang, percentage]) => (
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
          </div>
        </div>

        {/* Top Questions & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Top Questions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-cyan-600" />
              Top Questions
            </h2>
            <div className="space-y-3">
              {stats?.topQuestions.map((q, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 truncate flex-1 mr-4">
                    {q.question}
                  </span>
                  <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                    {q.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                href="/admin/knowledge-base"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-cyan-600" />
                  <span className="text-gray-700">Manage Knowledge Base</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
              <Link
                href="/admin/conversations"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-cyan-600" />
                  <span className="text-gray-700">View Conversations</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-cyan-600" />
                  <span className="text-gray-700">Settings & Customization</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
              <Link
                href="/admin/widget"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-cyan-600" />
                  <span className="text-gray-700">Widget Installation</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>

        {/* Premium Features Section - Only show for premium/enterprise tiers */}
        {(business?.tier === 'premium' || business?.tier === 'enterprise') && (
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Star className="h-6 w-6 text-purple-600" />
              <div className="flex-1">
                <h3 className="font-bold text-purple-900 text-lg mb-3">
                  {business.tier === 'premium' ? 'Premium Features Active' : 'Enterprise Features Active'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {business.tier === 'premium' && (
                    <>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">5 Languages Enabled</div>
                          <div className="text-xs text-gray-600">EN, JA, ZH, ES, KO</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">AI Custom Training</div>
                          <div className="text-xs text-gray-600">Trained on your data</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">Dedicated Manager</div>
                          <div className="text-xs text-gray-600">Sarah Chen assigned</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">99.9% SLA</div>
                          <div className="text-xs text-gray-600">Guaranteed uptime</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">Executive Analytics</div>
                          <div className="text-xs text-gray-600">Board-ready reports</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">Priority Support</div>
                          <div className="text-xs text-gray-600">&lt; 1 hour response</div>
                        </div>
                      </div>
                    </>
                  )}
                  {business.tier === 'enterprise' && (
                    <>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">10+ Languages</div>
                          <div className="text-xs text-gray-600">Global coverage</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">Multi-Property</div>
                          <div className="text-xs text-gray-600">12 properties active</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">SSO/SAML</div>
                          <div className="text-xs text-gray-600">Enterprise auth</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-4 flex gap-3">
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Schedule Manager Call
                  </button>
                  <button 
                    onClick={() => router.push('/admin/reports')}
                    className="px-4 py-2 bg-white hover:bg-gray-50 text-purple-700 border border-purple-300 rounded-lg text-sm font-medium transition-colors">
                    View Executive Reports
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Demo Notice */}
        <div className="mt-8 bg-cyan-50 border border-cyan-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Activity className="h-5 w-5 text-cyan-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-cyan-900">Demo Mode Active</h3>
              <p className="text-sm text-cyan-700 mt-1">
                This dashboard is showing sample data. In production, you'll see real-time analytics from your actual customer interactions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}