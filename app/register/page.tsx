'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Bot, Hotel, MapPin, Home, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    businessName: '',
    businessType: 'hotel',
    tier: 'starter'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Store token
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('business', JSON.stringify(data.business))

      // Redirect to admin dashboard
      router.push('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 bg-cyan-100 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6 text-cyan-700" />
              </div>
            </div>
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <CardDescription>
              Start your 14-day free trial of LeniLani Hospitality AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Aloha Resort"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, businessType: 'hotel' })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.businessType === 'hotel'
                        ? 'border-cyan-600 bg-cyan-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Hotel className="h-5 w-5 mx-auto mb-1" />
                    <div className="text-xs font-medium">Hotel</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, businessType: 'tour_operator' })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.businessType === 'tour_operator'
                        ? 'border-cyan-600 bg-cyan-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <MapPin className="h-5 w-5 mx-auto mb-1" />
                    <div className="text-xs font-medium">Tours</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, businessType: 'vacation_rental' })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.businessType === 'vacation_rental'
                        ? 'border-cyan-600 bg-cyan-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Home className="h-5 w-5 mx-auto mb-1" />
                    <div className="text-xs font-medium">Rental</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="you@business.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Minimum 8 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Your Plan
                </label>
                <div className="space-y-2">
                  <div
                    onClick={() => setFormData({ ...formData, tier: 'starter' })}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.tier === 'starter'
                        ? 'border-cyan-600 bg-cyan-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">Starter</div>
                        <div className="text-sm text-gray-600">$299/month after trial</div>
                      </div>
                      <div className="text-2xl font-bold">$299</div>
                    </div>
                  </div>
                  <div
                    onClick={() => setFormData({ ...formData, tier: 'professional' })}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.tier === 'professional'
                        ? 'border-cyan-600 bg-cyan-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          Professional
                          <span className="bg-cyan-600 text-white text-xs px-2 py-0.5 rounded-full">Popular</span>
                        </div>
                        <div className="text-sm text-gray-600">$899/month after trial</div>
                      </div>
                      <div className="text-2xl font-bold">$899</div>
                    </div>
                  </div>
                  <div
                    onClick={() => setFormData({ ...formData, tier: 'premium' })}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.tier === 'premium'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          Premium <span className="text-lg">✨</span>
                        </div>
                        <div className="text-sm text-gray-600">$2,499/month after trial</div>
                      </div>
                      <div className="text-2xl font-bold">$2,499</div>
                    </div>
                  </div>
                  <div
                    onClick={() => setFormData({ ...formData, tier: 'enterprise' })}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.tier === 'enterprise'
                        ? 'border-gray-800 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          Enterprise <span className="text-lg">🏢</span>
                        </div>
                        <div className="text-sm text-gray-600">Custom pricing</div>
                      </div>
                      <div className="text-xl font-bold">Custom</div>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-cyan-700 hover:bg-cyan-800 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Start Free Trial'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="text-cyan-700 hover:underline font-medium">
                  Sign in
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}