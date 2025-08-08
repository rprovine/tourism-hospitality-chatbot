'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Brain,
  Upload,
  FileText,
  Globe,
  FileSpreadsheet,
  Download,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Database,
  File,
  Sparkles,
  Target,
  TrendingUp,
  Activity,
  RefreshCw,
  Zap,
  MessageSquare
} from 'lucide-react'

interface AIConfig {
  model: string
  temperature: number
  maxTokens: number
  responseStyle: string
  languages: string[]
  personalityTraits: string[]
  learningEnabled: boolean
}

export default function AIConfigPage() {
  const [config, setConfig] = useState<AIConfig>({
    model: 'gpt-4-turbo',
    temperature: 0.7,
    maxTokens: 500,
    responseStyle: 'professional',
    languages: ['en', 'es', 'ja'],
    personalityTraits: ['helpful', 'friendly', 'knowledgeable'],
    learningEnabled: true
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [trainingStats, setTrainingStats] = useState({
    totalDocuments: 0,
    totalQuestions: 0,
    lastTrained: null
  })
  const [fileUrl, setFileUrl] = useState('')

  useEffect(() => {
    fetchAIConfig()
    fetchTrainingStats()
  }, [])

  const fetchAIConfig = async () => {
    try {
      const response = await fetch('/api/ai/config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      }
    } catch (error) {
      console.error('Failed to fetch AI config:', error)
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

  const saveConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(config)
      })
      
      if (response.ok) {
        alert('AI configuration saved successfully!')
      } else {
        alert('Failed to save configuration')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/knowledge-base/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      if (response.ok) {
        alert('Training data uploaded successfully!')
        await fetchTrainingStats()
      } else {
        alert('Failed to upload training data')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload training data')
    } finally {
      setUploading(false)
    }
  }

  const handleUrlImport = async () => {
    if (!fileUrl) {
      alert('Please enter a URL')
      return
    }

    setUploading(true)
    try {
      const response = await fetch('/api/knowledge-base/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ url: fileUrl, type: 'webscrape' })
      })

      if (response.ok) {
        alert('Website content imported successfully!')
        setFileUrl('')
        await fetchTrainingStats()
      } else {
        alert('Failed to import website content')
      }
    } catch (error) {
      console.error('Import error:', error)
      alert('Failed to import website content')
    } finally {
      setUploading(false)
    }
  }

  const trainModel = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/train', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        alert('AI model training started!')
        await fetchTrainingStats()
      } else {
        alert('Failed to start training')
      }
    } catch (error) {
      console.error('Training error:', error)
      alert('Failed to start training')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Brain className="h-8 w-8 text-cyan-600" />
              <h1 className="text-3xl font-bold text-gray-900">AI Configuration</h1>
            </div>
            <p className="text-gray-600">Configure and train your AI assistant</p>
          </div>
          <Button onClick={saveConfig} disabled={loading}>
            <Settings className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">AI Model</CardTitle>
            <Brain className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">GPT-4</div>
            <p className="text-xs text-gray-500">Active & Ready</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Training Data</CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{trainingStats.totalDocuments}</div>
            <p className="text-xs text-gray-500">Documents</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Q&A Pairs</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{trainingStats.totalQuestions}</div>
            <p className="text-xs text-gray-500">Trained responses</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Learning</CardTitle>
            <Sparkles className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-600">Enabled</span>
            </div>
            <p className="text-xs text-gray-500">Self-improving</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Configuration */}
      <Tabs defaultValue="training" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100">
          <TabsTrigger value="training" className="data-[state=active]:bg-white">
            Training Data
          </TabsTrigger>
          <TabsTrigger value="behavior" className="data-[state=active]:bg-white">
            Behavior Settings
          </TabsTrigger>
          <TabsTrigger value="advanced" className="data-[state=active]:bg-white">
            Advanced Options
          </TabsTrigger>
        </TabsList>
        
        {/* Training Data Tab */}
        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle>Upload Training Data</CardTitle>
              <CardDescription>
                Train your AI with your business-specific knowledge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload Section */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Document Upload</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium mb-2">
                    Upload documents to train your AI
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Supported: PDF, DOCX, XLSX, CSV, TXT
                  </p>
                  <input
                    type="file"
                    id="ai-file-upload"
                    className="hidden"
                    accept=".pdf,.docx,.xlsx,.csv,.txt"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  <Button 
                    onClick={() => document.getElementById('ai-file-upload')?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Choose Files
                      </>
                    )}
                  </Button>
                </div>
                
                {/* File Type Examples */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-white">
                    <FileSpreadsheet className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Spreadsheets</p>
                      <p className="text-xs text-gray-500">FAQ lists, price sheets</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-white">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Documents</p>
                      <p className="text-xs text-gray-500">Policies, guides, manuals</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-white">
                    <File className="h-8 w-8 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Text Files</p>
                      <p className="text-xs text-gray-500">Scripts, templates</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Web Scraping Section */}
              <div className="space-y-4 pt-6 border-t">
                <h3 className="font-medium text-gray-900">Web Scraping</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://your-website.com/faq"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    className="flex-1"
                    disabled={uploading}
                  />
                  <Button onClick={handleUrlImport} disabled={uploading}>
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Globe className="h-4 w-4 mr-2" />
                        Import
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Automatically extract and learn from your website content
                </p>
              </div>
              
              {/* Training Button */}
              <div className="pt-6 border-t">
                <Button 
                  onClick={trainModel} 
                  className="w-full"
                  size="lg"
                  disabled={loading || trainingStats.totalDocuments === 0}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Start Training AI Model
                </Button>
                {trainingStats.lastTrained && (
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Last trained: {new Date(trainingStats.lastTrained).toLocaleDateString()}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Behavior Settings Tab */}
        <TabsContent value="behavior">
          <Card>
            <CardHeader>
              <CardTitle>AI Behavior</CardTitle>
              <CardDescription>
                Customize how your AI interacts with guests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Style
                </label>
                <select
                  value={config.responseStyle}
                  onChange={(e) => setConfig({...config, responseStyle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly & Casual</option>
                  <option value="concise">Concise</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personality Traits
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Helpful', 'Friendly', 'Professional', 'Knowledgeable', 'Empathetic', 'Proactive'].map(trait => (
                    <Badge
                      key={trait}
                      variant={config.personalityTraits.includes(trait.toLowerCase()) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        const traits = config.personalityTraits.includes(trait.toLowerCase())
                          ? config.personalityTraits.filter(t => t !== trait.toLowerCase())
                          : [...config.personalityTraits, trait.toLowerCase()]
                        setConfig({...config, personalityTraits: traits})
                      }}
                    >
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supported Languages
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { code: 'en', name: 'English' },
                    { code: 'es', name: 'Spanish' },
                    { code: 'fr', name: 'French' },
                    { code: 'de', name: 'German' },
                    { code: 'ja', name: 'Japanese' },
                    { code: 'zh', name: 'Chinese' }
                  ].map(lang => (
                    <Badge
                      key={lang.code}
                      variant={config.languages.includes(lang.code) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        const languages = config.languages.includes(lang.code)
                          ? config.languages.filter(l => l !== lang.code)
                          : [...config.languages, lang.code]
                        setConfig({...config, languages})
                      }}
                    >
                      {lang.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Advanced Options Tab */}
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Fine-tune AI parameters for optimal performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Model
                </label>
                <select
                  value={config.model}
                  onChange={(e) => setConfig({...config, model: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="gpt-4-turbo">GPT-4 Turbo (Recommended)</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Creativity (Temperature: {config.temperature})
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => setConfig({...config, temperature: parseFloat(e.target.value)})}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Focused</span>
                  <span>Balanced</span>
                  <span>Creative</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Response Length
                </label>
                <select
                  value={config.maxTokens}
                  onChange={(e) => setConfig({...config, maxTokens: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="150">Short (150 tokens)</option>
                  <option value="300">Medium (300 tokens)</option>
                  <option value="500">Long (500 tokens)</option>
                  <option value="1000">Very Long (1000 tokens)</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Self-Learning Mode</p>
                  <p className="text-sm text-gray-500">AI learns from conversations</p>
                </div>
                <button
                  onClick={() => setConfig({...config, learningEnabled: !config.learningEnabled})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.learningEnabled ? 'bg-cyan-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.learningEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}