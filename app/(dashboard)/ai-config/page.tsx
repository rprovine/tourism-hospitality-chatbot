'use client'

import { useState, useEffect } from 'react'
import { Brain, Sparkles, Save, AlertCircle, Check, Bot, MessageSquare, Lock, RefreshCw, CheckCircle, Settings, Sliders, BookOpen, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
      modelPreference: 'haiku',
    },
    chatgptSettings: {
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
  const [usageStats, setUsageStats] = useState({
    requests: 0,
    tokensUsed: 0,
    estimatedCost: '0.00',
    usagePercentage: 0,
    monthlyBudget: 20
  })
  const [isRetraining, setIsRetraining] = useState(false)
  const [retrainMessage, setRetrainMessage] = useState('')

  useEffect(() => {
    // Get business tier for model restrictions
    const businessData = localStorage.getItem('business')
    if (businessData) {
      const business = JSON.parse(businessData)
      const tier = business.tier || 'starter'
      setBusinessTier(tier)
      const models = getTierLimit(tier, 'aiModels')
      setAllowedModels(models || [])
      
      // Set default models based on tier (always default to cheapest)
      setSettings(prev => ({
        ...prev,
        claudeSettings: {
          modelPreference: models?.includes('claude-haiku') ? 'haiku' : 'haiku'
        },
        chatgptSettings: {
          modelPreference: models?.includes('gpt-3.5-turbo') ? 'gpt-3.5-turbo' : 'gpt-3.5-turbo'
        }
      }))
    }
    loadSettings()
    fetchTrainingStats()
    fetchUsageStats()
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
    } catch {
      console.error('Failed to load AI settings')
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
    } catch {
      console.error('Failed to fetch training stats')
    }
  }

  const fetchUsageStats = async () => {
    try {
      const response = await fetch('/api/ai/usage', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsageStats(data)
      }
    } catch {
      console.error('Failed to fetch usage stats')
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
    } catch {
      setSaveMessage('Error saving settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const triggerRetraining = async () => {
    setIsRetraining(true)
    setRetrainMessage('Analyzing patterns and generating insights from your knowledge base...')
    
    try {
      const response = await fetch('/api/ai/learn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          action: 'insights'
        })
      })
      
      if (response.ok) {
        setRetrainMessage('AI retraining completed successfully! Your chatbot is now updated with the latest information.')
        fetchTrainingStats()
        setTimeout(() => {
          setRetrainMessage('')
          setIsRetraining(false)
        }, 5000)
      } else {
        setRetrainMessage('Failed to retrain AI. Please try again.')
        setTimeout(() => {
          setRetrainMessage('')
          setIsRetraining(false)
        }, 3000)
      }
    } catch {
      setRetrainMessage('Failed to initiate retraining. Please check your connection.')
      setTimeout(() => {
        setRetrainMessage('')
        setIsRetraining(false)
      }, 3000)
    }
  }

  if (loading) {
    return <LoadingState message="Loading AI configuration..." size="lg" />
  }

  const responseStyles = ['professional', 'friendly', 'casual', 'concise', 'detailed']
  const availableLanguages = [
    { code: 'english', label: 'English', flag: '🇺🇸' },
    { code: 'spanish', label: 'Spanish', flag: '🇪🇸', tier: 'professional' },
    { code: 'japanese', label: 'Japanese', flag: '🇯🇵', tier: 'professional' },
    { code: 'chinese', label: 'Chinese', flag: '🇨🇳', tier: 'professional' },
    { code: 'french', label: 'French', flag: '🇫🇷', tier: 'professional' },
    { code: 'german', label: 'German', flag: '🇩🇪', tier: 'professional' },
    { code: 'pidgin', label: 'Hawaiian Pidgin', flag: '🤙', tier: 'professional' },
    { code: 'hawaiian', label: 'ʻŌlelo Hawaiʻi', flag: '🌺', tier: 'premium' }
  ]
  
  const personalityOptions = [
    'helpful', 'friendly', 'professional', 'knowledgeable', 
    'concise', 'detailed', 'empathetic', 'efficient'
  ]

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Configuration</h1>
          <p className="text-gray-600 mt-2">Configure your AI assistant's intelligence, personality, and behavior</p>
        </div>
        <Badge variant="info" className="hidden sm:flex">
          {businessTier.charAt(0).toUpperCase() + businessTier.slice(1)} Plan
        </Badge>
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Left Column - AI Intelligence */}
        <div className="space-y-6">
          
          {/* AI Provider & Model Selection */}
          <Card className="border-l-4 border-l-cyan-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl">
                  <Brain className="h-6 w-6 text-cyan-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">AI Intelligence</CardTitle>
                  <CardDescription>Choose your AI brain and model</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Service Status */}
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="font-semibold text-gray-900">🚀 AI Service Ready</p>
                  <p className="text-sm text-gray-700">
                    Fully configured • Server-managed keys • No setup required
                  </p>
                </div>
              </Alert>

              {/* Provider Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-600" />
                  Choose AI Provider
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setSettings({ ...settings, provider: 'claude' })}
                    className={`group p-4 rounded-xl border-2 transition-all duration-200 ${
                      settings.provider === 'claude'
                        ? 'border-cyan-500 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-lg ring-2 ring-cyan-200'
                        : 'border-gray-200 hover:border-cyan-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg transition-colors ${
                        settings.provider === 'claude' 
                          ? 'bg-cyan-500' 
                          : 'bg-gray-100 group-hover:bg-cyan-100'
                      }`}>
                        <Bot className={`h-5 w-5 ${
                          settings.provider === 'claude' 
                            ? 'text-white' 
                            : 'text-gray-600 group-hover:text-cyan-600'
                        }`} />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="font-semibold text-gray-900">Claude AI</h3>
                        <p className="text-xs text-gray-600">Superior reasoning & conversation</p>
                      </div>
                      {settings.provider === 'claude' && (
                        <Badge variant="info" className="text-xs">Active</Badge>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => setSettings({ ...settings, provider: 'chatgpt' })}
                    className={`group p-4 rounded-xl border-2 transition-all duration-200 ${
                      settings.provider === 'chatgpt'
                        ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg ring-2 ring-green-200'
                        : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg transition-colors ${
                        settings.provider === 'chatgpt' 
                          ? 'bg-green-500' 
                          : 'bg-gray-100 group-hover:bg-green-100'
                      }`}>
                        <MessageSquare className={`h-5 w-5 ${
                          settings.provider === 'chatgpt' 
                            ? 'text-white' 
                            : 'text-gray-600 group-hover:text-green-600'
                        }`} />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="font-semibold text-gray-900">ChatGPT</h3>
                        <p className="text-xs text-gray-600">Fast & versatile responses</p>
                      </div>
                      {settings.provider === 'chatgpt' && (
                        <Badge variant="green" className="text-xs">Active</Badge>
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Model Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <Settings className="h-4 w-4 text-purple-600" />
                  {settings.provider === 'claude' ? 'Claude Model' : 'GPT Model'}
                </label>
                
                {/* Tier Info */}
                <div className={`p-3 rounded-lg border-l-4 ${
                  businessTier === 'starter' 
                    ? 'border-l-yellow-500 bg-yellow-50' 
                    : 'border-l-blue-500 bg-blue-50'
                }`}>
                  <p className="text-sm font-medium text-gray-900">
                    {businessTier.charAt(0).toUpperCase() + businessTier.slice(1)} Plan Models
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {businessTier === 'starter' && 'Economical models optimized for cost'}
                    {businessTier === 'professional' && 'Balanced performance & cost models'}
                    {businessTier === 'premium' && 'Premium models with advanced capabilities'}
                    {businessTier === 'enterprise' && 'All models including latest releases'}
                  </p>
                </div>

                {settings.provider === 'claude' ? (
                  <select
                    value={settings.claudeSettings.modelPreference}
                    onChange={(e) => setSettings({
                      ...settings,
                      claudeSettings: { modelPreference: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  >
                    <option value="haiku" disabled={!allowedModels.includes('claude-haiku')}>
                      🚀 Claude 3 Haiku (Fast & Economical) {!allowedModels.includes('claude-haiku') && '🔒'}
                    </option>
                    <option value="sonnet" disabled={!allowedModels.includes('claude-sonnet')}>
                      ⚖️ Claude 3.5 Sonnet (Balanced) {!allowedModels.includes('claude-sonnet') && '🔒 Pro'}
                    </option>
                    <option value="opus" disabled={!allowedModels.includes('claude-opus')}>
                      🧠 Claude 3 Opus (Most Capable) {!allowedModels.includes('claude-opus') && '🔒 Premium'}
                    </option>
                  </select>
                ) : (
                  <select
                    value={settings.chatgptSettings.modelPreference}
                    onChange={(e) => setSettings({
                      ...settings,
                      chatgptSettings: { modelPreference: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  >
                    <option value="gpt-5" disabled={!allowedModels.includes('gpt-5')}>
                      🚀 GPT-5 (Auto-Optimizing AI) {!allowedModels.includes('gpt-5') && '🔒 Professional+'}
                    </option>
                  </select>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Knowledge & Training */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Knowledge & Training</CardTitle>
                  <CardDescription>Manage AI learning and knowledge base</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Training Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{trainingStats.totalDocuments}</div>
                  <div className="text-xs text-gray-600 mt-1">Knowledge Items</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{trainingStats.totalQuestions}</div>
                  <div className="text-xs text-gray-600 mt-1">Q&A Pairs</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-semibold text-gray-900">
                    {trainingStats.lastTrained 
                      ? new Date(trainingStats.lastTrained).toLocaleDateString()
                      : 'Never'}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Last Updated</div>
                </div>
              </div>

              {/* Learning Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <label className="text-sm font-medium text-gray-900">Knowledge Base Enabled</label>
                    <p className="text-xs text-gray-500">Use your knowledge base for responses</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, knowledgeBaseEnabled: !settings.knowledgeBaseEnabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.knowledgeBaseEnabled ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.knowledgeBaseEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <label className="text-sm font-medium text-gray-900">Automatic Learning</label>
                    <p className="text-xs text-gray-500">Learn from successful conversations</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, learningEnabled: !settings.learningEnabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.learningEnabled ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.learningEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Retrain Message */}
              {retrainMessage && (
                <div className={`p-3 rounded-lg mb-4 ${
                  retrainMessage.includes('successfully') 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : retrainMessage.includes('Failed') 
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-blue-50 text-blue-800 border border-blue-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {isRetraining && <RefreshCw className="h-4 w-4 animate-spin" />}
                    {retrainMessage.includes('successfully') && <CheckCircle className="h-4 w-4" />}
                    {retrainMessage.includes('Failed') && <AlertCircle className="h-4 w-4" />}
                    <span className="text-sm">{retrainMessage}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={triggerRetraining} 
                  variant="outline" 
                  className="flex-1"
                  disabled={isRetraining}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRetraining ? 'animate-spin' : ''}`} />
                  {isRetraining ? 'Retraining...' : 'Retrain AI'}
                </Button>
                <Link href="/knowledge-base" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Manage Knowledge
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Behavior & Advanced */}
        <div className="space-y-6">
          
          {/* Behavior & Personality */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Behavior & Personality</CardTitle>
                  <CardDescription>Customize your AI's personality and style</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Response Style */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-900">Response Style</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {responseStyles.map((style) => (
                    <button
                      key={style}
                      onClick={() => setSettings({ ...settings, responseStyle: style })}
                      className={`px-4 py-2 rounded-lg border capitalize transition-all text-sm ${
                        settings.responseStyle === style
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-300 hover:border-purple-400 text-gray-700'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Personality Traits */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-900">Personality Traits</label>
                <div className="grid grid-cols-2 gap-2">
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

              {/* Language Support */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-900">Supported Languages</label>
                
                {/* Language Restriction Alert for Starter */}
                {businessTier === 'starter' && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Language Limitation</p>
                      <p className="text-sm text-gray-800 mt-1">
                        Starter plan: English only. Upgrade to Professional for 2 languages, Premium for 5 languages.
                      </p>
                      <Link href="/subscription">
                        <Button variant="outline" size="sm" className="mt-2">
                          View Upgrade Options
                        </Button>
                      </Link>
                    </div>
                  </Alert>
                )}
                
                <div className="grid grid-cols-2 gap-2">
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
                          checked={settings.languages.includes(lang.code) || lang.code === 'english'}
                          disabled={isRestricted || lang.code === 'english' || (businessTier === 'starter' && lang.code !== 'english')}
                          onChange={(e) => {
                            // Prevent unchecking English
                            if (lang.code === 'english') return;
                            
                            // Enforce tier limits
                            if (businessTier === 'starter') {
                              return;
                            }
                            
                            const currentLanguages = settings.languages.filter(l => l !== 'english');
                            const maxLanguages = businessTier === 'professional' ? 1 : businessTier === 'premium' ? 4 : 0;
                            
                            if (e.target.checked) {
                              if (currentLanguages.length >= maxLanguages) {
                                alert(`Your ${businessTier} plan allows a maximum of ${maxLanguages + 1} languages (including English).`);
                                return;
                              }
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
                          {lang.code === 'english' && (
                            <span className="text-xs text-gray-500">(Required)</span>
                          )}
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

          {/* Advanced Settings */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl">
                  <Sliders className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Advanced Settings</CardTitle>
                  <CardDescription>Fine-tune response parameters</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Response Controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Response Creativity
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={settings.temperature}
                        onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                        className="flex-1 accent-orange-600"
                      />
                      <div className="bg-white px-3 py-1 rounded border border-gray-200 min-w-[3rem] text-center">
                        <span className="text-sm font-semibold text-gray-900">{settings.temperature}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Consistent</span>
                      <span>Creative</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Response Length
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="50"
                        max="1000"
                        step="50"
                        value={settings.maxTokens}
                        onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
                        className="flex-1 accent-orange-600"
                      />
                      <div className="bg-white px-3 py-1 rounded border border-gray-200 min-w-[4rem] text-center">
                        <span className="text-sm font-semibold text-gray-900">{settings.maxTokens}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2 text-center">
                      ≈ {Math.round(settings.maxTokens * 0.75)} words
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Instructions (Optional)
                </label>
                <textarea
                  value={settings.customPrompt}
                  onChange={(e) => setSettings({ ...settings, customPrompt: e.target.value })}
                  placeholder="Add specific instructions for your AI assistant..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Example: "Always mention our happy hour special from 4-6 PM"
                </p>
              </div>

              {/* Usage Statistics */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-orange-600" />
                  This Month's Usage
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{usageStats.requests.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Conversations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {usageStats.tokensUsed >= 1000 
                        ? `${(usageStats.tokensUsed / 1000).toFixed(1)}K` 
                        : usageStats.tokensUsed.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">Tokens</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">${usageStats.estimatedCost}</div>
                    <div className="text-xs text-gray-600">Est. Cost</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Button */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-end bg-white p-4 border border-gray-200 rounded-lg sticky bottom-4">
        {saveMessage && (
          <div className={`flex items-center gap-2 text-sm mr-4 ${
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
          size="lg"
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-3"
        >
          {isSaving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save All Settings
            </>
          )}
        </Button>
        </div>
      </div>
    </div>
  )
}