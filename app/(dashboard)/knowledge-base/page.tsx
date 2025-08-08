'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
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
  Link,
  Database,
  File,
  X,
  Edit,
  Save,
  Activity
} from 'lucide-react'

interface KnowledgeItem {
  id: string
  category: string
  question: string
  answer: string
  keywords: string
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
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [newItem, setNewItem] = useState({
    question: '',
    answer: '',
    category: 'general',
    keywords: ''
  })
  const [uploadType, setUploadType] = useState<'manual' | 'file' | 'url'>('manual')
  const [fileUrl, setFileUrl] = useState('')

  useEffect(() => {
    fetchKnowledgeBase()
  }, [])

  const fetchKnowledgeBase = async () => {
    try {
      const response = await fetch('/api/knowledge-base', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setItems(data)
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
        alert('File uploaded successfully!')
        await fetchKnowledgeBase()
      } else {
        alert('Failed to upload file')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload file')
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
        await fetchKnowledgeBase()
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

  const addManualItem = async () => {
    if (!newItem.question || !newItem.answer) {
      alert('Please fill in both question and answer')
      return
    }

    try {
      const response = await fetch('/api/knowledge-base', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newItem)
      })

      if (response.ok) {
        alert('Item added successfully!')
        setNewItem({ question: '', answer: '', category: 'general', keywords: '' })
        await fetchKnowledgeBase()
      } else {
        alert('Failed to add item')
      }
    } catch (error) {
      console.error('Add error:', error)
      alert('Failed to add item')
    }
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`/api/knowledge-base?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
        </div>
      </div>
    )
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length - 1}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Items</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.filter(i => i.isActive).length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
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
              <Button onClick={addManualItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add to Knowledge Base
              </Button>
            </TabsContent>
            
            <TabsContent value="file" className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Upload your files to import knowledge</p>
                <p className="text-sm text-gray-500 mb-4">
                  Supported formats: CSV, PDF, XLSX, DOCX, TXT
                </p>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".csv,.pdf,.xlsx,.docx,.txt"
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
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <FileSpreadsheet className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium">Spreadsheet</p>
                    <p className="text-xs text-gray-500">CSV, XLSX files</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium">Documents</p>
                    <p className="text-xs text-gray-500">PDF, DOCX files</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <File className="h-8 w-8 text-gray-600" />
                  <div>
                    <p className="font-medium">Text Files</p>
                    <p className="text-xs text-gray-500">TXT, MD files</p>
                  </div>
                </div>
              </div>
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
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Web Scraping Tips</p>
                    <ul className="text-sm text-blue-700 mt-1 space-y-1">
                      <li>• Ensure you have permission to scrape the website</li>
                      <li>• FAQ and documentation pages work best</li>
                      <li>• Content will be automatically parsed and structured</li>
                    </ul>
                  </div>
                </div>
              </div>
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
                      <Button variant="ghost" size="sm">
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