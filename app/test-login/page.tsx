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
      
      const data = await response.json()
      
      setResult(JSON.stringify(data, null, 2))
      
      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('business', JSON.stringify(data.business))
      }
    } catch (error: any) {
      setResult(`Error: ${error.message}`)
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
      
      const data = await response.json()
      
      setResult(JSON.stringify(data, null, 2))
    } catch (error: any) {
      setResult(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testPing = async () => {
    setLoading(true)
    setResult('Testing ping...')
    
    try {
      const response = await fetch('/api/ping')
      const text = await response.text()
      setResult(`Ping result: ${text}`)
    } catch (error: any) {
      setResult(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testDebug = async () => {
    setLoading(true)
    setResult('Testing debug...')
    
    try {
      const response = await fetch('/api/debug')
      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error: any) {
      setResult(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Login Page</h1>
      
      <div className="space-y-4 mb-6">
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
      
      <div className="flex gap-2 mb-6">
        <button
          onClick={testPing}
          disabled={loading}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
        >
          Test Ping
        </button>
        
        <button
          onClick={testDebug}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Test Debug
        </button>
        
        <button
          onClick={testSimpleLogin}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          Test Simple Login
        </button>
        
        <button
          onClick={testLogin}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Test Full Login
        </button>
      </div>
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Result:</h2>
        <pre className="whitespace-pre-wrap text-sm">{result}</pre>
      </div>
    </div>
  )
}