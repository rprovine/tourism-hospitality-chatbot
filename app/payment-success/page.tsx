'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, ArrowRight, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [copied, setCopied] = useState(false)
  const tier = searchParams.get('tier') || 'professional'
  const businessId = searchParams.get('businessId') || 'your-business-id'
  
  const embedCode = `<script>
  (function() {
    var w = window;
    var d = document;
    var s = d.createElement('script');
    s.src = '${process.env.NEXT_PUBLIC_APP_URL || 'https://app.lenilani.com'}/widget.js';
    s.async = true;
    s.setAttribute('data-business-id', '${businessId}');
    s.setAttribute('data-position', 'bottom-right');
    d.head.appendChild(s);
  })();
</script>`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    // Trigger celebration animation
    const timer = setTimeout(() => {
      // Could add confetti here
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const isInstantDeploy = tier === 'starter' || tier === 'professional'

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
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
            <CheckCircle className="h-20 w-20 text-green-600 mb-4" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Successful! 🎉
          </h1>
          <p className="text-xl text-gray-700">
            Welcome to LeniLani AI - Your {tier} plan is now active
          </p>
        </div>

        {isInstantDeploy ? (
          <>
            <Card className="mb-6 border-2 border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle>Your Chatbot is Ready!</CardTitle>
                <CardDescription>
                  Copy and paste this code into your website to activate your AI assistant immediately
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="bg-gray-900 rounded-lg p-4 relative">
                  <pre className="text-green-400 text-sm overflow-x-auto">
                    <code>{embedCode}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2"
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Next Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Paste the widget code on your website</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Customize your welcome message</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Add your business Q&As</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Test the chat on your site</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Plan Includes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {tier === 'starter' && (
                      <>
                        <li>• 1,000 conversations/month</li>
                        <li>• Basic analytics</li>
                        <li>• Email support</li>
                        <li>• 50 knowledge base items</li>
                      </>
                    )}
                    {tier === 'professional' && (
                      <>
                        <li>• Unlimited conversations</li>
                        <li>• 2 language support</li>
                        <li>• API access</li>
                        <li>• Priority support</li>
                      </>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card className="mb-6 border-2 border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle>Your Premium Setup Has Begun!</CardTitle>
              <CardDescription>
                Our team will contact you within 24 hours to begin your custom implementation
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <p className="font-semibold">Onboarding Call</p>
                    <p className="text-sm text-gray-600">Within 24 hours - Review your requirements</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <p className="font-semibold">Custom AI Training</p>
                    <p className="text-sm text-gray-600">Day 2 - Train AI on your specific data</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <p className="font-semibold">Integration & Testing</p>
                    <p className="text-sm text-gray-600">Day 3 - Connect systems and test thoroughly</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">✓</div>
                  <div>
                    <p className="font-semibold">Go Live!</p>
                    <p className="text-sm text-gray-600">Your premium AI assistant is ready</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4 justify-center">
          <Button
            size="lg"
            className="bg-cyan-600 hover:bg-cyan-700"
            onClick={() => router.push('/admin')}
          >
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push('/admin/knowledge-base')}
          >
            Setup Knowledge Base
          </Button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-8">
          Need help? Contact support at support@lenilani.com or call 1-800-ALOHA-AI
        </p>
      </motion.div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payment confirmation...</p>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  )
}