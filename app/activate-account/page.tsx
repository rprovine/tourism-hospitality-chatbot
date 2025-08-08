'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

export default function ActivateAccountPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleActivate = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // First check if account exists and needs activation
      const checkResponse = await fetch(`/api/auth/activate?email=${encodeURIComponent(email)}`)
      const checkData = await checkResponse.json()

      if (!checkResponse.ok) {
        setError(checkData.error || 'Account not found')
        setLoading(false)
        return
      }

      if (checkData.activated) {
        setResult({
          alreadyActivated: true,
          message: 'Your account is already activated. You can login with your existing password.'
        })
        setLoading(false)
        return
      }

      // Activate the account
      const response = await fetch('/api/auth/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to activate account')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Activate Your Account</CardTitle>
          <CardDescription>
            Enter your email address to activate your LeniLani AI account and receive login credentials.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleActivate()}
              disabled={loading}
              className="text-gray-900"
            />
          </div>

          <Button
            onClick={handleActivate}
            disabled={loading || !email}
            className="w-full bg-cyan-600 hover:bg-cyan-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Activating...
              </>
            ) : (
              'Activate Account'
            )}
          </Button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className={`${result.alreadyActivated ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'} border rounded-lg p-4`}>
              <div className="flex items-start gap-2">
                <CheckCircle className={`h-5 w-5 ${result.alreadyActivated ? 'text-blue-600' : 'text-green-600'} mt-0.5`} />
                <div className="space-y-2 flex-1">
                  {result.alreadyActivated ? (
                    <>
                      <p className="text-sm font-semibold text-blue-900">Already Activated</p>
                      <p className="text-sm text-blue-700">{result.message}</p>
                      <Button
                        size="sm"
                        className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
                        onClick={() => window.location.href = '/login'}
                      >
                        Go to Login
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-green-900">Account Activated Successfully!</p>
                      <div className="bg-white rounded p-3 space-y-1">
                        <p className="text-xs text-gray-600">Your login credentials:</p>
                        <p className="text-sm"><strong>Email:</strong> {email}</p>
                        <p className="text-sm">
                          <strong>Temporary Password:</strong>{' '}
                          <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                            {result.tempPassword}
                          </code>
                        </p>
                      </div>
                      <p className="text-xs text-gray-600">
                        ⚠️ Please save this password and change it after logging in.
                      </p>
                      <p className="text-xs text-gray-600">
                        📧 We've also sent these credentials to your email.
                      </p>
                      <Button
                        size="sm"
                        className="w-full mt-2 bg-green-600 hover:bg-green-700"
                        onClick={() => window.open(result.loginUrl || '/login', '_blank')}
                      >
                        Login Now →
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="text-center text-sm text-gray-600 pt-4 border-t">
            <p>Need help? Contact support@lenilani.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}