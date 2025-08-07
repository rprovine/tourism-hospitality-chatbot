'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CreditCard, Shield, CheckCircle } from 'lucide-react'

interface HubSpotCheckoutProps {
  planId: string
  planName: string
  price: number
  businessId: string
  businessEmail: string
  businessName: string
}

export default function HubSpotCheckout({
  planId,
  planName,
  price,
  businessId,
  businessEmail,
  businessName
}: HubSpotCheckoutProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessId,
          planId,
          email: businessEmail,
          businessName
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const data = await response.json()

      if (data.isCustomQuote) {
        // For enterprise plans, redirect to contact form
        router.push(data.checkoutUrl)
      } else {
        // Redirect to HubSpot payment page
        window.location.href = data.checkoutUrl
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError('Failed to start checkout. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Complete Your Subscription
      </h3>

      <div className="border rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Plan</span>
          <span className="font-semibold text-gray-900">{planName}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Billing Cycle</span>
          <span className="font-semibold text-gray-900">Monthly</span>
        </div>
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-cyan-700">
              ${price}/month
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Shield className="h-4 w-4 text-green-600" />
          <span>Secure payment powered by HubSpot</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CreditCard className="h-4 w-4 text-green-600" />
          <span>All major credit cards accepted</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span>Cancel anytime from your dashboard</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-cyan-700 text-white font-semibold py-3 px-4 rounded-lg hover:bg-cyan-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
            Processing...
          </>
        ) : (
          <>
            Proceed to Payment
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        By subscribing, you agree to our{' '}
        <a href="/terms" className="text-cyan-700 hover:underline">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="text-cyan-700 hover:underline">
          Privacy Policy
        </a>
      </p>
    </div>
  )
}