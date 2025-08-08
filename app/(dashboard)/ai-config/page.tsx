'use client'

import { useState, useEffect } from 'react'
import { Brain, Sparkles, Save, AlertCircle, Check, Bot, MessageSquare, Lock, Globe, Zap, Target, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { LoadingState } from '@/components/ui/loading-state'
import { getTierLimit } from '@/lib/tierRestrictions'
import Link from 'next/link'

export default function UnifiedAIConfigPage() {
  const [settings, setSettings] = useState({
    // Provider settings
    provider: 'claude',
    claudeSettings: {
      apiKey: '',
      modelPreference: 'haiku',
    },
    chatgptSettings: {
      apiKey: '',
      modelPreference: 'gpt-3.5-turbo',
    },
    // Response settings
    temperature: 0.7,
    maxTokens: 500,
    customPrompt: '',
    knowledgeBaseEnabled: true,
    // Behavior settings
    responseStyle: 'professional',
    personalityTraits: ['helpful', 'friendly', 'knowledgeable'],
    languages: ['english'],
    learningEnabled: true,
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [businessTier, setBusinessTier] = useState<string>('starter')
  const [allowedModels, setAllowedModels] = useState<string[]>([])
  const [trainingStats, setTrainingStats] = useState({
    totalDocuments: 0,
    totalQuestions: 0,
    lastTrained: null as string | null
  })

  useEffect(() => {
    // Get business tier for model restrictions
    const businessData = localStorage.getItem('business')
    if (businessData) {
      const business = JSON.parse(businessData)
      const tier = business.tier || 'starter'
      setBusinessTier(tier)
      const models = getTierLimit(tier, 'aiModels')
      setAllowedModels(models || [])
    }
    loadSettings()
    fetchTrainingStats()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/ai/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSettings(prevSettings => ({ ...prevSettings, ...data }))
      }
    } catch (error) {
      console.error('Failed to load AI settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTrainingStats = async () => {
    try {
      const response = await fetch('/api/knowledge-base', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setTrainingStats({
          totalDocuments: data.length,
          totalQuestions: data.length,
          lastTrained: data[0]?.createdAt || null
        })
      }
    } catch (error) {
      console.error('Failed to fetch training stats:', error)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage('')
    
    try {
      const response = await fetch('/api/ai/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      })
      
      if (response.ok) {
        setSaveMessage('Settings saved successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessage('Error saving settings. Please try again.')
      }
    } catch (error) {
      setSaveMessage('Error saving settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const triggerRetraining = async () => {
    try {
      const response = await fetch('/api/ai/learn', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        alert('AI retraining initiated successfully!')
        fetchTrainingStats()
      }
    } catch (error) {
      alert('Failed to initiate retraining')
    }
  }

  if (loading) {
    return <LoadingState message="Loading AI configuration..." size="lg" />
  }

  const responseStyles = ['professional', 'friendly', 'casual', 'concise', 'detailed']
  const availableLanguages = [
    { code: 'english', label: 'English', flag: '🇺🇸' },
    { code: 'pidgin', label: 'Hawaiian Pidgin', flag: '🤙', tier: 'professional' },
    { code: 'hawaiian', label: 'ʻŌlelo Hawaiʻi', flag: '🌺', tier: 'premium' },
    { code: 'spanish', label: 'Spanish', flag: '🇪🇸' },
    { code: 'japanese', label: 'Japanese', flag: '🇯🇵' },
    { code: 'chinese', label: 'Chinese', flag: '🇨🇳' },
    { code: 'french', label: 'French', flag: '🇫🇷' },
    { code: 'german', label: 'German', flag: '🇩🇪' }
  ]
  
  const personalityOptions = [
    'helpful', 'friendly', 'professional', 'knowledgeable', 
    'concise', 'detailed', 'empathetic', 'efficient'
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Configuration</h1>
        <p className="text-gray-600 mt-2">Manage your chatbot's AI capabilities, behavior, and training</p>
      </div>

      <Tabs defaultValue="provider" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="provider">Provider & Models</TabsTrigger>
          <TabsTrigger value="behavior">Behavior & Style</TabsTrigger>
          <TabsTrigger value="training">Training & Knowledge</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
        </TabsList>

        {/* Provider & Models Tab */}
        <TabsContent value="provider" className="space-y-4">
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
                      <Badge className="bg-cyan-100 text-cyan-800">Active</Badge>
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
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Model Configuration */}
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
              {/* Model Tier Alert */}
              {businessTier === 'starter' && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <div className="flex items-start gap-2">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">Limited AI Models</p>
                      <p className="text-gray-700 mt-1">
                        Your {businessTier} plan includes basic AI models. Upgrade to Professional or Premium for advanced models.
                      </p>
                      <Link href="/subscription">
                        <Button variant="outline" size="sm" className="mt-2 border-yellow-600 text-yellow-700 hover:bg-yellow-100">
                          View Upgrade Options
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Alert>
              )}
              
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
                      <option value="haiku" disabled={!allowedModels.includes('claude-haiku')}>
                        Claude 3 Haiku (Fast & Economical) {!allowedModels.includes('claude-haiku') && '🔒'}
                      </option>
                      <option value="sonnet" disabled={!allowedModels.includes('claude-sonnet')}>
                        Claude 3.5 Sonnet (Balanced) {!allowedModels.includes('claude-sonnet') && '🔒 Pro'}
                      </option>
                      <option value="opus" disabled={!allowedModels.includes('claude-opus')}>
                        Claude 3 Opus (Most Capable) {!allowedModels.includes('claude-opus') && '🔒 Premium'}
                      </option>
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
                      <option value="gpt-3.5-turbo" disabled={!allowedModels.includes('gpt-3.5-turbo')}>
                        GPT-3.5 Turbo (Fast & Economical) {!allowedModels.includes('gpt-3.5-turbo') && '🔒'}
                      </option>
                      <option value="gpt-4" disabled={!allowedModels.includes('gpt-4')}>
                        GPT-4 (Advanced) {!allowedModels.includes('gpt-4') && '🔒 Pro'}
                      </option>
                      <option value="gpt-4-turbo" disabled={!allowedModels.includes('gpt-4-turbo')}>
                        GPT-4 Turbo (Latest) {!allowedModels.includes('gpt-4-turbo') && '🔒 Premium'}
                      </option>
                    </select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behavior & Style Tab */}
        <TabsContent value="behavior" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-600" />
                AI Behavior & Personality
              </CardTitle>
              <CardDescription>
                Customize how your AI assistant interacts with guests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Response Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {responseStyles.map((style) => (
                    <button
                      key={style}
                      onClick={() => setSettings({ ...settings, responseStyle: style })}
                      className={`px-4 py-2 rounded-lg border capitalize transition-all ${
                        settings.responseStyle === style
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Personality Traits */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personality Traits
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {personalityOptions.map((trait) => (
                    <label
                      key={trait}
                      className="flex items-center gap-2 p-2 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={settings.personalityTraits.includes(trait)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSettings({
                              ...settings,
                              personalityTraits: [...settings.personalityTraits, trait]
                            })
                          } else {
                            setSettings({
                              ...settings,
                              personalityTraits: settings.personalityTraits.filter(t => t !== trait)
                            })
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm capitalize text-gray-700">{trait}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Supported Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supported Languages
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableLanguages.map((lang) => {
                    const isRestricted = lang.tier && 
                      ((lang.tier === 'professional' && businessTier === 'starter') ||
                       (lang.tier === 'premium' && businessTier !== 'premium'))
                    
                    return (
                      <label
                        key={lang.code}
                        className={`flex items-center gap-2 p-2 rounded border ${
                          isRestricted 
                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' 
                            : 'border-gray-200 hover:bg-gray-50 cursor-pointer'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={settings.languages.includes(lang.code)}
                          disabled={isRestricted}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSettings({
                                ...settings,
                                languages: [...settings.languages, lang.code]
                              })
                            } else {
                              setSettings({
                                ...settings,
                                languages: settings.languages.filter(l => l !== lang.code)
                              })
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700 flex items-center gap-1">
                          {lang.flag} {lang.label}
                          {isRestricted && (
                            <Lock className="h-3 w-3 text-gray-400" />
                          )}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training & Knowledge Tab */}
        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Statistics</CardTitle>
              <CardDescription>
                Your AI has been trained on your business knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{trainingStats.totalDocuments}</div>
                  <div className="text-sm text-gray-600">Knowledge Items</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{trainingStats.totalQuestions}</div>
                  <div className="text-sm text-gray-600">Q&A Pairs</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {trainingStats.lastTrained 
                      ? new Date(trainingStats.lastTrained).toLocaleDateString()
                      : 'Never'}
                  </div>
                  <div className="text-sm text-gray-600">Last Updated</div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={triggerRetraining} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retrain AI Model
                </Button>
                <Link href="/knowledge-base">
                  <Button variant="outline">
                    <Brain className="h-4 w-4 mr-2" />
                    Manage Knowledge Base
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning & Adaptation</CardTitle>
              <CardDescription>
                Configure how your AI learns from conversations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Automatic Learning
                  </label>
                  <p className="text-xs text-gray-500">
                    Allow AI to learn from successful conversations
                  </p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, learningEnabled: !settings.learningEnabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.learningEnabled ? 'bg-cyan-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.learningEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Use Knowledge Base
                  </label>
                  <p className="text-xs text-gray-500">
                    Prioritize knowledge base answers over general responses
                  </p>
                </div>
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
        </TabsContent>

        {/* Advanced Settings Tab */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Response Configuration</CardTitle>
              <CardDescription>
                Fine-tune your AI's response generation
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
                    max="1000"
                    step="50"
                    value={settings.maxTokens}
                    onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-gray-700 w-16">{settings.maxTokens}</span>
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
        </TabsContent>
      </Tabs>

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
          {isSaving ? 'Saving...' : 'Save All Settings'}
          <Save className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}