'use client'

import { useState, useEffect } from 'react'
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
  AlertCircle
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

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'es', name: 'Spanish' },
  { code: 'ko', name: 'Korean' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' }
]

export default function KnowledgeBasePage() {
  const [items, setItems] = useState<KnowledgeBaseItem[]>([])
  const [filteredItems, setFilteredItems] = useState<KnowledgeBaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [showModal, setShowModal] = useState(false)
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

  useEffect(() => {
    fetchKnowledgeBase()
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
              <label className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
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
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Languages</option>
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
        </div>

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
                          {LANGUAGES.find(l => l.code === item.language)?.name}
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
                    {LANGUAGES.map(lang => (
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
    </div>
  )
}