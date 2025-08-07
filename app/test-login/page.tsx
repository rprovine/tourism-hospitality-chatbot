'use client'

import { useState } from 'react'

export default function TestLoginPage() {
  const [email, setEmail] = useState('premium@demo.com')
  const [password, setPassword] = useState('demo123')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    setResult('Testing login...')
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      
      if (!response) {
        setResult('No response from server')
        return
      }
      
      const text = await response.text()
      
      try {
        const data = JSON.parse(text)
        setResult(`Status: ${response.status}\n\n${JSON.stringify(data, null, 2)}`)
        
        if (response.ok && data.token) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('business', JSON.stringify(data.business))
        }
      } catch {
        setResult(`Status: ${response.status}\n\nRaw response: ${text}`)
      }
    } catch (error: any) {
      setResult(`Network Error: ${error.message}\n\nThis usually means the API endpoint is not accessible.`)
    } finally {
      setLoading(false)
    }
  }

  const testSimpleLogin = async () => {
    setLoading(true)
    setResult('Testing simple login...')
    
    try {
      const response = await fetch('/api/auth/test-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      
      if (!response) {
        setResult('No response from server')
        return
      }
      
      const text = await response.text()
      
      try {
        const data = JSON.parse(text)
        setResult(`Status: ${response.status}\n\n${JSON.stringify(data, null, 2)}`)
      } catch {
        setResult(`Status: ${response.status}\n\nRaw response: ${text}`)
      }
    } catch (error: any) {
      setResult(`Network Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testPing = async () => {
    setLoading(true)
    setResult('Testing ping...')
    
    try {
      const response = await fetch('/api/ping')
      
      if (!response) {
        setResult('No response from server')
        return
      }
      
      const text = await response.text()
      setResult(`Ping result:\nStatus: ${response.status}\nResponse: ${text}`)
    } catch (error: any) {
      setResult(`Network Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testDebug = async () => {
    setLoading(true)
    setResult('Testing debug...')
    
    try {
      const response = await fetch('/api/debug')
      
      if (!response) {
        setResult('No response from server')
        return
      }
      
      const text = await response.text()
      
      try {
        const data = JSON.parse(text)
        setResult(`Status: ${response.status}\n\n${JSON.stringify(data, null, 2)}`)
      } catch {
        setResult(`Status: ${response.status}\n\nRaw response: ${text}`)
      }
    } catch (error: any) {
      setResult(`Network Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testHealth = async () => {
    setLoading(true)
    setResult('Testing health...')
    
    try {
      const response = await fetch('/api/health')
      
      if (!response) {
        setResult('No response from server')
        return
      }
      
      const text = await response.text()
      
      try {
        const data = JSON.parse(text)
        setResult(`Status: ${response.status}\n\n${JSON.stringify(data, null, 2)}`)
      } catch {
        setResult(`Status: ${response.status}\n\nRaw response: ${text}`)
      }
    } catch (error: any) {
      setResult(`Network Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Test Page</h1>
      
      <div className="bg-yellow-50 border border-yellow-300 p-4 mb-6 rounded">
        <p className="text-sm">Testing various API endpoints to diagnose issues.</p>
        <p className="text-sm mt-2">Start with "Test Ping" - if that fails, the API routes aren't working at all.</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-6">
        <button
          onClick={testPing}
          disabled={loading}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
        >
          1. Test Ping
        </button>
        
        <button
          onClick={testDebug}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          2. Test Debug
        </button>
        
        <button
          onClick={testHealth}
          disabled={loading}
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
        >
          3. Test Health
        </button>
        
        <button
          onClick={testSimpleLogin}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          4. Test Simple Login
        </button>
        
        <button
          onClick={testLogin}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          5. Test Full Login
        </button>
      </div>
      
      <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
        <h2 className="font-bold mb-2 text-white">Result:</h2>
        <pre className="whitespace-pre-wrap">{result || 'Click a button to test...'}</pre>
      </div>
      
      <div className="mt-6 text-sm text-gray-600">
        <p>Test them in order. If Ping fails, API routes aren't working at all.</p>
        <p>If Debug fails, there might be a build issue.</p>
        <p>If Health fails, database connection is broken.</p>
      </div>
    </div>
  )
}