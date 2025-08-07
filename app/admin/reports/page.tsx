'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'
import { 
  TrendingUp, 
  Download, 
  Calendar,
  DollarSign,
  Users,
  MessageSquare,
  Globe,
  Star,
  ArrowUp,
  ArrowDown,
  FileText,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Clock
} from 'lucide-react'

export default function ExecutiveReportsPage() {
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [loading, setLoading] = useState(false)
  const [business, setBusiness] = useState<any>(null)

  useEffect(() => {
    const businessData = localStorage.getItem('business')
    if (businessData) {
      setBusiness(JSON.parse(businessData))
    }
  }, [])

  const exportReport = (format: 'pdf' | 'csv' | 'ppt') => {
    setLoading(true)
    setTimeout(() => {
      const reportData = {
        period: selectedPeriod,
        generated: new Date().toISOString(),
        format: format
      }
      const blob = new Blob([JSON.stringify(reportData)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `executive-report-${selectedPeriod}.${format}`
      a.click()
      window.URL.revokeObjectURL(url)
      setLoading(false)
    }, 1000)
  }

  const kpiData = {
    revenue: { value: '$125,400', change: 18.5, trend: 'up' },
    conversations: { value: '3,247', change: 24.3, trend: 'up' },
    satisfaction: { value: '4.8/5', change: 5.2, trend: 'up' },
    bookingConversion: { value: '12.8%', change: -2.1, trend: 'down' },
    responseTime: { value: '0.8s', change: -15.3, trend: 'up' },
    resolutionRate: { value: '94%', change: 3.7, trend: 'up' }
  }

  const insights = [
    {
      type: 'success',
      title: 'Record Guest Satisfaction',
      description: 'Guest satisfaction reached an all-time high of 4.8/5 this period',
      impact: 'High'
    },
    {
      type: 'warning',
      title: 'Booking Conversion Decline',
      description: 'Conversion rate decreased by 2.1% - investigation recommended',
      impact: 'Medium'
    },
    {
      type: 'info',
      title: 'Language Expansion Opportunity',
      description: '23% of inquiries in Chinese suggest adding Mandarin support',
      impact: 'Medium'
    },
    {
      type: 'success',
      title: 'Cost Savings Achieved',
      description: 'AI handled 78% of inquiries, saving approximately $18,000 in staffing',
      impact: 'High'
    }
  ]

  if (!business || (business.tier !== 'premium' && business.tier !== 'enterprise')) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-8 text-center">
            <Award className="h-16 w-16 text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-purple-900 mb-2">Executive Reports</h2>
            <p className="text-purple-700 mb-6">
              Board-ready analytics and insights are available with Premium and Enterprise plans
            </p>
            <button 
              onClick={() => router.push('/admin/billing')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Executive Reports</h1>
              <p className="text-gray-600">Comprehensive business intelligence and strategic insights</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => exportReport('pdf')}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Export PDF
                </button>
                <button
                  onClick={() => exportReport('ppt')}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  PPT
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-green-600" />
              <span className={`flex items-center gap-1 text-sm font-medium ${
                kpiData.revenue.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {kpiData.revenue.trend === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {Math.abs(kpiData.revenue.change)}%
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{kpiData.revenue.value}</div>
            <div className="text-sm text-gray-600">Revenue Impact</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <span className={`flex items-center gap-1 text-sm font-medium ${
                kpiData.conversations.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {kpiData.conversations.trend === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {Math.abs(kpiData.conversations.change)}%
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{kpiData.conversations.value}</div>
            <div className="text-sm text-gray-600">Total Conversations</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <Star className="h-8 w-8 text-yellow-600" />
              <span className={`flex items-center gap-1 text-sm font-medium ${
                kpiData.satisfaction.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {kpiData.satisfaction.trend === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {Math.abs(kpiData.satisfaction.change)}%
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{kpiData.satisfaction.value}</div>
            <div className="text-sm text-gray-600">Guest Satisfaction</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="h-8 w-8 text-purple-600" />
              <span className={`flex items-center gap-1 text-sm font-medium ${
                kpiData.bookingConversion.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {kpiData.bookingConversion.trend === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {Math.abs(kpiData.bookingConversion.change)}%
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{kpiData.bookingConversion.value}</div>
            <div className="text-sm text-gray-600">Booking Conversion</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-8 w-8 text-cyan-600" />
              <span className={`flex items-center gap-1 text-sm font-medium text-green-600`}>
                <ArrowDown className="h-3 w-3" />
                {Math.abs(kpiData.responseTime.change)}%
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{kpiData.responseTime.value}</div>
            <div className="text-sm text-gray-600">Avg Response Time</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className="h-8 w-8 text-indigo-600" />
              <span className={`flex items-center gap-1 text-sm font-medium ${
                kpiData.resolutionRate.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {kpiData.resolutionRate.trend === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {Math.abs(kpiData.resolutionRate.change)}%
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{kpiData.resolutionRate.value}</div>
            <div className="text-sm text-gray-600">Resolution Rate</div>
          </div>
        </div>

        {/* Strategic Insights */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Strategic Insights & Recommendations
          </h2>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className={`border-l-4 p-4 rounded-r-lg ${
                insight.type === 'success' ? 'border-green-500 bg-green-50' :
                insight.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                'border-blue-500 bg-blue-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                    <p className="text-sm text-gray-700 mt-1">{insight.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    insight.impact === 'High' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {insight.impact} Impact
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-600" />
              Query Categories
            </h3>
            <div className="space-y-3">
              {[
                { category: 'Booking Inquiries', percentage: 35, color: 'bg-blue-500' },
                { category: 'Amenities', percentage: 25, color: 'bg-green-500' },
                { category: 'Location & Directions', percentage: 20, color: 'bg-yellow-500' },
                { category: 'Policies', percentage: 12, color: 'bg-purple-500' },
                { category: 'Other', percentage: 8, color: 'bg-gray-500' }
              ].map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700">{item.category}</span>
                    <span className="font-medium">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${item.color} h-2 rounded-full`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-600" />
              Geographic Distribution
            </h3>
            <div className="space-y-3">
              {[
                { region: 'North America', percentage: 40, color: 'bg-cyan-500' },
                { region: 'Asia Pacific', percentage: 30, color: 'bg-indigo-500' },
                { region: 'Europe', percentage: 20, color: 'bg-pink-500' },
                { region: 'Other', percentage: 10, color: 'bg-gray-500' }
              ].map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700">{item.region}</span>
                    <span className="font-medium">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${item.color} h-2 rounded-full`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ROI Analysis */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-4">Return on Investment Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold">312%</div>
              <div className="text-purple-100">ROI This Period</div>
            </div>
            <div>
              <div className="text-3xl font-bold">$84,000</div>
              <div className="text-purple-100">Cost Savings</div>
            </div>
            <div>
              <div className="text-3xl font-bold">4.2x</div>
              <div className="text-purple-100">Efficiency Gain</div>
            </div>
          </div>
          <p className="mt-4 text-purple-100">
            The AI chatbot has handled 78% of customer inquiries autonomously, 
            reducing support costs by 65% while improving response times by 92%.
          </p>
        </div>
      </div>
    </div>
  )
}