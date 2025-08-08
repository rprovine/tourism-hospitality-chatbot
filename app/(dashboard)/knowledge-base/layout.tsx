'use client'

import { useEffect, useState } from 'react'
import { getTierLimit } from '@/lib/tierRestrictions'

export default function KnowledgeBaseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [tier, setTier] = useState<string>('starter')
  
  useEffect(() => {
    const businessData = localStorage.getItem('business')
    if (businessData) {
      const business = JSON.parse(businessData)
      setTier(business.tier || 'starter')
    }
  }, [])

  // Knowledge base is available to all tiers, just with different limits
  return (
    <>
      {children}
    </>
  )
}