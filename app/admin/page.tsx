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
  Bot
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

      // Use mock data for demo
      setStats({
        totalConversations: 1247,
        todayConversations: 43,
        averageSatisfaction: 4.6,
        activeUsers: 186,
        topQuestions: [
          { question: 'What time is check-in?', count: 89 },
          { question: 'Do you have parking?', count: 67 },
          { question: 'Is breakfast included?', count: 54 },
          { question: 'What are your pool hours?', count: 48 },
          { question: 'How far from the beach?', count: 41 }
        ],
        languageBreakdown: {
          English: 65,
          Japanese: 20,
          Chinese: 10,
          Spanish: 5
        },
        weeklyTrend: [
          { date: 'Mon', count: 145 },
          { date: 'Tue', count: 178 },
          { date: 'Wed', count: 203 },
          { date: 'Thu', count: 189 },
          { date: 'Fri', count: 224 },
          { date: 'Sat', count: 267 },
          { date: 'Sun', count: 241 }
        ],
        responseTime: 1.2
      })
      setBusiness({
        id: '1',
        name: 'Demo Resort Hawaii',
        tier: 'professional',
        subscriptionStatus: 'active'
      })
      setLoading(false)
    } catch (error) {
      console.error('Dashboard error:', error)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
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
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
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
            <div className="relative h-64">
              <div className="absolute inset-0 flex items-end justify-between gap-2">
                {stats?.weeklyTrend.map((day, index) => {
                  const height = (day.count / Math.max(...stats.weeklyTrend.map(d => d.count))) * 100
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="text-xs text-gray-600 mb-1">{day.count}</div>
                      <div
                        className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t"
                        style={{ height: `${height}%` }}
                      />
                      <div className="text-xs text-gray-600 mt-2">{day.date}</div>
                    </div>
                  )
                })}
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