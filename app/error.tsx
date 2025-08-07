'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cyan-50 to-white">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong!</h2>
        <p className="text-gray-600 mb-6">We apologize for the inconvenience.</p>
        <Button
          onClick={() => reset()}
          className="bg-cyan-700 hover:bg-cyan-800 text-white"
        >
          Try again
        </Button>
      </div>
    </div>
  )
}