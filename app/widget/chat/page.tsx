'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import ChatWidget from '@/components/chatbot/ChatWidget'

// Force dynamic rendering for widget
export const dynamic = 'force-dynamic'

function WidgetContent() {
  const searchParams = useSearchParams()
  const businessId = searchParams.get('businessId')
  const primaryColor = searchParams.get('color') || '#0891b2'
  
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
  
  // For production, you would fetch the business details from the database
  // For now, we'll use defaults
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
        tier="professional" // This should be fetched based on businessId
        businessName="Your Business"
        primaryColor={primaryColor}
        welcomeMessage="Aloha! How can I help you today?"
        autoOpen={true}
        initialQuestion=""
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