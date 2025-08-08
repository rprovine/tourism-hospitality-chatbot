'use client'

import { useState, useEffect } from 'react'
import AdminNav from '@/components/admin/AdminNav'
import { 
  MessageSquare, 
  User, 
  Calendar, 
  Globe, 
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Clock,
  Star
} from 'lucide-react'

interface Conversation {
  id: string
  sessionId: string
  businessId: string
  startedAt: string
  lastMessageAt: string
  messageCount: number
  language: string
  rating?: number
  messages: Message[]
}

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: string
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [expandedConversation, setExpandedConversation] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLanguage, setFilterLanguage] = useState('all')
  const [filterRating, setFilterRating] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      // Use mock data for demo
      const mockConversations: Conversation[] = [
        {
          id: '1',
          sessionId: 'session-1',
          businessId: 'business-1',
          startedAt: new Date(Date.now() - 3600000).toISOString(),
          lastMessageAt: new Date(Date.now() - 1800000).toISOString(),
          messageCount: 5,
          language: 'en',
          rating: 5,
          messages: [
            { id: 'm1', role: 'user', content: 'What time is check-in?', createdAt: new Date(Date.now() - 3600000).toISOString() },
            { id: 'm2', role: 'assistant', content: 'Check-in time is at 3:00 PM. Early check-in may be available based on room availability.', createdAt: new Date(Date.now() - 3500000).toISOString() },
            { id: 'm3', role: 'user', content: 'Can I request early check-in?', createdAt: new Date(Date.now() - 3400000).toISOString() },
            { id: 'm4', role: 'assistant', content: 'Absolutely! You can request early check-in by calling us at 808-555-0123 or noting it in your reservation.', createdAt: new Date(Date.now() - 3300000).toISOString() },
            { id: 'm5', role: 'user', content: 'Perfect, thank you!', createdAt: new Date(Date.now() - 3200000).toISOString() }
          ]
        },
        {
          id: '2',
          sessionId: 'session-2',
          businessId: 'business-1',
          startedAt: new Date(Date.now() - 7200000).toISOString(),
          lastMessageAt: new Date(Date.now() - 7000000).toISOString(),
          messageCount: 3,
          language: 'ja',
          rating: 4,
          messages: [
            { id: 'm6', role: 'user', content: '朝食は含まれていますか？', createdAt: new Date(Date.now() - 7200000).toISOString() },
            { id: 'm7', role: 'assistant', content: 'はい、朝食ビュッフェが含まれています。朝6時30分から10時30分まで提供しています。', createdAt: new Date(Date.now() - 7100000).toISOString() },
            { id: 'm8', role: 'user', content: 'ありがとうございます。', createdAt: new Date(Date.now() - 7000000).toISOString() }
          ]
        },
        {
          id: '3',
          sessionId: 'session-3',
          businessId: 'business-1',
          startedAt: new Date(Date.now() - 86400000).toISOString(),
          lastMessageAt: new Date(Date.now() - 86000000).toISOString(),
          messageCount: 7,
          language: 'en',
          messages: [
            { id: 'm9', role: 'user', content: 'Do you have parking available?', createdAt: new Date(Date.now() - 86400000).toISOString() },
            { id: 'm10', role: 'assistant', content: 'Yes, we offer both self-parking and valet parking. Self-parking is $25/day and valet is $35/day.', createdAt: new Date(Date.now() - 86300000).toISOString() }
          ]
        }
      ]
      
      setConversations(mockConversations)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching conversations:', error)
      setLoading(false)
    }
  }

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = searchTerm === '' || 
      conv.messages.some(msg => msg.content.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesLanguage = filterLanguage === 'all' || conv.language === filterLanguage
    const matchesRating = filterRating === 'all' || 
      (filterRating === 'high' && conv.rating && conv.rating >= 4) ||
      (filterRating === 'low' && conv.rating && conv.rating < 4)
    
    return matchesSearch && matchesLanguage && matchesRating
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `${diffMinutes} minutes ago`
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`
    } else {
      const diffDays = Math.floor(diffHours / 24)
      return `${diffDays} days ago`
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
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
                <MessageSquare className="h-6 w-6 text-cyan-700" />
                <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                  {filteredConversations.length} total
                </span>
              </div>
              
              {/* Filters */}
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                
                <select
                  value={filterLanguage}
                  onChange={(e) => setFilterLanguage(e.target.value)}
                  className="px-4 py-2 border rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="all">All Languages</option>
                  <option value="en">English</option>
                  <option value="ja">Japanese</option>
                  <option value="zh">Chinese</option>
                  <option value="es">Spanish</option>
                </select>
                
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                  className="px-4 py-2 border rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="all">All Ratings</option>
                  <option value="high">4+ Stars</option>
                  <option value="low">Below 4 Stars</option>
                </select>
              </div>
            </div>
          </div>

          {/* Conversations List */}
          <div className="divide-y">
            {filteredConversations.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No conversations found matching your filters
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div key={conversation.id} className="px-6 py-4">
                  <div 
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => setExpandedConversation(
                      expandedConversation === conversation.id ? null : conversation.id
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Session {conversation.sessionId.slice(-8)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{formatDate(conversation.startedAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{conversation.language.toUpperCase()}</span>
                        </div>
                        {conversation.rating && (
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < conversation.rating! ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-700">
                        {conversation.messages[0]?.content || 'No messages'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {conversation.messageCount} messages
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      {expandedConversation === conversation.id ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  
                  {/* Expanded Messages */}
                  {expandedConversation === conversation.id && (
                    <div className="mt-4 space-y-3 bg-gray-50 rounded-lg p-4">
                      {conversation.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              message.role === 'user'
                                ? 'bg-cyan-700 text-white'
                                : 'bg-white text-gray-800 border'
                            }`}
                          >
                            <div className="text-sm">{message.content}</div>
                            <div className={`text-xs mt-1 ${
                              message.role === 'user' ? 'text-cyan-100' : 'text-gray-500'
                            }`}>
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}