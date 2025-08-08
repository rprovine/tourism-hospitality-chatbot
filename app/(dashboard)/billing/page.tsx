'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingState } from '@/components/ui/loading-state'
import { 
  AlertCircle, 
  Check, 
  X, 
  Crown, 
  Shield, 
  Zap, 
  ArrowUpRight,
  TrendingUp,
  Users,
  MessageSquare,
  Brain,
  Hash,
  BarChart3,
  Phone,
  Building,
  Sparkles
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import Link from 'next/link'

const planDetails = {
  starter: {
    name: 'Starter',
    price: 29,
    icon: Zap,
    color: 'green',
    features: [
      { text: '100 conversations/month', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'Email support', included: true },
      { text: 'Web chat widget', included: true },
      { text: '50 knowledge base items', included: true },
      { text: 'Basic AI models', included: true },
      { text: '6 languages (English, Spanish, Japanese, Chinese, French, German)', included: true },
      { text: 'Revenue optimization', included: false },
      { text: 'Guest intelligence', included: false },
      { text: 'Multi-channel support', included: false },
      { text: 'Advanced AI models', included: false },
      { text: 'API access', included: false },
      { text: 'Priority support', included: false }
    ]
  },
  professional: {
    name: 'Professional',
    price: 149,
    icon: Shield,
    color: 'blue',
    features: [
      { text: '1,000 conversations/month', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Web chat + WhatsApp + SMS', included: true },
      { text: '500 knowledge base items', included: true },
      { text: 'Advanced AI models (GPT-4, Claude Sonnet)', included: true },
      { text: '7 languages + Hawaiian Pidgin 🤙', included: true },
      { text: 'Revenue optimization', included: true },
      { text: 'Guest intelligence & CRM', included: true },
      { text: 'Multi-channel support', included: true },
      { text: 'Custom branding', included: true },
      { text: 'Export data', included: true },
      { text: 'API access (limited)', included: false }
    ]
  },
  premium: {
    name: 'Premium',
    price: 299,
    icon: Crown,
    color: 'purple',
    features: [
      { text: 'Unlimited conversations', included: true },
      { text: 'Enterprise analytics', included: true },
      { text: '24/7 phone & email support', included: true },
      { text: 'All channels (Web, WhatsApp, SMS, Instagram, Facebook)', included: true },
      { text: 'Unlimited knowledge base', included: true },
      { text: 'All AI models including GPT-4 Turbo & Claude Opus', included: true },
      { text: 'All languages including Hawaiian Pidgin & ʻŌlelo Hawaiʻi 🌺', included: true },
      { text: 'Advanced revenue optimization', included: true },
      { text: 'Full guest intelligence suite', included: true },
      { text: 'White-label solution', included: true },
      { text: 'Unlimited API access', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'Dedicated account manager', included: true }
    ]
  }
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<any>(null)
  const [businessTier, setBusinessTier] = useState<string>('starter')
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    fetchSubscription()
    
    // Get business tier from localStorage
    const businessData = localStorage.getItem('business')
    if (businessData) {
      const business = JSON.parse(businessData)
      setBusinessTier(business.tier || 'starter')
    }
  }, [])

  const fetchSubscription = async () => {
    try {
      const businessData = localStorage.getItem('business')
      
      // Check if it's a demo account
      if (businessData) {
        const business = JSON.parse(businessData)
        if (business.email?.endsWith('@demo.com')) {
          // For demo accounts, create mock subscription data
          setSubscription({
            tier: business.tier || 'starter',
            status: 'demo',
            billingCycle: 'monthly',
            endDate: null
          })
          setLoading(false)
          return
        }
      }
      
      const response = await fetch('/api/subscription', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async (immediate: boolean = false) => {
    if (!confirm(`Are you sure you want to cancel your subscription${immediate ? ' immediately' : ' at the end of the billing period'}?`)) {
      return
    }

    setCancelling(true)
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ immediate })
      })

      if (response.ok) {
        alert('Subscription cancelled successfully')
        await fetchSubscription()
      } else {
        const error = await response.json()
        alert(`Failed to cancel subscription: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
      alert('Failed to cancel subscription')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return <LoadingState message="Loading billing information..." size="lg" />
  }

  const currentPlan = planDetails[businessTier as keyof typeof planDetails] || planDetails.starter
  const PlanIcon = currentPlan.icon

  const statusColors: any = {
    active: 'text-green-600',
    demo: 'text-blue-600',
    past_due: 'text-yellow-600',
    cancelling: 'text-orange-600',
    cancelled: 'text-red-600',
    expired: 'text-gray-600',
    suspended: 'text-red-600'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-gray-600">Manage your subscription and unlock more features</p>
      </div>

      {subscription?.warning && (
        <Alert className="border-yellow-500">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payment Issue</AlertTitle>
          <AlertDescription>
            Your payment has failed. You have until {new Date(subscription.gracePeriodEnds).toLocaleDateString()} 
            to update your payment method before your access is suspended.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Plan Card */}
      <Card className="border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg bg-${currentPlan.color}-100`}>
                <PlanIcon className={`h-6 w-6 text-${currentPlan.color}-600`} />
              </div>
              <div>
                <CardTitle className="text-2xl">{currentPlan.name} Plan</CardTitle>
                <CardDescription className="text-base">
                  ${currentPlan.price}/month • {subscription?.status === 'demo' ? 'Demo Account' : subscription?.status || 'Active'}
                </CardDescription>
              </div>
            </div>
            <Badge className={`${statusColors[subscription?.status || 'active']} text-lg px-3 py-1`}>
              {subscription?.status === 'demo' ? 'DEMO' : subscription?.status?.toUpperCase() || 'ACTIVE'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-3 rounded-lg">
              <p className="text-sm text-gray-600">Billing Cycle</p>
              <p className="font-semibold text-gray-900 capitalize">{subscription?.billingCycle || 'Monthly'}</p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <p className="text-sm text-gray-600">Next Billing</p>
              <p className="font-semibold text-gray-900">
                {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <p className="text-sm text-gray-600">Conversations Used</p>
              <p className="font-semibold text-gray-900">
                23 / {businessTier === 'premium' ? '∞' : businessTier === 'professional' ? '1000' : '100'}
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <p className="text-sm text-gray-600">Knowledge Items</p>
              <p className="font-semibold text-gray-900">
                12 / {businessTier === 'premium' ? '∞' : businessTier === 'professional' ? '500' : '50'}
              </p>
            </div>
          </div>

          {businessTier !== 'premium' && (
            <Alert className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <AlertTitle className="text-purple-900">Unlock More Features!</AlertTitle>
              <AlertDescription className="text-purple-800">
                {businessTier === 'starter' 
                  ? 'Upgrade to Professional to get 10x more conversations, revenue optimization, and multi-channel support!'
                  : 'Upgrade to Premium for unlimited everything, white-label options, and dedicated support!'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Options */}
      {businessTier !== 'premium' && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-900">
            {subscription?.status === 'demo' ? 'Choose Your Plan' : 'Upgrade Your Plan'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {businessTier === 'starter' && (
              <>
                {/* Professional Upgrade */}
                <Card className="relative hover:shadow-xl transition-shadow cursor-pointer border-2 hover:border-blue-300"
                      onClick={() => window.location.href = '/checkout?plan=professional&interval=monthly'}>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4">RECOMMENDED</Badge>
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="h-8 w-8 text-blue-600" />
                        <div>
                          <CardTitle>Professional</CardTitle>
                          <CardDescription>Perfect for growing businesses</CardDescription>
                        </div>
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">
                      $149<span className="text-sm font-normal text-gray-600">/month</span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">10x more conversations</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Revenue optimization</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Guest intelligence</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Hash className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">WhatsApp & SMS</span>
                      </div>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Upgrade to Professional
                    </Button>
                  </CardContent>
                </Card>

                {/* Premium Upgrade */}
                <Card className="relative hover:shadow-xl transition-shadow cursor-pointer border-2 hover:border-purple-300"
                      onClick={() => window.location.href = '/checkout?plan=premium&interval=monthly'}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Crown className="h-8 w-8 text-purple-600" />
                        <div>
                          <CardTitle>Premium</CardTitle>
                          <CardDescription>For serious businesses</CardDescription>
                        </div>
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">
                      $299<span className="text-sm font-normal text-gray-600">/month</span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">Unlimited everything</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Brain className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">All AI models</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">White-label ready</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">24/7 support</span>
                      </div>
                    </div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      Upgrade to Premium
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
            
            {businessTier === 'professional' && (
              <Card className="relative hover:shadow-xl transition-shadow cursor-pointer border-2 hover:border-purple-300"
                    onClick={() => window.location.href = '/checkout?plan=premium&interval=monthly'}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white px-4">UNLOCK EVERYTHING</Badge>
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Crown className="h-8 w-8 text-purple-600" />
                      <div>
                        <CardTitle>Premium</CardTitle>
                        <CardDescription>Unlimited power for your business</CardDescription>
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">
                    $299<span className="text-sm font-normal text-gray-600">/month</span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Everything in Professional, plus:</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MessageSquare className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">Unlimited conversations</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Brain className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">Claude Opus & GPT-4 Turbo</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">White-label & API access</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">Dedicated account manager</span>
                    </div>
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Upgrade to Premium
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Feature Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Compare Plans</CardTitle>
          <CardDescription>See the differences between your current plan and available upgrades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-gray-700">Features</th>
                  <th className="text-center p-3">
                    <div className={`font-medium ${businessTier === 'starter' ? 'text-green-600' : 'text-gray-500'}`}>
                      Starter
                      {businessTier === 'starter' && (
                        <div className="text-xs text-gray-500 font-normal mt-1">Current Plan</div>
                      )}
                    </div>
                  </th>
                  <th className="text-center p-3">
                    <div className={`font-medium ${businessTier === 'professional' ? 'text-blue-600' : 'text-gray-700'}`}>
                      Professional
                      {businessTier === 'professional' && (
                        <div className="text-xs text-gray-500 font-normal mt-1">Current Plan</div>
                      )}
                    </div>
                  </th>
                  <th className="text-center p-3">
                    <div className={`font-medium ${businessTier === 'premium' ? 'text-purple-600' : 'text-gray-700'}`}>
                      Premium
                      {businessTier === 'premium' && (
                        <div className="text-xs text-gray-500 font-normal mt-1">Current Plan</div>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-700">Monthly Price</td>
                  <td className="text-center p-3">$29</td>
                  <td className="text-center p-3">$149</td>
                  <td className="text-center p-3">$299</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-700">Conversations/month</td>
                  <td className="text-center p-3">100</td>
                  <td className="text-center p-3">1,000</td>
                  <td className="text-center p-3">Unlimited</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-700">Knowledge Base Items</td>
                  <td className="text-center p-3">50</td>
                  <td className="text-center p-3">500</td>
                  <td className="text-center p-3">Unlimited</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-700">AI Models</td>
                  <td className="text-center p-3">Basic</td>
                  <td className="text-center p-3">GPT-4, Claude Sonnet</td>
                  <td className="text-center p-3">All Models + Opus</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-700">Languages</td>
                  <td className="text-center p-3">6 Basic</td>
                  <td className="text-center p-3">7 + Pidgin</td>
                  <td className="text-center p-3">All + Hawaiian</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-700">Revenue Optimization</td>
                  <td className="text-center p-3"><X className="h-5 w-5 text-gray-300 mx-auto" /></td>
                  <td className="text-center p-3"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="text-center p-3"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-700">Guest Intelligence</td>
                  <td className="text-center p-3"><X className="h-5 w-5 text-gray-300 mx-auto" /></td>
                  <td className="text-center p-3"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="text-center p-3"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-700">Multi-Channel (WhatsApp, SMS)</td>
                  <td className="text-center p-3"><X className="h-5 w-5 text-gray-300 mx-auto" /></td>
                  <td className="text-center p-3"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="text-center p-3"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-700">API Access</td>
                  <td className="text-center p-3"><X className="h-5 w-5 text-gray-300 mx-auto" /></td>
                  <td className="text-center p-3">Limited</td>
                  <td className="text-center p-3">Unlimited</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-700">White Label</td>
                  <td className="text-center p-3"><X className="h-5 w-5 text-gray-300 mx-auto" /></td>
                  <td className="text-center p-3"><X className="h-5 w-5 text-gray-300 mx-auto" /></td>
                  <td className="text-center p-3"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-700">Support</td>
                  <td className="text-center p-3">Email</td>
                  <td className="text-center p-3">Priority Email</td>
                  <td className="text-center p-3">24/7 Phone & Email</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Upgrade CTA based on current tier */}
          {businessTier !== 'premium' && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {businessTier === 'starter' 
                      ? 'Unlock Revenue Optimization & Guest Intelligence'
                      : 'Get Unlimited Everything with Premium'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {businessTier === 'starter'
                      ? 'Professional plan gives you 10x more conversations and powerful revenue tools'
                      : 'Premium removes all limits and adds white-label options'}
                  </p>
                </div>
                <Button 
                  onClick={() => window.location.href = `/checkout?plan=${businessTier === 'starter' ? 'professional' : 'premium'}&interval=monthly`}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Upgrade Now
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Subscription */}
      {subscription && subscription.status !== 'cancelled' && subscription.status !== 'expired' && subscription.status !== 'demo' && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle>Cancel Subscription</CardTitle>
            <CardDescription>We're sorry to see you go</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Before you cancel</AlertTitle>
              <AlertDescription>
                You'll lose access to all premium features. Your data will be retained for 30 days.
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => handleCancelSubscription(false)}
                disabled={cancelling || subscription.cancelAtPeriodEnd}
              >
                Cancel at Period End
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleCancelSubscription(true)}
                disabled={cancelling}
              >
                Cancel Immediately
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}