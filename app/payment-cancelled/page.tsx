'use client'

import { useRouter } from 'next/navigation'
import { XCircle, ArrowLeft, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'

export default function PaymentCancelledPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex"
          >
            <XCircle className="h-20 w-20 text-red-600 mb-4" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Cancelled
          </h1>
          <p className="text-xl text-gray-700">
            No charges were made to your account
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Why Choose LeniLani AI?</CardTitle>
            <CardDescription>
              Join hundreds of Hawaiian businesses already transforming their customer experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="text-green-600">✓</div>
                <div>
                  <p className="font-semibold">Instant Setup</p>
                  <p className="text-sm text-gray-600">Start chatting with guests in minutes, not days</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-green-600">✓</div>
                <div>
                  <p className="font-semibold">24/7 Availability</p>
                  <p className="text-sm text-gray-600">Never miss a booking or guest inquiry again</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-green-600">✓</div>
                <div>
                  <p className="font-semibold">14-Day Free Trial</p>
                  <p className="text-sm text-gray-600">Try it risk-free, cancel anytime</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-green-600">✓</div>
                <div>
                  <p className="font-semibold">No Setup Fees</p>
                  <p className="text-sm text-gray-600">Just one simple monthly price</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-2">
            💡 Did you know?
          </h3>
          <p className="text-gray-700 text-sm">
            Businesses using AI chatbots see an average 67% reduction in customer service costs 
            and a 24% increase in customer satisfaction scores.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            size="lg"
            className="bg-cyan-600 hover:bg-cyan-700"
            onClick={() => router.push('/register')}
          >
            Try Again
            <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push('/')}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            View Demo
          </Button>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-600 mb-2">
            Having issues with payment? We're here to help!
          </p>
          <p className="text-sm">
            <a href="mailto:support@lenilani.com" className="text-cyan-600 hover:underline">
              support@lenilani.com
            </a>
            {' or call '}
            <a href="tel:1-800-ALOHA-AI" className="text-cyan-600 hover:underline">
              1-800-ALOHA-AI
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}