'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [subscriptionData, setSubscriptionData] = useState<any>(null)

  useEffect(() => {
    // Get subscription details from URL params or session
    const plan = searchParams.get('plan')
    const tier = searchParams.get('tier')
    
    // Simulate loading subscription data
    setTimeout(() => {
      setSubscriptionData({
        plan: plan || 'Professional',
        tier: tier || 'professional',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
      })
      setLoading(false)
    }, 1500)
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your subscription...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 rounded-full p-4">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to LeniLani AI!
            </h1>
            
            <p className="text-lg text-gray-700 mb-8">
              Your {subscriptionData?.plan} subscription is now active
            </p>

            <div className="bg-cyan-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                What's Next?
              </h2>
              <div className="text-left space-y-3">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-cyan-700 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Set up your chatbot</p>
                    <p className="text-sm text-gray-600">Customize colors, welcome message, and branding</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-cyan-700 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Add your knowledge base</p>
                    <p className="text-sm text-gray-600">Upload FAQs and business information</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-cyan-700 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Install the widget</p>
                    <p className="text-sm text-gray-600">Add the chat widget to your website</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <p className="text-sm text-gray-600 mb-4">
                Your subscription will renew on <strong>{subscriptionData?.nextBillingDate}</strong>
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center px-6 py-3 bg-cyan-700 text-white font-semibold rounded-lg hover:bg-cyan-800 transition-colors"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/admin/settings"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Account Settings
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Need help getting started?{' '}
              <Link href="/support" className="text-cyan-700 hover:underline font-medium">
                Contact our support team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}