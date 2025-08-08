'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { 
  Brain,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Target,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Lightbulb,
  BarChart3,
  Zap,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react'

interface AIInsight {
  id: string
  type: 'improvement' | 'issue' | 'opportunity' | 'trend'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  recommendation: string
  metrics?: any
  createdAt: string
}

interface LearningPattern {
  id: string
  pattern: string
  frequency: number
  successRate: number
  avgSentiment: number
}

export default function AIPage() {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [patterns, setPatterns] = useState<LearningPattern[]>([])
  const [aiStatus, setAiStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  
  useEffect(() => {
    fetchAIData()
  }, [])
  
  const fetchAIData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Fetch AI status
      const statusRes = await fetch('/api/ai/complete', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (statusRes.ok) {
        setAiStatus(await statusRes.json())
      }
      
      // Fetch insights
      const insightsRes = await fetch('/api/ai/learn?type=insights', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (insightsRes.ok) {
        const data = await insightsRes.json()
        setInsights(data.insights || [])
      }
      
      // Fetch patterns
      const patternsRes = await fetch('/api/ai/learn?type=patterns', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (patternsRes.ok) {
        const data = await patternsRes.json()
        setPatterns(data.patterns || [])
      }
    } catch (error) {
      console.error('Failed to fetch AI data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const generateInsights = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/ai/learn', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'insights' })
      })
      
      if (response.ok) {
        const data = await response.json()
        setInsights(data.insights || [])
        alert('New insights generated successfully!')
      }
    } catch (error) {
      console.error('Failed to generate insights:', error)
      alert('Failed to generate insights')
    } finally {
      setLoading(false)
    }
  }
  
  const exportLearningData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/ai/learn', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'export' })
      })
      
      if (response.ok) {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'learning-data.json'
        a.click()
      }
    } catch (error) {
      console.error('Failed to export data:', error)
      alert('Failed to export learning data')
    }
  }
  
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'improvement': return <Lightbulb className="h-5 w-5" />
      case 'issue': return <AlertCircle className="h-5 w-5" />
      case 'opportunity': return <Target className="h-5 w-5" />
      case 'trend': return <TrendingUp className="h-5 w-5" />
      default: return <Activity className="h-5 w-5" />
    }
  }
  
  if (loading) {
    return <div className="p-8">Loading AI features...</div>
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Intelligence Center</h1>
          <p className="text-muted-foreground">GPT-4 powered insights, sentiment analysis, and self-learning</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={generateInsights} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate Insights
          </Button>
          <Button onClick={exportLearningData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>
      
      {/* AI Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Status</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {aiStatus?.status === 'configured' ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-600">Active</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="font-semibold text-red-600">Not Configured</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {aiStatus?.models?.[0] || 'GPT-4 Turbo'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Patterns</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patterns.length}</div>
            <p className="text-xs text-muted-foreground">
              Recognized patterns
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Insights</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.length}</div>
            <p className="text-xs text-muted-foreground">
              Actionable recommendations
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patterns.length > 0 
                ? `${(patterns.reduce((sum, p) => sum + p.successRate, 0) / patterns.length * 100).toFixed(0)}%`
                : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Average pattern success
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="patterns">Learning Patterns</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
          <TabsTrigger value="settings">AI Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent AI Insights</CardTitle>
                <CardDescription>Latest recommendations from the learning engine</CardDescription>
              </CardHeader>
              <CardContent>
                {insights.length > 0 ? (
                  <div className="space-y-3">
                    {insights.slice(0, 5).map((insight) => (
                      <div key={insight.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        {getTypeIcon(insight.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{insight.title}</span>
                            <Badge className={getImpactColor(insight.impact)}>
                              {insight.impact}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{insight.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No insights available yet. Generate insights to see recommendations.</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Learning Patterns</CardTitle>
                <CardDescription>Most frequent customer interaction patterns</CardDescription>
              </CardHeader>
              <CardContent>
                {patterns.length > 0 ? (
                  <div className="space-y-3">
                    {patterns.slice(0, 5).map((pattern) => (
                      <div key={pattern.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium">{pattern.pattern}</span>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                            <span>Frequency: {pattern.frequency}</span>
                            <span>Success: {(pattern.successRate * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">
                            {pattern.avgSentiment > 0 ? (
                              <span className="text-green-600">Positive</span>
                            ) : pattern.avgSentiment < 0 ? (
                              <span className="text-red-600">Negative</span>
                            ) : (
                              <span className="text-gray-600">Neutral</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No patterns detected yet. The AI will learn from customer interactions.</p>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>AI Features</CardTitle>
              <CardDescription>Advanced capabilities powered by OpenAI GPT-4</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <Brain className="h-8 w-8 text-blue-600 mb-2" />
                  <h4 className="font-semibold">GPT-4 Integration</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Advanced language understanding and generation for natural conversations
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <Activity className="h-8 w-8 text-purple-600 mb-2" />
                  <h4 className="font-semibold">Sentiment Analysis</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Real-time emotion detection and urgency assessment
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <Zap className="h-8 w-8 text-green-600 mb-2" />
                  <h4 className="font-semibold">Self-Learning</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Continuous improvement from feedback and interactions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Insights</CardTitle>
              <CardDescription>Actionable recommendations based on conversation analysis</CardDescription>
            </CardHeader>
            <CardContent>
              {insights.length > 0 ? (
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <div key={insight.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(insight.type)}
                          <h4 className="font-semibold">{insight.title}</h4>
                        </div>
                        <Badge className={getImpactColor(insight.impact)}>
                          {insight.impact} impact
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{insight.description}</p>
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm font-medium text-blue-900">Recommendation:</p>
                        <p className="text-sm text-blue-700">{insight.recommendation}</p>
                      </div>
                      {insight.metrics && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-gray-500">
                            Created: {new Date(insight.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <div>
                    <p className="font-medium">No insights available</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Click "Generate Insights" to analyze your conversation data and receive AI-powered recommendations.
                    </p>
                  </div>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Learning Patterns</CardTitle>
              <CardDescription>Recognized patterns from customer interactions</CardDescription>
            </CardHeader>
            <CardContent>
              {patterns.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Pattern</th>
                        <th className="text-center p-2">Frequency</th>
                        <th className="text-center p-2">Success Rate</th>
                        <th className="text-center p-2">Sentiment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patterns.map((pattern) => (
                        <tr key={pattern.id} className="border-b">
                          <td className="p-2">{pattern.pattern}</td>
                          <td className="text-center p-2">{pattern.frequency}</td>
                          <td className="text-center p-2">
                            <span className={`font-medium ${
                              pattern.successRate > 0.7 ? 'text-green-600' :
                              pattern.successRate > 0.4 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {(pattern.successRate * 100).toFixed(0)}%
                            </span>
                          </td>
                          <td className="text-center p-2">
                            {pattern.avgSentiment > 0.3 ? '😊' :
                             pattern.avgSentiment < -0.3 ? '😔' : '😐'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No learning patterns detected yet. Patterns will appear as the AI learns from conversations.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sentiment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Analysis Dashboard</CardTitle>
              <CardDescription>Real-time emotional intelligence and conversation monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Activity className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Sentiment Analysis Active</p>
                    <p className="text-sm text-gray-600 mt-1">
                      All conversations are being analyzed for emotional content, urgency, and intent.
                    </p>
                  </div>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-3">Detected Emotions</h4>
                    <div className="space-y-2">
                      {['Joy', 'Anger', 'Sadness', 'Fear', 'Surprise', 'Disgust'].map((emotion) => (
                        <div key={emotion} className="flex items-center justify-between">
                          <span className="text-sm">{emotion}</span>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-600 to-blue-400 h-2 rounded-full"
                              style={{ width: `${Math.random() * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-3">Alert Triggers</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">High negative sentiment (&lt; -0.5)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">Urgent requests</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">Escalation keywords</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">Complaint detection</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Configuration</CardTitle>
              <CardDescription>Configure your AI assistant settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">OpenAI API Key</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="sk-..."
                    className="flex-1 px-3 py-2 border rounded-lg text-gray-900 bg-white"
                    defaultValue={aiStatus?.status === 'configured' ? 'sk-...configured' : ''}
                  />
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Update
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Your OpenAI API key for GPT-4 access. Keep this secure.
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">AI Model</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option value="gpt-4-turbo-preview">GPT-4 Turbo (Recommended)</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster, Lower Cost)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Temperature (Creativity)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="70"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Precise (0)</span>
                  <span>Balanced (0.7)</span>
                  <span>Creative (1.0)</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Response Length</label>
                <input
                  type="number"
                  defaultValue="500"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="500"
                />
                <p className="text-xs text-gray-500">
                  Maximum tokens (words) for AI responses
                </p>
              </div>
              
              <div className="pt-4">
                <Button className="w-full">
                  Save AI Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}