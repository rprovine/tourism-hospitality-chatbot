'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Key, 
  Copy, 
  Check, 
  RefreshCw, 
  AlertCircle, 
  Code,
  Book,
  Lock,
  Zap,
  Globe,
  MessageSquare,
  Database
} from 'lucide-react'

export default function ApiAccessPage() {
  const router = useRouter()
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [business, setBusiness] = useState<any>(null)
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    fetchApiKey()
  }, [])

  const fetchApiKey = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/api-key', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setApiKey(data.apiKey)
        setBusiness(data.business)
      }
    } catch (error) {
      console.error('Failed to fetch API key:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateApiKey = async () => {
    setGenerating(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/api-key', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setApiKey(data.apiKey)
        setShowKey(true)
      }
    } catch (error) {
      console.error('Failed to generate API key:', error)
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const maskApiKey = (key: string) => {
    if (showKey) return key
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`
  }

  // Check if tier has API access
  const hasApiAccess = business?.tier !== 'starter'

  if (!hasApiAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="container mx-auto p-6 max-w-4xl">
        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-orange-600" />
              API Access Not Available
            </CardTitle>
            <CardDescription>
              Your Starter plan doesn't include API access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                Upgrade to Professional or higher to unlock API access and integrate your chatbot with external systems.
              </p>
              
              <div className="bg-white rounded-lg p-4 space-y-3">
                <h3 className="font-semibold">With API Access you can:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-cyan-600 mt-1" />
                    <span className="text-sm">Send messages programmatically</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Database className="h-4 w-4 text-cyan-600 mt-1" />
                    <span className="text-sm">Manage knowledge base via API</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-cyan-600 mt-1" />
                    <span className="text-sm">Build custom integrations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Globe className="h-4 w-4 text-cyan-600 mt-1" />
                    <span className="text-sm">Connect to your existing systems</span>
                  </li>
                </ul>
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
                onClick={() => router.push('/admin/billing')}
              >
                Upgrade to Professional
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">API Access</h1>
        <p className="text-gray-600">
          Integrate your chatbot with external systems using our REST API
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Key Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Your API Key
            </CardTitle>
            <CardDescription>
              Use this key to authenticate API requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apiKey ? (
                <>
                  <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 break-all">
                        {maskApiKey(apiKey)}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowKey(!showKey)}
                          className="text-gray-400 hover:text-white"
                        >
                          {showKey ? 'Hide' : 'Show'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={copyToClipboard}
                          className="text-gray-400 hover:text-white"
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-semibold">Keep your API key secure</p>
                        <p>Never share it publicly or commit it to version control</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={generateApiKey}
                    disabled={generating}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
                    Regenerate Key
                  </Button>
                  
                  <p className="text-xs text-gray-500">
                    Regenerating will invalidate your current key
                  </p>
                </>
              ) : (
                <>
                  <div className="text-center py-8">
                    <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      No API key generated yet
                    </p>
                    <Button
                      onClick={generateApiKey}
                      disabled={generating}
                      className="bg-cyan-600 hover:bg-cyan-700"
                    >
                      {generating ? 'Generating...' : 'Generate API Key'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rate Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Rate Limits
            </CardTitle>
            <CardDescription>
              Your {business?.tier} plan limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Requests per hour</span>
                  <span className="font-semibold">
                    {business?.tier === 'professional' ? '1,000' : 
                     business?.tier === 'premium' ? '5,000' : 
                     'Unlimited'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Concurrent requests</span>
                  <span className="font-semibold">
                    {business?.tier === 'professional' ? '10' : 
                     business?.tier === 'premium' ? '50' : 
                     'Unlimited'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Max response size</span>
                  <span className="font-semibold">10 MB</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-600">Webhook support</span>
                  <span className="font-semibold">
                    {business?.tier === 'enterprise' ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Start Guide */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            Quick Start
          </CardTitle>
          <CardDescription>
            Get started with the LeniLani API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Example: Send a message */}
            <div>
              <h3 className="font-semibold mb-2">1. Send a Chat Message</h3>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-300">
{`curl -X POST https://app.lenilani.com/api/v1/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "What are your pool hours?",
    "sessionId": "unique-session-id",
    "language": "en"
  }'`}
                </pre>
              </div>
            </div>

            {/* Example: Manage knowledge base */}
            <div>
              <h3 className="font-semibold mb-2">2. Add Knowledge Base Item</h3>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-300">
{`curl -X POST https://app.lenilani.com/api/v1/knowledge-base \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "question": "What time is breakfast?",
    "answer": "Breakfast is served from 6:30 AM to 10:30 AM",
    "category": "dining",
    "keywords": "breakfast,dining,restaurant,hours"
  }'`}
                </pre>
              </div>
            </div>

            {/* Example: Get analytics */}
            <div>
              <h3 className="font-semibold mb-2">3. Get Analytics</h3>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-300">
{`curl -X GET https://app.lenilani.com/api/v1/analytics \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -G -d "period=7d"`}
                </pre>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                variant="outline"
                onClick={() => router.push('/docs/api')}
              >
                <Book className="h-4 w-4 mr-2" />
                View Full Documentation
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open('https://github.com/lenilani/api-examples', '_blank')}
              >
                <Code className="h-4 w-4 mr-2" />
                Example Code
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}