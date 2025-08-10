import { MessageSquare, Users, TrendingUp, Lightbulb, BarChart3, Activity, Target, Lock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface EmptyStateProps {
  tab: 'conversations' | 'users' | 'performance' | 'insights'
  tier: string
  hasData?: boolean
}

export function EmptyState({ tab, tier, hasData = false }: EmptyStateProps) {
  const isStarterTier = tier === 'starter'
  const isProfessionalTier = tier === 'professional'
  const isPremiumTier = tier === 'premium'

  if (tab === 'conversations') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Daily Conversations</CardTitle>
            <CardDescription>Conversation volume over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No conversation data yet</p>
                <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">
                  As guests interact with your chatbot, you'll see daily conversation volumes, peak hours, and trending topics here.
                </p>
                {isStarterTier && (
                  <p className="text-xs text-gray-400 mt-3">
                    Starter plan tracks up to 100 conversations/month
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Questions</CardTitle>
            <CardDescription>Most frequently asked questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Building question patterns</p>
                <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">
                  Common questions will appear here, helping you improve your knowledge base and FAQs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (tab === 'users') {
    if (isStarterTier) {
      return (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Lock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium text-lg">User Analytics Unavailable</p>
              <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
                Detailed user analytics including language distribution, device types, and user journeys are available in Professional and Premium plans.
              </p>
              <Link href="/subscription">
                <Button variant="outline" className="mt-4">
                  View Upgrade Options
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Language Distribution</CardTitle>
            <CardDescription>User languages breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No user data yet</p>
                <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">
                  Language preferences will be tracked as users interact with your chatbot in different languages.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Types</CardTitle>
            <CardDescription>User device distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Collecting device data</p>
                <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">
                  Device types (mobile, desktop, tablet) will help you optimize the chat experience.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (tab === 'performance') {
    if (isStarterTier) {
      return (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Lock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium text-lg">Performance Metrics Unavailable</p>
              <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
                Advanced performance metrics including conversion tracking, resolution rates, and response quality analysis are available in Professional and Premium plans.
              </p>
              <Link href="/subscription">
                <Button variant="outline" className="mt-4">
                  Upgrade to Track Performance
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Metrics</CardTitle>
            <CardDescription>Booking and inquiry conversion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Tracking conversions</p>
                <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">
                  Conversion data will show how many chat inquiries turn into bookings and revenue.
                </p>
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
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Measuring performance</p>
                <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">
                  Track successful responses, escalations, and areas for improvement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (tab === 'insights') {
    if (isStarterTier || isProfessionalTier) {
      return (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Lock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium text-lg">AI Insights Unavailable</p>
              <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
                AI-powered insights and recommendations are available exclusively in the Premium plan. Get actionable suggestions to improve guest experience and increase revenue.
              </p>
              <Link href="/subscription">
                <Button variant="outline" className="mt-4">
                  Upgrade to Premium
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Insights</CardTitle>
          <CardDescription>Recommendations based on your analytics data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[200px] flex items-center justify-center">
            <div className="text-center">
              <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Gathering insights</p>
              <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
                After 7 days of data collection, AI will provide personalized recommendations to optimize your chatbot performance, increase conversions, and improve guest satisfaction.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}