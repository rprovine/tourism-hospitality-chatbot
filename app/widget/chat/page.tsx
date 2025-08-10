'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import ChatWidget from '@/components/chatbot/ChatWidget'

// Force dynamic rendering for widget
export const dynamic = 'force-dynamic'

function WidgetContent() {
  const searchParams = useSearchParams()
  const businessId = searchParams.get('businessId')
  const primaryColor = searchParams.get('color') || '#0891b2'
  const [businessConfig, setBusinessConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (businessId) {
      // Fetch business configuration
      fetch(`/api/widget/chat?businessId=${businessId}`)
        .then(res => res.json())
        .then(data => {
          setBusinessConfig(data)
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to load business config:', err)
          // Use demo fallback
          setBusinessConfig({
            businessName: 'Demo Business',
            tier: 'professional',
            settings: {
              welcomeMessage: 'Aloha! How can I help you today?',
              primaryColor: primaryColor
            }
          })
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [businessId, primaryColor])
  
  if (!businessId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-6">
          <p className="text-red-600 font-semibold">Configuration Error</p>
          <p className="text-gray-600 text-sm mt-2">Business ID is required</p>
        </div>
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    )
  }
  
  return (
    <div className="h-screen w-full bg-transparent">
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
        #__next {
          height: 100vh;
        }
      `}</style>
      <ChatWidget
        tier={businessConfig?.tier || 'professional'}
        businessName={businessConfig?.businessName || 'Your Business'}
        primaryColor={businessConfig?.settings?.primaryColor || primaryColor}
        welcomeMessage={businessConfig?.settings?.welcomeMessage || 'Aloha! How can I help you today?'}
        autoOpen={true}
        initialQuestion=""
        embedded={true}
      />
    </div>
  )
}

export default function WidgetChatPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    }>
      <WidgetContent />
    </Suspense>
  )
}