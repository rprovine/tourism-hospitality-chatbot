'use client'

import { useState } from 'react'
import { 
  BarChart3, 
  MessageSquare, 
  Users, 
  TrendingUp,
  Calendar,
  DollarSign,
  Settings,
  ChevronDown,
  Bot,
  Star,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AnalyticsChart from '@/components/analytics/AnalyticsChart'
import ConversationsList from '@/components/dashboard/ConversationsList'
import SettingsPanel from '@/components/dashboard/SettingsPanel'

type TabType = 'overview' | 'conversations' | 'analytics' | 'settings'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [selectedBusiness] = useState('Demo Resort Hawaii')
  const [dateRange] = useState('7d')

  const stats = {
    totalConversations: 2847,
    activeUsers: 423,
    satisfactionScore: 4.8,
    revenue: 15420,
    responseTime: 1.2,
    resolutionRate: 92
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Bot className="h-8 w-8 text-cyan-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Hospitality AI Admin</h1>
                <p className="text-sm text-gray-600">Manage your chatbot and view analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Last {dateRange === '7d' ? '7 days' : dateRange === '30d' ? '30 days' : '90 days'}
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                {selectedBusiness}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="px-6 border-t">
          <nav className="flex gap-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'conversations', label: 'Conversations', icon: MessageSquare },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-cyan-600 text-cyan-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalConversations.toLocaleString()}</div>
                  <p className="text-xs text-green-600">+12% from last period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeUsers}</div>
                  <p className="text-xs text-green-600">+8% from last period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
                  <Star className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.satisfactionScore}/5.0</div>
                  <p className="text-xs text-green-600">+0.2 from last period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
                  <DollarSign className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
                  <p className="text-xs text-green-600">+24% from last period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.responseTime}s</div>
                  <p className="text-xs text-green-600">-0.3s from last period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.resolutionRate}%</div>
                  <p className="text-xs text-green-600">+3% from last period</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Conversation Volume</CardTitle>
                  <CardDescription>Daily conversations over the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <AnalyticsChart type="conversations" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Questions</CardTitle>
                  <CardDescription>Most frequently asked questions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { question: 'What are your check-in times?', count: 342 },
                      { question: 'Do you have parking available?', count: 298 },
                      { question: 'How far are you from the beach?', count: 256 },
                      { question: 'What amenities do you offer?', count: 231 },
                      { question: 'Can I book a room?', count: 189 }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{item.question}</span>
                        <span className="text-sm font-medium text-gray-900">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Conversations */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Conversations</CardTitle>
                <CardDescription>Latest customer interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <ConversationsList limit={5} />
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'conversations' && (
          <Card>
            <CardHeader>
              <CardTitle>All Conversations</CardTitle>
              <CardDescription>View and manage all customer conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <ConversationsList />
            </CardContent>
          </Card>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversation Trends</CardTitle>
                <CardDescription>Volume and patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsChart type="trends" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Satisfaction</CardTitle>
                <CardDescription>Customer satisfaction metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsChart type="satisfaction" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Language Distribution</CardTitle>
                <CardDescription>Conversations by language</CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsChart type="languages" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>From inquiry to booking</CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsChart type="funnel" />
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <SettingsPanel businessName={selectedBusiness} />
        )}
      </main>
    </div>
  )
}