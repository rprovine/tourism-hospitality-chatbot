'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  Loader2, 
  AlertCircle, 
  Gift, 
  Calendar,
  Download,
  MessageSquare,
  Shield,
  Zap,
  Crown
} from 'lucide-react'

interface CancellationModalProps {
  isOpen: boolean
  onClose: () => void
  subscription: {
    tier: string
    nextBillingDate: string | null
    amount: number
    interval: string
  }
  onCancel: (type: 'immediate' | 'end_of_period', reason?: string) => Promise<void>
}

const retentionOffers = {
  starter: {
    discount: 50,
    duration: 2,
    message: "Stay with us! Get 50% off for the next 2 months"
  },
  professional: {
    discount: 30,
    duration: 3,
    message: "We value your business! Enjoy 30% off for 3 months"
  },
  premium: {
    discount: 25,
    duration: 3,
    message: "As a premium member, get 25% off for 3 months plus priority support"
  }
}

const cancellationReasons = [
  "Too expensive",
  "Not using enough",
  "Missing features",
  "Found alternative solution",
  "Technical issues",
  "Poor customer support",
  "Business closing/changing",
  "Other"
]

export default function CancellationModal({ 
  isOpen, 
  onClose, 
  subscription, 
  onCancel 
}: CancellationModalProps) {
  const [step, setStep] = useState<'reason' | 'offer' | 'confirm'>('reason')
  const [cancelType, setCancelType] = useState<'immediate' | 'end_of_period'>('end_of_period')
  const [selectedReason, setSelectedReason] = useState('')
  const [additionalFeedback, setAdditionalFeedback] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [acceptedOffer, setAcceptedOffer] = useState(false)
  const [exportingData, setExportingData] = useState(false)

  if (!isOpen) return null

  const retention = retentionOffers[subscription.tier as keyof typeof retentionOffers]
  const discountedPrice = subscription.amount * (1 - (retention?.discount || 0) / 100)

  const handleExportData = async () => {
    setExportingData(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/export/data', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `data-export-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export data. Please contact support.')
    } finally {
      setExportingData(false)
    }
  }

  const handleAcceptOffer = async () => {
    setAcceptedOffer(true)
    // Apply the retention discount
    alert(`Great! We've applied ${retention?.discount}% off for the next ${retention?.duration} months.`)
    onClose()
  }

  const handleFinalCancel = async () => {
    setCancelling(true)
    try {
      const feedbackData = selectedReason + (additionalFeedback ? `: ${additionalFeedback}` : '')
      await onCancel(cancelType, feedbackData)
    } finally {
      setCancelling(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 'reason':
        return (
          <>
            <CardHeader>
              <CardTitle>We're sorry to see you go</CardTitle>
              <CardDescription>
                Help us improve by telling us why you're cancelling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {cancellationReasons.map((reason) => (
                  <label
                    key={reason}
                    className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
              
              {selectedReason && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional feedback (optional)
                  </label>
                  <Textarea
                    value={additionalFeedback}
                    onChange={(e) => setAdditionalFeedback(e.target.value)}
                    placeholder="Tell us more about your experience..."
                    rows={3}
                  />
                </div>
              )}
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                >
                  Keep Subscription
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setStep('offer')}
                  disabled={!selectedReason}
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </>
        )
        
      case 'offer':
        return (
          <>
            <CardHeader>
              <CardTitle>Wait! We have a special offer for you</CardTitle>
              <CardDescription>
                {retention?.message}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <Gift className="h-12 w-12 text-cyan-600" />
                  <Badge className="bg-red-500 text-white text-lg px-3 py-1">
                    {retention?.discount}% OFF
                  </Badge>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Exclusive Retention Offer
                </h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Original price:</span>
                    <span className="line-through text-gray-400">
                      ${subscription.amount}/{subscription.interval}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Your price:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${discountedPrice.toFixed(2)}/{subscription.interval}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Valid for the next {retention?.duration} months
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>Keep all your current features</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-green-600" />
                    <span>Priority support included</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span>Cancel anytime, no questions asked</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep('confirm')}
                >
                  No thanks, continue cancelling
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleAcceptOffer}
                >
                  Accept Offer & Stay
                </Button>
              </div>
            </CardContent>
          </>
        )
        
      case 'confirm':
        return (
          <>
            <CardHeader>
              <CardTitle>Final Cancellation Confirmation</CardTitle>
              <CardDescription>
                Choose how you'd like to cancel your subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Data Export Option */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Download className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">Export Your Data</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Download all your knowledge base, conversations, and settings before cancelling
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportData}
                      disabled={exportingData}
                    >
                      {exportingData ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Export All Data
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Cancellation Type Selection */}
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
              
              {/* Warning for immediate cancellation */}
              {cancelType === 'immediate' && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-yellow-900">
                      You'll lose access immediately
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      No refunds will be provided for the remaining time in your billing period.
                    </p>
                  </div>
                </Alert>
              )}
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep('offer')}
                >
                  Back to Offer
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={handleFinalCancel}
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    'Confirm Cancellation'
                  )}
                </Button>
              </div>
            </CardContent>
          </>
        )
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <Card>
          {renderStep()}
        </Card>
      </div>
    </>
  )
}