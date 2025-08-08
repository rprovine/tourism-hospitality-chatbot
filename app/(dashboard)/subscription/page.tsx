'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingState } from '@/components/ui/loading-state'
import { 
  CreditCard, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  ArrowUpRight,
  Loader2,
  Shield,
  Zap,
  Crown,
  Building
} from 'lucide-react'

interface SubscriptionData {
  tier: string
  status: string
  startDate: string | null
  endDate: string | null
  cancelAtPeriodEnd: boolean
  paymentMethod: string | null
  nextBillingDate: string | null
  amount: number
  interval: string
}

const tierIcons: Record<string, any> = {
  starter: Zap,
  professional: Shield,
  premium: Crown,
  enterprise: Building
}

const tierColors: Record<string, string> = {
  starter: 'bg-green-100 text-green-800',
  professional: 'bg-blue-100 text-blue-800',
  premium: 'bg-purple-100 text-purple-800',
  enterprise: 'bg-gray-100 text-gray-800'
}

const tierPricing: Record<string, { monthly: number, yearly: number }> = {
  starter: { monthly: 29, yearly: 290 },
  professional: { monthly: 149, yearly: 1490 },
  premium: { monthly: 299, yearly: 2990 },
  enterprise: { monthly: 999, yearly: 9990 }
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelType, setCancelType] = useState<'immediate' | 'end_of_period'>('end_of_period')
  
  useEffect(() => {
    fetchSubscription()
  }, [])
  
  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem('token')
      const businessData = localStorage.getItem('business')
      
      // Check if it's a demo account
      if (businessData) {
        const business = JSON.parse(businessData)
        if (business.email?.endsWith('@demo.com')) {
          // For demo accounts, create mock subscription data
          setSubscription({
            tier: business.tier || 'starter',
            status: 'demo',
            startDate: new Date().toISOString(),
            endDate: null,
            cancelAtPeriodEnd: false,
            paymentMethod: null,
            nextBillingDate: null,
            amount: 0,
            interval: 'monthly'
          })
          setLoading(false)
          return
        }
      }
      
      const response = await fetch('/api/subscription', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Subscription API response:', data)
        console.log('Status check:', { 
          status: data.status, 
          isActive: data.status === 'active',
          isTrialing: data.status === 'trialing', 
          isTrial: data.status === 'trial',
          cancelAtPeriodEnd: data.cancelAtPeriodEnd
        })
        setSubscription(data)
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleCancelSubscription = async () => {
    setCancelling(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ immediate: cancelType === 'immediate' })
      })
      
      if (response.ok) {
        alert(cancelType === 'immediate' 
          ? 'Subscription cancelled immediately' 
          : 'Subscription will cancel at the end of the billing period')
        await fetchSubscription()
        setShowCancelModal(false)
      } else {
        alert('Failed to cancel subscription')
      }
    } catch (error) {
      console.error('Cancel error:', error)
      alert('Failed to cancel subscription')
    } finally {
      setCancelling(false)
    }
  }
  
  const handleUpgrade = (newTier: string) => {
    const interval = subscription?.interval || 'monthly'
    // For demo accounts or any tier change, go to checkout
    window.location.href = `/checkout?plan=${newTier}&interval=${interval}`
  }
  
  if (loading) {
    return <LoadingState message="Loading subscription details..." size="lg" />
  }
  
  if (!subscription) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
            <p className="text-gray-600 mb-4">You don&apos;t have an active subscription yet</p>
            <Button 
              onClick={() => window.location.href = '/checkout?plan=starter&interval=monthly'}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              Start Free Trial
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  const TierIcon = tierIcons[subscription.tier] || Zap
  const isActive = subscription.status === 'active' || subscription.status === 'trialing' || subscription.status === 'demo'
  
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
        <p className="text-gray-600 mt-1">Manage your subscription and billing</p>
      </div>
      
      {/* Demo Account Notice */}
      {subscription.status === 'demo' && subscription.tier === 'starter' && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Demo Account - Limited Features</h3>
                <p className="text-sm text-yellow-800 mb-3">
                  You&apos;re currently using a demo account with starter tier limitations. 
                  Upgrade to unlock powerful features:
                </p>
                <ul className="text-sm text-yellow-800 space-y-1 mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span><strong>Revenue Optimization:</strong> Dynamic pricing & upselling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span><strong>Guest Intelligence:</strong> Detailed profiles & insights</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span><strong>Multi-Channel:</strong> WhatsApp, SMS, Instagram</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span><strong>Advanced AI:</strong> GPT-4 and Claude Sonnet/Opus</span>
                  </li>
                </ul>
                <Button 
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  onClick={() => window.location.href = '/checkout?plan=professional&interval=monthly'}
                >
                  Start 14-Day Free Trial
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Current Plan */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${tierColors[subscription.tier]}`}>
                <TierIcon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="capitalize">{subscription.tier} Plan</CardTitle>
                <CardDescription>
                  ${tierPricing[subscription.tier]?.[subscription.interval as keyof typeof tierPricing.starter] || 0}/{subscription.interval === 'yearly' ? 'year' : 'month'}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {isActive ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                {subscription.status === 'demo' ? 'Demo Account' : subscription.status}
              </Badge>
              {(subscription.status === 'active' || subscription.status === 'trialing' || subscription.status === 'trial') && !subscription.cancelAtPeriodEnd && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                  onClick={() => setShowCancelModal(true)}
                >
                  Cancel Plan
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Billing Period</div>
              <div className="font-medium text-gray-900 capitalize">{subscription.interval}</div>
            </div>
            {subscription.startDate && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Started</div>
                <div className="font-medium text-gray-900">
                  {new Date(subscription.startDate).toLocaleDateString()}
                </div>
              </div>
            )}
            {subscription.nextBillingDate && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Next Billing</div>
                <div className="font-medium text-gray-900">
                  {new Date(subscription.nextBillingDate).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
          
          {subscription.cancelAtPeriodEnd && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Your subscription will cancel on {new Date(subscription.endDate!).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Upgrade Options - Always show for demo accounts and starter tier */}
      {(subscription.tier !== 'enterprise' && !subscription.cancelAtPeriodEnd) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {subscription.status === 'demo' ? 'Choose Your Plan' : 'Upgrade Your Plan'}
            </CardTitle>
            <CardDescription>
              {subscription.status === 'demo' 
                ? 'Start your free trial and unlock all features' 
                : 'Get more features and capabilities'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Always show Starter for comparison */}
              {subscription.tier !== 'starter' && (
                <Card className={`relative ${subscription.tier === 'starter' ? 'border-cyan-500 border-2' : ''}`}>
                  <CardContent className="p-4">
                    {subscription.tier === 'starter' && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-cyan-600 text-white">Current Plan</Badge>
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <Zap className="h-8 w-8 text-green-600" />
                      {subscription.tier !== 'starter' && (
                        <Badge variant="outline" className="text-xs">Downgrade</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold">Starter</h3>
                    <p className="text-sm text-gray-600 mb-2">100 conversations/mo</p>
                    <div className="text-2xl font-bold">$29<span className="text-sm font-normal">/mo</span></div>
                    <ul className="text-xs text-gray-600 mt-2 space-y-1">
                      <li>• Basic AI models</li>
                      <li>• Web chat only</li>
                      <li>• 50 knowledge items</li>
                    </ul>
                    {subscription.tier !== 'starter' && (
                      <Button 
                        variant="outline" 
                        className="w-full mt-3 text-xs"
                        onClick={() => handleUpgrade('starter')}
                      >
                        Switch to Starter
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* Professional Plan */}
              <Card 
                className={`relative cursor-pointer hover:shadow-lg transition-shadow ${subscription.tier === 'professional' ? 'border-blue-500 border-2' : ''}`}
                onClick={() => subscription.tier !== 'professional' && handleUpgrade('professional')}
              >
                <CardContent className="p-4">
                  {subscription.tier === 'professional' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white">Current Plan</Badge>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <Shield className="h-8 w-8 text-blue-600" />
                    {subscription.tier !== 'professional' && (
                      <ArrowUpRight className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <h3 className="font-semibold">Professional</h3>
                  <p className="text-sm text-gray-600 mb-2">1000 conversations/mo</p>
                  <div className="text-2xl font-bold">$149<span className="text-sm font-normal">/mo</span></div>
                  <ul className="text-xs text-gray-600 mt-2 space-y-1">
                    <li>• Revenue optimization</li>
                    <li>• Guest profiles</li>
                    <li>• Multi-channel</li>
                    <li>• Advanced AI models</li>
                    <li>• 500 knowledge items</li>
                  </ul>
                  {subscription.tier === 'professional' && (
                    <div className="mt-3 text-xs text-center text-gray-500">Your current plan</div>
                  )}
                </CardContent>
              </Card>
              
              {/* Premium Plan */}
              <Card 
                className={`relative cursor-pointer hover:shadow-lg transition-shadow ${subscription.tier === 'premium' ? 'border-purple-500 border-2' : ''}`}
                onClick={() => subscription.tier !== 'premium' && handleUpgrade('premium')}
              >
                <CardContent className="p-4">
                  {subscription.tier === 'premium' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-purple-600 text-white">Current Plan</Badge>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <Crown className="h-8 w-8 text-purple-600" />
                    {subscription.tier !== 'premium' && (
                      <ArrowUpRight className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <h3 className="font-semibold">Premium</h3>
                  <p className="text-sm text-gray-600 mb-2">Unlimited conversations</p>
                  <div className="text-2xl font-bold">$299<span className="text-sm font-normal">/mo</span></div>
                  <ul className="text-xs text-gray-600 mt-2 space-y-1">
                    <li>• All Professional features</li>
                    <li>• Unlimited everything</li>
                    <li>• API access</li>
                    <li>• White label options</li>
                    <li>• Priority support</li>
                  </ul>
                  {subscription.tier === 'premium' && (
                    <div className="mt-3 text-xs text-center text-gray-500">Your current plan</div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Enterprise CTA */}
            <Card className="mt-4 bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Building className="h-12 w-12 text-gray-700" />
                    <div>
                      <h3 className="text-lg font-semibold">Enterprise Solutions</h3>
                      <p className="text-sm text-gray-600 mt-1">Custom pricing, dedicated support, and tailored features for large organizations</p>
                      <ul className="text-xs text-gray-600 mt-2 space-x-4 flex flex-wrap">
                        <li>• Unlimited everything</li>
                        <li>• Custom integrations</li>
                        <li>• Dedicated account manager</li>
                        <li>• SLA guarantees</li>
                        <li>• On-premise deployment</li>
                      </ul>
                    </div>
                  </div>
                  <Button 
                    onClick={() => window.location.href = '/checkout?plan=enterprise&interval=yearly'}
                    className="bg-gray-800 hover:bg-gray-900 text-white"
                  >
                    Contact Sales
                    <ArrowUpRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}
      
      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium">Payment Method</h3>
              <p className="text-sm text-gray-600">
                {subscription.paymentMethod || 'No payment method on file'}
              </p>
            </div>
            <Button variant="outline">
              <CreditCard className="h-4 w-4 mr-2" />
              Update Payment
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium">Billing History</h3>
              <p className="text-sm text-gray-600">View all past invoices and receipts</p>
            </div>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              View History
            </Button>
          </div>
          
          {(subscription.status === 'active' || subscription.status === 'trialing' || subscription.status === 'trial') && !subscription.cancelAtPeriodEnd && (
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <h3 className="font-medium text-red-900">Cancel Subscription</h3>
                <p className="text-sm text-red-700">Stop your subscription and billing</p>
              </div>
              <Button 
                variant="outline" 
                className="border-red-500 text-red-600 hover:bg-red-50"
                onClick={() => setShowCancelModal(true)}
              >
                Cancel Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Cancel Modal */}
      {showCancelModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowCancelModal(false)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
            <Card>
              <CardHeader>
                <CardTitle>Cancel Subscription</CardTitle>
                <CardDescription>
                  Are you sure you want to cancel your subscription?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="cancelType"
                      value="end_of_period"
                      checked={cancelType === 'end_of_period'}
                      onChange={(e) => setCancelType('end_of_period')}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">Cancel at end of billing period</div>
                      <div className="text-sm text-gray-600">
                        Keep access until {subscription.nextBillingDate ? new Date(subscription.nextBillingDate).toLocaleDateString() : 'period ends'}
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="cancelType"
                      value="immediate"
                      checked={cancelType === 'immediate'}
                      onChange={(e) => setCancelType('immediate')}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">Cancel immediately</div>
                      <div className="text-sm text-gray-600">
                        Lose access right away (no refunds for unused time)
                      </div>
                    </div>
                  </label>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowCancelModal(false)}
                    disabled={cancelling}
                  >
                    Keep Subscription
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={handleCancelSubscription}
                    disabled={cancelling}
                  >
                    {cancelling ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      'Confirm Cancel'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}