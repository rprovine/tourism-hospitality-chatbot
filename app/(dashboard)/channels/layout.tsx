'use client'

// import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, Hash } from 'lucide-react'
import Link from 'next/link'

export default function ChannelsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user has access
  const businessData = typeof window !== 'undefined' ? localStorage.getItem('business') : null
  const business = businessData ? JSON.parse(businessData) : null
  const tier = business?.tier || 'starter'
  
  if (tier === 'starter') {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="max-w-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gray-100 rounded-full">
                <Lock className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">Multi-Channel Integration</CardTitle>
            <CardDescription className="mt-2">
              This feature is available in Professional and Premium plans
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Hash className="h-5 w-5 text-cyan-600" />
                What you&apos;ll get with Multi-Channel:
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• WhatsApp Business integration</li>
                <li>• SMS/Twilio messaging</li>
                <li>• Instagram Direct Messages (Premium)</li>
                <li>• Facebook Messenger (Premium)</li>
                <li>• Unified inbox for all channels</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Link href="/subscription" className="flex-1">
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                  Upgrade Now
                </Button>
              </Link>
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">
                  Go Back
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}