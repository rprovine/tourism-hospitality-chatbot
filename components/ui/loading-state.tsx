'use client'

import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  fullHeight?: boolean
}

export function LoadingState({ 
  message = 'Loading...', 
  size = 'md',
  fullHeight = true 
}: LoadingStateProps) {
  const sizeClasses = {
    sm: {
      spinner: 'h-8 w-8',
      text: 'text-base',
      gap: 'gap-3'
    },
    md: {
      spinner: 'h-12 w-12',
      text: 'text-lg',
      gap: 'gap-4'
    },
    lg: {
      spinner: 'h-16 w-16',
      text: 'text-xl',
      gap: 'gap-5'
    }
  }

  const config = sizeClasses[size]

  return (
    <div className={`flex flex-col items-center justify-center ${fullHeight ? 'h-96' : ''} ${config.gap}`}>
      {/* Animated loading icon with gradient */}
      <div className="relative">
        <div className={`${config.spinner} rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 animate-spin`}>
          <div className="h-full w-full rounded-full border-4 border-t-transparent border-white"></div>
        </div>
        <Loader2 className={`${config.spinner} absolute inset-0 text-cyan-600 animate-pulse`} />
      </div>
      
      {/* Loading text with better visibility */}
      <p className={`${config.text} font-semibold text-gray-800 animate-pulse`}>
        {message}
      </p>
      
      {/* Loading dots animation */}
      <div className="flex gap-1">
        <div className="h-2 w-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="h-2 w-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="h-2 w-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  )
}