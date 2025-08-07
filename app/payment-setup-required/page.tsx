'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AlertCircle } from 'lucide-react'

function PaymentSetupContent() {
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Setup Required</h1>
        <p className="text-gray-600 mb-6">
          Payment links haven't been configured yet for the {plan?.replace('_', ' ')} plan.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
          <p className="text-sm font-semibold text-gray-900 mb-2">To complete setup:</p>
          <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
            <li>Create payment links in HubSpot</li>
            <li>Copy the payment link URLs</li>
            <li>Update /lib/payments/payment-links.ts</li>
            <li>Deploy the changes</li>
          </ol>
        </div>
        <button
          onClick={() => window.history.back()}
          className="mt-6 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  )
}

export default function PaymentSetupRequired() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <PaymentSetupContent />
    </Suspense>
  )
}