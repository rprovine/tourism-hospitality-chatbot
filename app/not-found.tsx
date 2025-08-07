import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Bot } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cyan-50 to-white">
      <div className="text-center">
        <Bot className="h-16 w-16 text-cyan-700 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">404 - Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/">
          <Button className="bg-cyan-700 hover:bg-cyan-800 text-white">
            Go back home
          </Button>
        </Link>
      </div>
    </div>
  )
}