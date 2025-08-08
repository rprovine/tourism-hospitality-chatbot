'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import DashboardNav from '@/components/dashboard/DashboardNav'
import { 
  Users,
  MessageSquare,
  TrendingUp,
  Calendar,
  Bot,
  Brain,
  Star,
  ChevronRight,
  BarChart3,
  Settings,
  Hash,
  CreditCard,
  BookOpen
} from 'lucide-react'

export default function BusinessDashboard() {
  const [business, setBusiness] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get business data from localStorage
    const businessData = localStorage.getItem('business')
    if (businessData) {
      setBusiness(JSON.parse(businessData))
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-cyan-600"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      
      <div className="container mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back{business?.name ? `, ${business.name}` : ''}!
          </h1>
          <p className="text-gray-600 mt-2">
            Your AI chatbot is actively helping guests 24/7
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today\'s Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-muted-foreground">
                +15% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Guests</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                Currently chatting
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8</div>
              <p className="text-xs text-muted-foreground">
                Based on 89 ratings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.2s</div>
              <p className="text-xs text-muted-foreground">
                Average response
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Matching Nav Order */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Analytics */}
          <Link href="/analytics">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-cyan-600" />
                    <div>
                      <CardTitle>Analytics</CardTitle>
                      <CardDescription>View detailed metrics</CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* Knowledge Base */}
          <Link href="/knowledge-base">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bot className="h-8 w-8 text-indigo-600" />
                    <div>
                      <CardTitle>Knowledge Base</CardTitle>
                      <CardDescription>Train your AI</CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* Revenue */}
          <Link href="/revenue">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div>
                      <CardTitle>Revenue</CardTitle>
                      <CardDescription>Optimize pricing</CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* Guests */}
          <Link href="/guests">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div>
                      <CardTitle>Guests</CardTitle>
                      <CardDescription>Guest intelligence</CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* Channels */}
          <Link href="/channels">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Hash className="h-8 w-8 text-orange-600" />
                    <div>
                      <CardTitle>Channels</CardTitle>
                      <CardDescription>Connect platforms</CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* AI Config */}
          <Link href="/ai-config">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Brain className="h-8 w-8 text-pink-600" />
                    <div>
                      <CardTitle>AI Config</CardTitle>
                      <CardDescription>Customize behavior</CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* Subscription */}
          <Link href="/subscription">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-blue-600" />
                    <div>
                      <CardTitle>Subscription</CardTitle>
                      <CardDescription>Manage your plan</CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* Billing */}
          <Link href="/billing">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-emerald-600" />
                    <div>
                      <CardTitle>Billing</CardTitle>
                      <CardDescription>Payment & invoices</CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* Settings */}
          <Link href="/settings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="h-8 w-8 text-gray-600" />
                    <div>
                      <CardTitle>Settings</CardTitle>
                      <CardDescription>Configure account</CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Tier Badge */}
        {business?.tier && (
          <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-cyan-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 capitalize">
                  {business.tier} Plan
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {business.tier === 'premium' ? 'You have access to all premium features' :
                   business.tier === 'professional' ? 'Professional features enabled' :
                   'Upgrade to unlock more features'}
                </p>
              </div>
              {business.tier !== 'premium' && (
                <Link href="/billing">
                  <Button variant="outline" size="sm">
                    Upgrade Plan
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}