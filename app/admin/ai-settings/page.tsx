'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Sparkles, Save, AlertCircle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AISettingsPage() {
  const [settings, setSettings] = useState({
    useClaudeAPI: false,
    apiKey: '',
    modelPreference: 'haiku',
    temperature: 0.7,
    maxTokens: 200,
    customPrompt: '',
    knowledgeBaseEnabled: true
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage('')
    
    try {
      // In production, this would save to database
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaveMessage('Settings saved successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      setSaveMessage('Error saving settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Configuration</h1>
          <p className="text-gray-600">Customize your chatbot's AI capabilities and behavior</p>
        </motion.div>

        <div className="space-y-6">
          {/* Claude API Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-cyan-600" />
                Claude API Integration
              </CardTitle>
              <CardDescription>
                Enable Claude AI for more sophisticated, context-aware responses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Enable Claude API
                </label>
                <button
                  onClick={() => setSettings({ ...settings, useClaudeAPI: !settings.useClaudeAPI })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.useClaudeAPI ? 'bg-cyan-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.useClaudeAPI ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {settings.useClaudeAPI && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={settings.apiKey}
                      onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                      placeholder="sk-ant-api..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Get your API key from{' '}
                      <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline">
                        console.anthropic.com
                      </a>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model Preference
                    </label>
                    <select
                      value={settings.modelPreference}
                      onChange={(e) => setSettings({ ...settings, modelPreference: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="haiku">Claude 3 Haiku (Fast & Economical)</option>
                      <option value="sonnet">Claude 3 Sonnet (Balanced)</option>
                      <option value="opus">Claude 3 Opus (Most Capable)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Professional tier automatically uses better models
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Response Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-600" />
                Response Configuration
              </CardTitle>
              <CardDescription>
                Fine-tune how your AI responds to guests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Response Creativity (Temperature)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.temperature}
                    onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-gray-700 w-12">{settings.temperature}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Lower = More consistent, Higher = More creative
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Response Length (Tokens)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="50"
                    value={settings.maxTokens}
                    onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-gray-700 w-12">{settings.maxTokens}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Approximate word count: {Math.round(settings.maxTokens * 0.75)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom System Prompt (Optional)
                </label>
                <textarea
                  value={settings.customPrompt}
                  onChange={(e) => setSettings({ ...settings, customPrompt: e.target.value })}
                  placeholder="Add specific instructions for your AI assistant..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Example: "Always mention our happy hour special from 4-6 PM"
                </p>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Use Knowledge Base for Responses
                </label>
                <button
                  onClick={() => setSettings({ ...settings, knowledgeBaseEnabled: !settings.knowledgeBaseEnabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.knowledgeBaseEnabled ? 'bg-cyan-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.knowledgeBaseEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* API Usage Stats */}
          {settings.useClaudeAPI && (
            <Card>
              <CardHeader>
                <CardTitle>API Usage Statistics</CardTitle>
                <CardDescription>
                  Monitor your Claude API usage this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">1,234</div>
                    <div className="text-sm text-gray-600">Requests</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">45.2K</div>
                    <div className="text-sm text-gray-600">Tokens Used</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">$8.45</div>
                    <div className="text-sm text-gray-600">Cost</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    You're using approximately 41% of your estimated monthly budget.
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <div className="flex items-center justify-between">
            {saveMessage && (
              <div className={`flex items-center gap-2 text-sm ${
                saveMessage.includes('Error') ? 'text-red-600' : 'text-green-600'
              }`}>
                {saveMessage.includes('Error') ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {saveMessage}
              </div>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="ml-auto bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
              <Save className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}