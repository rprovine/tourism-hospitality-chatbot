'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Sparkles, Save, AlertCircle, Check, Bot, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AISettingsPage() {
  const [settings, setSettings] = useState({
    provider: 'claude', // 'claude' or 'chatgpt'
    claudeSettings: {
      apiKey: '',
      modelPreference: 'haiku',
    },
    chatgptSettings: {
      apiKey: '',
      modelPreference: 'gpt-3.5-turbo',
    },
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Configuration</h1>
        <p className="text-gray-600 mt-2">Customize your chatbot's AI capabilities and behavior</p>
      </div>

      {/* AI Provider Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-cyan-600" />
            AI Provider Selection
          </CardTitle>
          <CardDescription>
            Choose between Claude AI or ChatGPT for your chatbot responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSettings({ ...settings, provider: 'claude' })}
              className={`p-4 rounded-lg border-2 transition-all ${
                settings.provider === 'claude'
                  ? 'border-cyan-600 bg-cyan-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <Bot className="h-8 w-8 text-cyan-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Claude AI</h3>
              <p className="text-sm text-gray-600 mt-1">
                Advanced reasoning and nuanced responses
              </p>
              {settings.provider === 'claude' && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                    Active
                  </span>
                </div>
              )}
            </button>

            <button
              onClick={() => setSettings({ ...settings, provider: 'chatgpt' })}
              className={`p-4 rounded-lg border-2 transition-all ${
                settings.provider === 'chatgpt'
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">ChatGPT</h3>
              <p className="text-sm text-gray-600 mt-1">
                Fast and versatile AI responses
              </p>
              {settings.provider === 'chatgpt' && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Provider-specific Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>
            {settings.provider === 'claude' ? 'Claude' : 'ChatGPT'} Configuration
          </CardTitle>
          <CardDescription>
            Configure your {settings.provider === 'claude' ? 'Claude AI' : 'ChatGPT'} integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.provider === 'claude' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Claude API Key
                </label>
                <input
                  type="password"
                  value={settings.claudeSettings.apiKey}
                  onChange={(e) => setSettings({
                    ...settings,
                    claudeSettings: { ...settings.claudeSettings, apiKey: e.target.value }
                  })}
                  placeholder="sk-ant-api..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                  Claude Model
                </label>
                <select
                  value={settings.claudeSettings.modelPreference}
                  onChange={(e) => setSettings({
                    ...settings,
                    claudeSettings: { ...settings.claudeSettings, modelPreference: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="haiku">Claude 3 Haiku (Fast & Economical)</option>
                  <option value="sonnet">Claude 3.5 Sonnet (Balanced)</option>
                  <option value="opus">Claude 3 Opus (Most Capable)</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={settings.chatgptSettings.apiKey}
                  onChange={(e) => setSettings({
                    ...settings,
                    chatgptSettings: { ...settings.chatgptSettings, apiKey: e.target.value }
                  })}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get your API key from{' '}
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                    platform.openai.com
                  </a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GPT Model
                </label>
                <select
                  value={settings.chatgptSettings.modelPreference}
                  onChange={(e) => setSettings({
                    ...settings,
                    chatgptSettings: { ...settings.chatgptSettings, modelPreference: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast & Economical)</option>
                  <option value="gpt-4">GPT-4 (Advanced)</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo (Latest)</option>
                </select>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
      <Card>
        <CardHeader>
          <CardTitle>API Usage Statistics</CardTitle>
          <CardDescription>
            Monitor your {settings.provider === 'claude' ? 'Claude' : 'OpenAI'} API usage this month
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
  )
}