'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Check, X } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function BillingPage() {
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
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
    return <div className="p-8">Loading...</div>
  }

  const statusColors: any = {
    active: 'text-green-600',
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
        <p className="text-gray-600">Manage your subscription and billing information</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>Your subscription details and status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Plan</p>
              <p className="font-semibold capitalize text-gray-900">{subscription?.tier || 'Starter'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className={`font-semibold capitalize ${statusColors[subscription?.status || 'active']}`}>
                {subscription?.status || 'Active'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Billing Cycle</p>
              <p className="font-semibold capitalize text-gray-900">{subscription?.billingCycle || 'Monthly'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Next Billing Date</p>
              <p className="font-semibold text-gray-900">
                {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          {subscription?.cancelAtPeriodEnd && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Subscription Ending</AlertTitle>
              <AlertDescription>
                Your subscription will end on {new Date(subscription.endDate).toLocaleDateString()}.
                You will lose access to premium features after this date.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
          <CardDescription>What's included in your current plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {getPlanFeatures(subscription?.tier || 'starter').map((feature: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {subscription && subscription.status !== 'cancelled' && subscription.status !== 'expired' && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle>Cancel Subscription</CardTitle>
            <CardDescription>Cancel your subscription</CardDescription>
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

function getPlanFeatures(tier: string) {
  const features: any = {
    starter: [
      '100 conversations/month',
      'Basic analytics',
      'Email support',
      'Standard response time'
    ],
    professional: [
      '1,000 conversations/month',
      'Advanced analytics',
      'Priority email support',
      'Custom branding',
      'API access (100 calls/day)',
      'Webhook integration'
    ],
    premium: [
      'Unlimited conversations',
      'Real-time analytics',
      '24/7 phone & email support',
      'White-label solution',
      'Unlimited API access',
      'Custom integrations',
      'Dedicated account manager'
    ]
  }
  
  return features[tier] || features.starter
}