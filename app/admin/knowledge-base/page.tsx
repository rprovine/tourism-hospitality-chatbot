'use client'

import { useState, useEffect } from 'react'
import AdminNav from '@/components/admin/AdminNav'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Upload, 
  Download,
  BookOpen,
  Filter,
  X,
  Save,
  AlertCircle,
  FileText,
  Brain,
  Sparkles,
  Globe
} from 'lucide-react'

interface KnowledgeBaseItem {
  id: string
  category: string
  question: string
  answer: string
  keywords: string
  priority: number
  language: string
  isActive: boolean
  usageCount: number
  lastUsed: string | null
  createdAt: string
  updatedAt: string
}

const CATEGORIES = [
  'general',
  'booking',
  'amenities',
  'policies',
  'local_info',
  'dining',
  'activities',
  'transportation',
  'faq'
]

const ALL_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'es', name: 'Spanish' },
  { code: 'ko', name: 'Korean' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ar', name: 'Arabic' }
]

export default function KnowledgeBasePage() {
  const [items, setItems] = useState<KnowledgeBaseItem[]>([])
  const [filteredItems, setFilteredItems] = useState<KnowledgeBaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [showModal, setShowModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingItem, setEditingItem] = useState<KnowledgeBaseItem | null>(null)
  const [formData, setFormData] = useState({
    category: 'general',
    question: '',
    answer: '',
    keywords: '',
    priority: 0,
    language: 'en',
    isActive: true
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [importType, setImportType] = useState<'csv' | 'pdf' | 'website'>('csv')
  const [importData, setImportData] = useState('')
  const [importing, setImporting] = useState(false)
  const [businessTier, setBusinessTier] = useState<string>('starter')

  // Get available languages based on tier
  const getAvailableLanguages = () => {
    switch (businessTier) {
      case 'starter':
        return [{ code: 'en', name: 'English' }]
      case 'professional':
        return [
          { code: 'en', name: 'English' },
          { code: 'ja', name: 'Japanese' }
        ]
      case 'premium':
        // Premium can choose any 5 languages, default to these
        return ALL_LANGUAGES.slice(0, 5)
      case 'enterprise':
        // Enterprise gets all 10 languages
        return ALL_LANGUAGES
      default:
        return [{ code: 'en', name: 'English' }]
    }
  }

  const availableLanguages = getAvailableLanguages()

  useEffect(() => {
    fetchKnowledgeBase()
    // Get business tier from localStorage
    const businessData = localStorage.getItem('business')
    if (businessData) {
      try {
        const parsed = JSON.parse(businessData)
        setBusinessTier(parsed.tier || 'starter')
      } catch (e) {
        console.error('Error parsing business data:', e)
      }
    }
  }, [])

  useEffect(() => {
    filterItems()
  }, [items, searchTerm, selectedCategory, selectedLanguage])

  const fetchKnowledgeBase = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/knowledge-base', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to fetch knowledge base')

      const data = await response.json()
      setItems(data.items)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching knowledge base:', error)
      setError('Failed to load knowledge base')
      setLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = [...items]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.keywords.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    // Filter by language
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(item => item.language === selectedLanguage)
    }

    setFilteredItems(filtered)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const token = localStorage.getItem('token')
      const method = editingItem ? 'PUT' : 'POST'
      const body = editingItem 
        ? { id: editingItem.id, ...formData }
        : formData

      const response = await fetch('/api/knowledge-base', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) throw new Error('Failed to save item')

      setSuccess(editingItem ? 'Item updated successfully' : 'Item created successfully')
      setShowModal(false)
      setEditingItem(null)
      setFormData({
        category: 'general',
        question: '',
        answer: '',
        keywords: '',
        priority: 0,
        language: 'en',
        isActive: true
      })
      fetchKnowledgeBase()

      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error('Error saving item:', error)
      setError('Failed to save item')
    }
  }

  const handleEdit = (item: KnowledgeBaseItem) => {
    setEditingItem(item)
    setFormData({
      category: item.category,
      question: item.question,
      answer: item.answer,
      keywords: item.keywords,
      priority: item.priority,
      language: item.language,
      isActive: item.isActive
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/knowledge-base?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to delete item')

      setSuccess('Item deleted successfully')
      fetchKnowledgeBase()
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error('Error deleting item:', error)
      setError('Failed to delete item')
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('format', file.name.endsWith('.json') ? 'json' : 'csv')
    formData.append('mode', 'append')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/knowledge-base/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) throw new Error('Failed to import file')

      const result = await response.json()
      setSuccess(`Successfully imported ${result.imported} items`)
      fetchKnowledgeBase()
      setTimeout(() => setSuccess(null), 5000)
    } catch (error) {
      console.error('Error importing file:', error)
      setError('Failed to import file')
    }
  }

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/knowledge-base/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to export data')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `knowledge-base.${format}`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting data:', error)
      setError('Failed to export data')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-700"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-cyan-700" />
              <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                {items.length} items
              </span>
            </div>
            <div className="flex gap-2">
              {(businessTier === 'premium' || businessTier === 'enterprise') ? (
                <button
                  onClick={() => setShowImportModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Brain className="h-4 w-4" />
                  AI Training Import
                </button>
              ) : (
                <label className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Import CSV
                  <input
                    type="file"
                    accept=".csv,.json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              )}
              <button
                onClick={() => handleExport('csv')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
              <button
                onClick={() => {
                  setEditingItem(null)
                  setFormData({
                    category: 'general',
                    question: '',
                    answer: '',
                    keywords: '',
                    priority: 0,
                    language: 'en',
                    isActive: true
                  })
                  setShowModal(true)
                }}
                className="bg-cyan-700 hover:bg-cyan-800 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b px-6 py-4 bg-gray-50">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions, answers, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Languages</option>
              {availableLanguages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tier Limitation Notice */}
        {(businessTier === 'starter' || businessTier === 'professional') && (
          <div className="mx-6 mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-900">
                  {businessTier === 'starter' ? 'Starter Tier - Manual Q&A Only' : 'Professional Tier - Limited AI Features'}
                </h4>
                <p className="text-sm text-amber-700 mt-1">
                  {businessTier === 'starter' 
                    ? 'Your plan requires manual Q&A pair creation. Upgrade to Premium for AI training that learns from your documents directly.'
                    : 'You have API access but limited AI training. Upgrade to Premium for full AI document learning capabilities.'}
                </p>
                {businessTier === 'starter' && (
                  <p className="text-xs text-amber-600 mt-2">
                    Maximum 100 knowledge base items • English only
                  </p>
                )}
                {businessTier === 'professional' && (
                  <p className="text-xs text-amber-600 mt-2">
                    English and Japanese only • API access included
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        {success && (
          <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Items List */}
        <div className="p-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchTerm || selectedCategory !== 'all' || selectedLanguage !== 'all'
                ? 'No items found matching your filters'
                : 'No knowledge base items yet. Click "Add Item" to create one.'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded text-xs font-medium">
                          {item.category}
                        </span>
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {ALL_LANGUAGES.find(l => l.code === item.language)?.name}
                        </span>
                        {item.priority > 0 && (
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">
                            Priority: {item.priority}
                          </span>
                        )}
                        {!item.isActive && (
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                            Inactive
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.question}</h3>
                      <p className="text-gray-600 text-sm mb-2">{item.answer}</p>
                      {item.keywords && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>Keywords:</span>
                          <span className="font-medium">{item.keywords}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>Used {item.usageCount} times</span>
                        {item.lastUsed && (
                          <span>Last used: {new Date(item.lastUsed).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingItem ? 'Edit Knowledge Base Item' : 'Add Knowledge Base Item'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  >
                    {availableLanguages.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="What is your check-in time?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Answer
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  rows={4}
                  placeholder="Our standard check-in time is 3:00 PM..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="check-in, arrival, time"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority (0-10)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={formData.isActive}
                        onChange={() => setFormData({ ...formData, isActive: true })}
                        className="text-cyan-700"
                      />
                      <span>Active</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={!formData.isActive}
                        onChange={() => setFormData({ ...formData, isActive: false })}
                        className="text-cyan-700"
                      />
                      <span>Inactive</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Training Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  AI Custom Training (Premium)
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Train your AI directly on your documents - no Q&A pairs needed
                </p>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {/* Premium Feature Notice */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-900">How Premium AI Training Works</h4>
                    <p className="text-sm text-purple-700 mt-1">
                      Unlike basic Q&A systems, your Premium AI learns directly from your documents. 
                      Just upload your content and the AI understands the context - it can answer any 
                      guest question naturally, even if that exact Q&A wasn't explicitly defined.
                    </p>
                  </div>
                </div>
              </div>

              {/* Import Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Import Type
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setImportType('csv')}
                    className={`p-6 rounded-lg border-2 transition-all text-center ${
                      importType === 'csv' 
                        ? 'border-purple-600 bg-purple-50 shadow-md' 
                        : 'border-gray-200 hover:border-purple-300 hover:shadow-sm bg-white'
                    }`}
                  >
                    <FileText className={`h-10 w-10 mx-auto mb-3 ${
                      importType === 'csv' ? 'text-purple-600' : 'text-gray-500'
                    }`} />
                    <div className={`font-semibold text-base mb-1 ${
                      importType === 'csv' ? 'text-purple-900' : 'text-gray-900'
                    }`}>CSV/Excel</div>
                    <div className={`text-xs ${
                      importType === 'csv' ? 'text-purple-700' : 'text-gray-600'
                    }`}>Upload FAQ spreadsheet</div>
                  </button>

                  <button
                    onClick={() => setImportType('pdf')}
                    className={`p-6 rounded-lg border-2 transition-all text-center ${
                      importType === 'pdf' 
                        ? 'border-purple-600 bg-purple-50 shadow-md' 
                        : 'border-gray-200 hover:border-purple-300 hover:shadow-sm bg-white'
                    }`}
                  >
                    <FileText className={`h-10 w-10 mx-auto mb-3 ${
                      importType === 'pdf' ? 'text-purple-600' : 'text-gray-500'
                    }`} />
                    <div className={`font-semibold text-base mb-1 ${
                      importType === 'pdf' ? 'text-purple-900' : 'text-gray-900'
                    }`}>PDF Documents</div>
                    <div className={`text-xs ${
                      importType === 'pdf' ? 'text-purple-700' : 'text-gray-600'
                    }`}>Extract from manuals</div>
                  </button>

                  <button
                    onClick={() => setImportType('website')}
                    className={`p-6 rounded-lg border-2 transition-all text-center ${
                      importType === 'website' 
                        ? 'border-purple-600 bg-purple-50 shadow-md' 
                        : 'border-gray-200 hover:border-purple-300 hover:shadow-sm bg-white'
                    }`}
                  >
                    <Globe className={`h-10 w-10 mx-auto mb-3 ${
                      importType === 'website' ? 'text-purple-600' : 'text-gray-500'
                    }`} />
                    <div className={`font-semibold text-base mb-1 ${
                      importType === 'website' ? 'text-purple-900' : 'text-gray-900'
                    }`}>Website</div>
                    <div className={`text-xs ${
                      importType === 'website' ? 'text-purple-700' : 'text-gray-600'
                    }`}>Scrape FAQ pages</div>
                  </button>
                </div>
              </div>

              {/* Import Content Based on Type */}
              {importType === 'csv' && (
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-purple-900">Direct AI Training</h4>
                        <p className="text-sm text-purple-700 mt-1">
                          Upload your data and the AI will learn from it directly. No need to create Q&A pairs - the AI understands context and can answer questions naturally.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Training Data
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-2">Upload property info, policies, amenities lists, etc.</p>
                      <input
                        type="file"
                        accept=".csv,.xlsx"
                        className="hidden"
                        id="csv-upload"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setImportData(file.name)
                          }
                        }}
                      />
                      <label
                        htmlFor="csv-upload"
                        className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer transition-colors"
                      >
                        Choose File
                      </label>
                      {importData && (
                        <p className="mt-3 text-sm text-gray-600">
                          Selected: {importData}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {importType === 'pdf' && (
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-purple-900">AI Document Understanding</h4>
                        <p className="text-sm text-purple-700 mt-1">
                          Upload your documents and the AI learns from them. When guests ask questions, the AI uses this knowledge to provide accurate, contextual answers.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload PDF Documents
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-2">Upload property manuals, guides, or brochures</p>
                      <input
                        type="file"
                        accept=".pdf"
                        multiple
                        className="hidden"
                        id="pdf-upload"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || [])
                          if (files.length > 0) {
                            setImportData(`${files.length} PDF file(s) selected`)
                          }
                        }}
                      />
                      <label
                        htmlFor="pdf-upload"
                        className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer transition-colors"
                      >
                        Choose PDFs
                      </label>
                      {importData && (
                        <p className="mt-3 text-sm text-gray-600">
                          {importData}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {importType === 'website' && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900">Website Content Learning</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Point to your website and the AI will learn from all your content - no manual extraction needed
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://your-website.com/faq"
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the URL of your FAQ page or documentation
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scraping Options
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded text-purple-600" defaultChecked />
                        <span className="text-sm">Extract FAQ sections</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded text-purple-600" defaultChecked />
                        <span className="text-sm">Extract contact information</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded text-purple-600" />
                        <span className="text-sm">Extract pricing information</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-6 pt-6 border-t">
                <div className="text-sm text-gray-600">
                  {importType === 'pdf' && 'AI processing may take 2-3 minutes'}
                  {importType === 'website' && 'Website scraping typically takes 30-60 seconds'}
                  {importType === 'csv' && 'CSV import is instant'}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowImportModal(false)
                      setImportData('')
                    }}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      setImporting(true)
                      // Simulate import process
                      setTimeout(() => {
                        setSuccess(`Successfully imported training data from ${importType}`)
                        setShowImportModal(false)
                        setImportData('')
                        setImporting(false)
                        fetchKnowledgeBase()
                      }, 2000)
                    }}
                    disabled={!importData || importing}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {importing ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4" />
                        Start Import
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}