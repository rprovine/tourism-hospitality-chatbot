'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SUBSCRIPTION_PLANS } from '@/lib/payments/hubspot'
import { Check, ArrowRight, Loader2, ArrowLeft, X } from 'lucide-react'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [formData, setFormData] = useState({
    email: '',
    businessName: '',
    contactName: '',
    phone: ''
  })

  useEffect(() => {
    const plan = searchParams.get('plan')
    const interval = searchParams.get('interval') as 'monthly' | 'yearly' || 'monthly'
    
    if (plan) {
      setBillingInterval(interval)
      setSelectedPlan(`${plan}_${interval}`)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Create checkout session with HubSpot
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planId: selectedPlan,
          ...formData
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect to HubSpot payment page or custom quote page
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl
        } else if (data.isCustomQuote) {
          window.location.href = `/thank-you?type=quote&email=${formData.email}`
        }
      } else {
        setError(data.error || 'Failed to create checkout session')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const plan = selectedPlan ? SUBSCRIPTION_PLANS[selectedPlan] : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header with navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Subscription</h1>
          </div>
          <button
            onClick={() => router.push('/')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            {/* Billing Toggle */}
            <div className="mb-6">
              <div className="flex items-center justify-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => {
                    setBillingInterval('monthly')
                    if (selectedPlan) {
                      setSelectedPlan(selectedPlan.replace('_yearly', '_monthly'))
                    }
                  }}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                    billingInterval === 'monthly'
                      ? 'bg-white text-gray-900 shadow'
                      : 'text-gray-600'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => {
                    setBillingInterval('yearly')
                    if (selectedPlan) {
                      setSelectedPlan(selectedPlan.replace('_monthly', '_yearly'))
                    }
                  }}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                    billingInterval === 'yearly'
                      ? 'bg-white text-gray-900 shadow'
                      : 'text-gray-600'
                  }`}
                >
                  Yearly (Save 20%)
                </button>
              </div>
            </div>

            {/* Plan Selection */}
            <div className="space-y-3 mb-6">
              {Object.entries(SUBSCRIPTION_PLANS)
                .filter(([key]) => key.includes(`_${billingInterval}`))
                .map(([key, p]) => (
                  <label
                    key={key}
                    className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPlan === key
                        ? 'border-cyan-600 bg-cyan-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={key}
                      checked={selectedPlan === key}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                      className="sr-only"
                    />
                    <div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{p.name}</h3>
                          <p className="text-sm text-gray-600">
                            {p.tier === 'enterprise' ? 'Starting at' : ''} ${p.price}/{p.interval === 'yearly' ? 'year' : 'month'}
                          </p>
                        </div>
                        {selectedPlan === key && (
                          <Check className="h-5 w-5 text-cyan-600" />
                        )}
                      </div>
                    </div>
                  </label>
                ))}
            </div>

            {/* Features */}
            {plan && (
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Included Features:</h3>
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Checkout Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="your@business.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Your Hotel or Resort"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Trial/Guarantee Information Banner */}
              {plan && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">
                        {selectedPlan.startsWith('premium') || selectedPlan.startsWith('enterprise') 
                          ? '30-Day Money-Back Guarantee' 
                          : '14-Day Free Trial'}
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        {selectedPlan.startsWith('premium') || selectedPlan.startsWith('enterprise')
                          ? 'Full refund within 30 days if not satisfied. Contact support for refund.'
                          : 'Try risk-free for 14 days. Cancel anytime, no questions asked.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !selectedPlan}
                className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-cyan-700 hover:to-cyan-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {selectedPlan.startsWith('premium') || selectedPlan.startsWith('enterprise') 
                      ? 'Complete Purchase' 
                      : 'Start Free Trial'}
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors underline"
                >
                  ← Back to previous page
                </button>
                <span className="text-gray-400">|</span>
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors underline"
                >
                  Cancel and return home
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                {selectedPlan.startsWith('premium') || selectedPlan.startsWith('enterprise')
                  ? 'Payment required. 30-day money-back guarantee.'
                  : 'No payment required for 14 days. Cancel anytime.'}<br/>
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>

            {/* Help Section */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <strong>Email:</strong>{' '}
                  <a href="mailto:support@lenilani.com" className="text-cyan-600 hover:underline">
                    support@lenilani.com
                  </a>
                </p>
                <p>
                  <strong>Phone:</strong>{' '}
                  <a href="tel:+1-800-555-0123" className="text-cyan-600 hover:underline">
                    +1 (800) 555-0123
                  </a>
                </p>
                <p className="text-xs">
                  Our sales team is available Mon-Fri 9AM-6PM EST
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white py-12 flex items-center justify-center">
        <div className="text-gray-500">Loading checkout...</div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}