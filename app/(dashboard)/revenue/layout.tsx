'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function RevenueLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    const businessData = localStorage.getItem('business')
    if (businessData) {
      const business = JSON.parse(businessData)
      const tier = business.tier || 'starter'
      
      // Block access for starter tier
      if (tier === 'starter') {
        // Keep them on the page to show upgrade message
        return
      }
    }
  }, [])

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
            <CardTitle className="text-2xl">Revenue Optimization</CardTitle>
            <CardDescription className="mt-2">
              This feature is available in Professional and Premium plans
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-cyan-600" />
                What you'll get with Revenue Optimization:
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Dynamic pricing recommendations</li>
                <li>• Upselling and cross-selling automation</li>
                <li>• Cart abandonment recovery</li>
                <li>• Revenue analytics and insights</li>
                <li>• AI-powered pricing optimization</li>
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