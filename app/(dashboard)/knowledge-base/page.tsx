'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { LoadingState } from '@/components/ui/loading-state'
import { 
  Upload,
  FileText,
  Globe,
  FileSpreadsheet,
  Download,
  Trash2,
  Plus,
  Search,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Loader2,
  Link as LinkIcon,
  Database,
  File,
  X,
  Edit,
  Save,
  Activity,
  Lock
} from 'lucide-react'
import { getTierLimit } from '@/lib/tierRestrictions'
import Link from 'next/link'

interface KnowledgeItem {
  id: string
  category: string
  question: string
  answer: string
  keywords: string
  priority?: number
  language?: string
  usageCount: number
  lastUsed: string
  isActive: boolean
  createdAt: string
}

export default function KnowledgeBasePage() {
  const [items, setItems] = useState<KnowledgeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null)
  const [businessTier, setBusinessTier] = useState<string>('starter')
  const [itemLimit, setItemLimit] = useState<number>(50)
  const [newItem, setNewItem] = useState({
    question: '',
    answer: '',
    category: 'general',
    keywords: '',
    priority: 0,
    language: 'en'
  })
  const [uploadType, setUploadType] = useState<'manual' | 'file' | 'url'>('manual')
  const [fileUrl, setFileUrl] = useState('')

  useEffect(() => {
    // Get business tier for limits
    const businessData = localStorage.getItem('business')
    if (businessData) {
      const business = JSON.parse(businessData)
      const tier = business.tier || 'starter'
      setBusinessTier(tier)
      const limit = getTierLimit(tier, 'knowledgeBaseItems')
      setItemLimit(limit === -1 ? 999999 : limit) // -1 means unlimited
    }
    fetchKnowledgeBase()
  }, [])

  const fetchKnowledgeBase = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        setLoading(false)
        return
      }
      
      const response = await fetch('/api/knowledge-base', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        // Ensure data is an array
        const itemsArray = Array.isArray(data) ? data : (data.items || data.data || [])
        setItems(itemsArray)
      }
    } catch (error) {
      console.error('Failed to fetch knowledge base:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Check file type and validate
    const fileName = file.name.toLowerCase()
    
    // Define tier-based file support
    const tierFileSupport: Record<string, string[]> = {
      starter: ['.csv', '.json', '.txt'],
      professional: ['.csv', '.json', '.txt', '.xlsx', '.xls'],
      premium: ['.csv', '.json', '.txt', '.xlsx', '.xls', '.pdf'],
      enterprise: ['.csv', '.json', '.txt', '.xlsx', '.xls', '.pdf', '.docx', '.pptx']
    }
    
    const allowedExtensions = tierFileSupport[businessTier] || tierFileSupport.starter
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'))
    const isValidFile = allowedExtensions.includes(fileExtension)
    
    // Check if file type requires upgrade
    if (!isValidFile) {
      let upgradeMessage = ''
      if ((fileExtension === '.xlsx' || fileExtension === '.xls') && businessTier === 'starter') {
        upgradeMessage = 'Excel files are available in Professional tier and above. Please upgrade to upload Excel files.'
      } else if (fileExtension === '.pdf' && (businessTier === 'starter' || businessTier === 'professional')) {
        upgradeMessage = 'PDF files are available in Premium tier and above. Please upgrade to upload PDF files.'
      } else if ((fileExtension === '.docx' || fileExtension === '.pptx') && businessTier !== 'enterprise') {
        upgradeMessage = 'Word and PowerPoint files are available in Enterprise tier. Please upgrade to upload these files.'
      } else {
        upgradeMessage = `File type ${fileExtension} is not supported. Please upload: ${allowedExtensions.join(', ')}`
      }
      
      alert(upgradeMessage)
      e.target.value = ''
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    
    // Determine format based on file extension
    let format = 'csv'
    if (fileName.endsWith('.json')) {
      format = 'json'
    } else if (fileName.endsWith('.txt')) {
      format = 'txt'
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      format = fileName.endsWith('.xlsx') ? 'xlsx' : 'xls'
    } else if (fileName.endsWith('.pdf')) {
      format = 'pdf'
    } else if (fileName.endsWith('.docx')) {
      format = 'docx'
    } else if (fileName.endsWith('.pptx')) {
      format = 'pptx'
    }
    
    formData.append('format', format)
    formData.append('mode', 'append') // or 'replace' based on user preference

    try {
      const response = await fetch('/api/knowledge-base/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`
        },
        body: formData
      })
      
      const data = await response.json()

      if (response.ok) {
        alert(`Successfully imported ${data.imported} items!`)
        await fetchKnowledgeBase()
        // Clear the file input
        e.target.value = ''
      } else {
        console.error('Upload error:', data)
        
        // Check if it's a tier restriction error
        if (response.status === 403 && data.upgrade) {
          const upgradeMessage = data.message || data.error
          if (confirm(`${upgradeMessage}\n\nWould you like to view upgrade options?`)) {
            window.location.href = '/subscription'
          }
        } else {
          alert(data.error || 'Failed to upload file')
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload file. Please check the file format and try again.')
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
      const response = await fetch('/api/knowledge-base/import-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`
        },
        body: JSON.stringify({ url: fileUrl, type: 'webscrape' })
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message || 'Website content imported successfully!')
        setFileUrl('')
        await fetchKnowledgeBase()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to import website content')
      }
    } catch (error) {
      console.error('Import error:', error)
      alert('Failed to import website content')
    } finally {
      setUploading(false)
    }
  }

  const addManualItem = async () => {
    if (!newItem.question || !newItem.answer) {
      alert('Please fill in both question and answer')
      return
    }
    
    // Check tier limits
    if (items.length >= itemLimit) {
      alert(`You've reached your knowledge base limit of ${itemLimit} items. Please upgrade to add more.`)
      return
    }

    try {
      const response = await fetch('/api/knowledge-base', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`
        },
        body: JSON.stringify(newItem)
      })

      if (response.ok) {
        alert('Item added successfully!')
        setNewItem({ question: '', answer: '', category: 'general', keywords: '', priority: 0, language: 'en' })
        await fetchKnowledgeBase()
      } else {
        alert('Failed to add item')
      }
    } catch (error) {
      console.error('Add error:', error)
      alert('Failed to add item')
    }
  }

  const handleEdit = (item: KnowledgeItem) => {
    setEditingItem(item)
    setNewItem({
      question: item.question,
      answer: item.answer,
      category: item.category || 'general',
      keywords: item.keywords || '',
      priority: item.priority || 0,
      language: item.language || 'en'
    })
  }

  const handleUpdate = async () => {
    if (!editingItem) return
    
    try {
      const response = await fetch('/api/knowledge-base', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`
        },
        body: JSON.stringify({
          id: editingItem.id,
          ...newItem,
          isActive: true
        })
      })

      if (response.ok) {
        setNewItem({
          question: '',
          answer: '',
          category: 'general',
          keywords: '',
          priority: 0,
          language: 'en'
        })
        setEditingItem(null)
        await fetchKnowledgeBase()
        alert('Item updated successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update item')
      }
    } catch (error) {
      console.error('Update error:', error)
      alert('Failed to update item')
    }
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`/api/knowledge-base?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`
        }
      })

      if (response.ok) {
        await fetchKnowledgeBase()
      } else {
        alert('Failed to delete item')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete item')
    }
  }

  const exportKnowledgeBase = async () => {
    try {
      const response = await fetch('/api/knowledge-base/export', {
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `knowledge-base-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export knowledge base')
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.keywords.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const categories = ['all', ...Array.from(new Set(items.map(item => item.category)))]

  if (loading) {
    return <LoadingState message="Loading knowledge base..." size="lg" />
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
            <p className="text-gray-600 mt-1">Train your AI assistant with custom knowledge</p>
          </div>
          <Button onClick={exportKnowledgeBase} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>
      
      {/* Tier Limit Alert */}
      {businessTier === 'starter' && (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <div className="flex items-center justify-between w-full">
            <div>
              <p className="font-semibold text-gray-900">Knowledge Base Limit</p>
              <p className="text-sm text-gray-800 font-medium">
                You&apos;re using {items.length} of {itemLimit} available items in your {businessTier} plan.
                {items.length >= itemLimit * 0.8 && ' Consider upgrading for more capacity.'}
              </p>
            </div>
            {items.length >= itemLimit * 0.8 && (
              <Link href="/subscription">
                <Button variant="outline" size="sm">
                  Upgrade
                </Button>
              </Link>
            )}
          </div>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Items</CardTitle>
            <Database className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{items.length}</div>
            {itemLimit !== 999999 && (
              <p className="text-xs text-gray-600">of {itemLimit} allowed</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Categories</CardTitle>
            <BookOpen className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{categories.length - 1}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Active Items</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{items.filter(i => i.isActive).length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Usage</CardTitle>
            <Activity className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {items.reduce((sum, item) => sum + item.usageCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add Knowledge</CardTitle>
          <CardDescription>Import data from various sources to train your AI</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={uploadType} onValueChange={(v: any) => setUploadType(v)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="file">File Upload</TabsTrigger>
              <TabsTrigger value="url">Web Scraping</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Question</label>
                  <Input
                    placeholder="What is your check-in time?"
                    value={newItem.question}
                    onChange={(e) => setNewItem({...newItem, question: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    placeholder="general, booking, amenities..."
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Answer</label>
                <textarea
                  className="w-full p-3 border rounded-lg"
                  rows={3}
                  placeholder="Our standard check-in time is 3:00 PM..."
                  value={newItem.answer}
                  onChange={(e) => setNewItem({...newItem, answer: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Keywords (comma-separated)</label>
                <Input
                  placeholder="check-in, arrival, time"
                  value={newItem.keywords}
                  onChange={(e) => setNewItem({...newItem, keywords: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={editingItem ? handleUpdate : addManualItem} className="flex-1">
                  {editingItem ? (
                    <><Save className="h-4 w-4 mr-2" />Update Item</>
                  ) : (
                    <><Plus className="h-4 w-4 mr-2" />Add to Knowledge Base</>
                  )}
                </Button>
                {editingItem && (
                  <Button variant="outline" onClick={() => {
                    setEditingItem(null)
                    setNewItem({
                      question: '',
                      answer: '',
                      category: 'general',
                      keywords: '',
                      priority: 0,
                      language: 'en'
                    })
                  }}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="file" className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Upload your files to import knowledge</p>
                <p className="text-sm text-gray-500 mb-4">
                  {businessTier === 'starter' && 'Supported formats: CSV, JSON, TXT'}
                  {businessTier === 'professional' && 'Supported formats: CSV, JSON, TXT, Excel (XLSX, XLS)'}
                  {businessTier === 'premium' && 'Supported formats: CSV, JSON, TXT, Excel, PDF'}
                  {businessTier === 'enterprise' && 'Supported formats: CSV, JSON, TXT, Excel, PDF, Word, PowerPoint'}
                </p>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept={
                    businessTier === 'enterprise' ? '.csv,.json,.txt,.xlsx,.xls,.pdf,.docx,.pptx' :
                    businessTier === 'premium' ? '.csv,.json,.txt,.xlsx,.xls,.pdf' :
                    businessTier === 'professional' ? '.csv,.json,.txt,.xlsx,.xls' :
                    '.csv,.json,.txt'
                  }
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <label htmlFor="file-upload">
                  <Button disabled={uploading} className="cursor-pointer" type="button" onClick={() => document.getElementById('file-upload')?.click()}>
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Choose File
                      </>
                    )}
                  </Button>
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg relative">
                  <FileSpreadsheet className="h-8 w-8 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium">CSV/JSON/TXT</p>
                    <p className="text-xs text-gray-500">Basic formats</p>
                  </div>
                  <Badge className="text-xs bg-green-100 text-green-800 border-green-200">All tiers</Badge>
                </div>
                <div className={`flex items-center gap-3 p-3 border rounded-lg relative ${businessTier === 'starter' ? 'opacity-50' : ''}`}>
                  <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium">Excel Files</p>
                    <p className="text-xs text-gray-500">XLSX, XLS</p>
                  </div>
                  {businessTier === 'starter' ? (
                    <Badge className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">Pro+</Badge>
                  ) : (
                    <Badge className="text-xs bg-green-100 text-green-800 border-green-200">Available</Badge>
                  )}
                </div>
                <div className={`flex items-center gap-3 p-3 border rounded-lg relative ${businessTier === 'starter' || businessTier === 'professional' ? 'opacity-50' : ''}`}>
                  <FileText className="h-8 w-8 text-red-600" />
                  <div className="flex-1">
                    <p className="font-medium">PDF Files</p>
                    <p className="text-xs text-gray-500">Extract Q&As</p>
                  </div>
                  {businessTier === 'starter' || businessTier === 'professional' ? (
                    <Badge className="text-xs bg-purple-100 text-purple-800 border-purple-200">Premium</Badge>
                  ) : (
                    <Badge className="text-xs bg-green-100 text-green-800 border-green-200">Available</Badge>
                  )}
                </div>
              </div>
              
              {businessTier === 'starter' && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Upgrade for More File Types</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 space-y-1">
                      <div>📊 <strong>Professional:</strong> Add Excel file support</div>
                      <div>📄 <strong>Premium:</strong> Add PDF extraction</div>
                      <div>🏢 <strong>Enterprise:</strong> Word, PowerPoint & more</div>
                    </div>
                    <Link href="/subscription">
                      <Button size="sm" className="mt-3">View Upgrade Options</Button>
                    </Link>
                  </AlertDescription>
                </Alert>
              )}
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>File Format Examples</AlertTitle>
                <AlertDescription className="mt-2 space-y-2">
                  <div>
                    <strong>CSV:</strong> question,answer,category<br/>
                    "What time is check-in?","Check-in is at 3 PM","general"
                  </div>
                  <div>
                    <strong>JSON:</strong> [{"{'question': 'What time?', 'answer': 'At 3 PM'}"}]
                  </div>
                  <div>
                    <strong>TXT:</strong><br/>
                    Q: What time is check-in?<br/>
                    A: Check-in is at 3 PM
                  </div>
                  {(businessTier === 'professional' || businessTier === 'premium' || businessTier === 'enterprise') && (
                    <div>
                      <strong>Excel (XLSX/XLS):</strong><br/>
                      Column headers: question | answer | category | keywords<br/>
                      Data rows with your Q&A pairs
                    </div>
                  )}
                  {(businessTier === 'premium' || businessTier === 'enterprise') && (
                    <div>
                      <strong>PDF:</strong><br/>
                      Q: or Question: prefixes for questions<br/>
                      A: or Answer: prefixes for answers
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="url" className="space-y-4">
              <div>
                <label className="text-sm font-medium">Website URL</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/faq"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
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
                <p className="text-sm text-gray-500 mt-2">
                  Enter a URL to automatically extract and import content from websites
                </p>
              </div>
              
              {/* Import Limitations and Alternatives */}
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="font-semibold text-gray-900">Important: Website Import Limitations</p>
                  <p className="text-sm text-gray-700 mt-2">
                    Some websites may not import successfully due to technical restrictions:
                  </p>
                  <ul className="text-sm text-gray-600 mt-2 ml-4 list-disc space-y-1">
                    <li><strong>Bot Protection:</strong> Sites using Cloudflare, reCAPTCHA, or similar anti-bot measures</li>
                    <li><strong>Dynamic Content:</strong> JavaScript-rendered sites (React, Vue, Angular) that load content after page load</li>
                    <li><strong>Access Restrictions:</strong> Login-required, paywalled, or member-only content</li>
                    <li><strong>Security Policies:</strong> Sites with strict CORS policies or server-side blocking</li>
                  </ul>
                  
                  <div className="mt-4 pt-3 border-t border-yellow-200">
                    <p className="text-sm font-semibold text-gray-800">
                      Alternative Methods If URL Import Fails:
                    </p>
                    <div className="mt-2 space-y-2">
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">1. Manual Entry (Recommended for precision):</span>
                        <p className="text-gray-600 ml-3">Switch to the "Manual" tab to add Q&As individually with complete control over content and categories.</p>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">2. CSV Upload (Best for bulk import):</span>
                        <p className="text-gray-600 ml-3">Create a spreadsheet with columns: question, answer, category, keywords. Save as CSV and upload via the "File Upload" tab.</p>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">3. Copy & Paste Method:</span>
                        <p className="text-gray-600 ml-3">Copy text directly from the website and create custom Q&As in the Manual tab.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                    <p className="text-sm text-green-800">
                      💡 <strong>Best Results:</strong> Public FAQ pages, documentation sites, and static HTML pages typically import successfully.
                    </p>
                  </div>
                </div>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Knowledge Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Knowledge Items</CardTitle>
              <CardDescription>Manage your AI training data</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search knowledge..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No knowledge items found</p>
                <p className="text-sm text-gray-400 mt-1">Add some items to get started</p>
              </div>
            ) : (
              filteredItems.map(item => (
                <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{item.question}</h3>
                        <Badge variant={item.isActive ? 'default' : 'secondary'}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{item.answer}</p>
                      {item.keywords && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {item.keywords.split(',').map((keyword, i) => (
                            <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {keyword.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Used {item.usageCount} times</span>
                        {item.lastUsed && <span>Last used: {new Date(item.lastUsed).toLocaleDateString()}</span>}
                        <span>Added: {new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}