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
  Check,
  ArrowRight,
  DollarSign,
  AlertCircle
} from 'lucide-react'

interface AdminStats {
  // User metrics
  totalUsers: number
  newUsersThisMonth: number
  dormantUsers: number
  usersByTier: Record<string, number>
  
  // Subscription metrics
  activeSubscribers: number
  monthlyRevenue: number
  mrr: number
  arr: number
  monthlySubscribers: number
  annualSubscribers: number
  arpu: number
  subscriptionStatus: Record<string, number>
  
  // Conversation metrics
  totalConversations: number
  conversationsToday: number
  
  // Activity metrics
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
  apiCallsToday: number
  
  // Performance metrics
  avgResponseTime: number
  responseTimeChange: number
  
  // Issue metrics
  failedPayments: number
  inGracePeriod: number
  accessRevoked: number
  apiErrors: number
  failedConversations: number
  uptime: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [dateRange, setDateRange] = useState('7d')

  useEffect(() => {
    fetchDashboardData()
  }, [dateRange])

  const fetchDashboardData = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken')
      const token = localStorage.getItem('token')
      
      if (!adminToken && !token) {
        router.push('/admin-login')
        return
      }
      
      // Verify this is an admin user
      const authToken = adminToken || token
      
      // Fetch real admin statistics from the API
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin-login')
          return
        }
        throw new Error('Failed to fetch admin stats')
      }
      
      const adminStats = await response.json()
      setStats(adminStats)
      setIsAdmin(true)
      setLoading(false)
    } catch (error) {
      console.error('Dashboard error:', error)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    // Clear admin session
    localStorage.removeItem('adminToken')
    localStorage.removeItem('token')
    document.cookie = 'token=; path=/; max-age=0'
    router.push('/admin-login')
  }

  const exportData = async (format: 'csv' | 'json') => {
    const data = JSON.stringify(stats, null, 2)
    const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `admin-stats-${dateRange}.${format}`
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

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
          <Link href="/admin-login" className="mt-4 inline-block text-cyan-600 hover:text-cyan-700">
            Go to Admin Login
          </Link>
        </div>
      </div>
    )
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
                <p className="text-sm text-gray-600 mt-1">System-wide overview</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
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
              <button
                onClick={() => exportData('json')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                <Download className="h-4 w-4" />
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
        {/* System Overview Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">System Overview</h2>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/users"
              className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1"
            >
              Manage Users
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/admin/analytics"
              className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1"
            >
              View Analytics
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-cyan-600" />
              <span className="text-xs text-green-600 font-medium">
                +{stats?.newUsersThisMonth || 0} this month
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalUsers?.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-600">Total Businesses</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <span className="text-xs text-gray-500">MRR</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${stats?.mrr?.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-600">Monthly Revenue</div>
            <div className="text-xs text-gray-500 mt-1">
              ARR: ${stats?.arr?.toLocaleString() || 0}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <span className="text-xs text-gray-500">
                +{stats?.conversationsToday || 0} today
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalConversations?.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-600">Total Conversations</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-8 w-8 text-purple-600" />
              <span className="text-xs text-gray-500">DAU</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.dailyActiveUsers || 0}
            </div>
            <div className="text-sm text-gray-600">Daily Active Users</div>
          </div>
        </div>

        {/* Detailed Metrics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-600" />
              Users by Tier
            </h2>
            <div className="space-y-3">
              {stats?.usersByTier && Object.entries(stats.usersByTier).map(([tier, count]) => (
                <div key={tier} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 capitalize">{tier}</span>
                  <span className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded">
                    {count as number}
                  </span>
                </div>
              ))}
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Active Subscribers</span>
                  <span className="text-sm font-bold text-green-600">
                    {stats?.activeSubscribers || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-gray-900">Monthly</span>
                  <span className="text-sm font-bold text-gray-900">
                    {stats?.monthlySubscribers || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-gray-900">Annual</span>
                  <span className="text-sm font-bold text-gray-900">
                    {stats?.annualSubscribers || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-gray-900">ARPU</span>
                  <span className="text-sm font-bold text-gray-900">
                    ${stats?.arpu || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-600" />
              System Health
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Uptime</span>
                <span className="text-sm font-medium text-green-600">
                  {stats?.uptime || 99.9}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">API Calls Today</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.apiCallsToday?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Avg Response Time</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.avgResponseTime || 0}ms
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">API Errors (24h)</span>
                <span className={`text-sm font-medium ${(stats?.apiErrors || 0) > 10 ? 'text-red-600' : 'text-gray-900'}`}>
                  {stats?.apiErrors || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Failed Payments</span>
                <span className={`text-sm font-medium ${(stats?.failedPayments || 0) > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                  {stats?.failedPayments || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">In Grace Period</span>
                <span className={`text-sm font-medium ${(stats?.inGracePeriod || 0) > 0 ? 'text-yellow-600' : 'text-gray-900'}`}>
                  {stats?.inGracePeriod || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Overview */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cyan-600" />
              Activity Metrics
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Daily Active</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.dailyActiveUsers || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Weekly Active</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.weeklyActiveUsers || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Monthly Active</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.monthlyActiveUsers || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Dormant (30d)</span>
                <span className="text-sm font-medium text-orange-600">
                  {stats?.dormantUsers || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Access Revoked</span>
                <span className={`text-sm font-medium ${(stats?.accessRevoked || 0) > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {stats?.accessRevoked || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/users"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-cyan-600" />
                <span className="text-gray-700">Manage Users</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>
            <Link
              href="/admin/conversations"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-cyan-600" />
                <span className="text-gray-700">All Conversations</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>
            <Link
              href="/admin/usage-costs"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-cyan-600" />
                <span className="text-gray-700">Usage & Costs</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>
            <Link
              href="/admin/api-access"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-cyan-600" />
                <span className="text-gray-700">API Access</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>
            <Link
              href="/admin/knowledge-base"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-cyan-600" />
                <span className="text-gray-700">Knowledge Base</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>
            <Link
              href="/admin/analytics"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-cyan-600" />
                <span className="text-gray-700">Analytics</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>
            <Link
              href="/admin/reports"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-cyan-600" />
                <span className="text-gray-700">Reports</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-cyan-600" />
                <span className="text-gray-700">Settings</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}