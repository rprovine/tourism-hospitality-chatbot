'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, User, Clock, ChevronRight, Star, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Conversation {
  id: string
  user: string
  lastMessage: string
  timestamp: string
  status: 'active' | 'resolved' | 'pending'
  satisfaction?: number
  messages: number
}

interface ConversationsListProps {
  limit?: number
}

export default function ConversationsList({ limit }: ConversationsListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        // Map API data to component format
        const formattedConversations = data.conversations?.map((conv: any) => ({
          id: conv.id,
          user: conv.sessionId || 'Guest User',
          lastMessage: conv.lastMessage || 'No messages yet',
          timestamp: conv.updatedAt ? getRelativeTime(new Date(conv.updatedAt)) : 'Recently',
          status: conv.status || 'active',
          satisfaction: conv.satisfactionScore,
          messages: conv.messageCount || 0
        })) || []
        
        // Apply limit if specified
        const displayConversations = limit 
          ? formattedConversations.slice(0, limit)
          : formattedConversations
          
        setConversations(displayConversations)
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 60) return `${minutes} minutes ago`
    if (hours < 24) return `${hours} hours ago`
    return `${days} days ago`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50'
      case 'resolved':
        return 'text-gray-600 bg-gray-50'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading conversations...
      </div>
    )
  }

  // Show empty state when no conversations
  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
        <p className="text-gray-500">
          When customers start chatting with your widget, their conversations will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {conversations.map((conversation) => (
        <div key={conversation.id} className="p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {conversation.user}
                  </p>
                  <div className="flex items-center space-x-2">
                    {conversation.satisfaction && (
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < (conversation.satisfaction || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(conversation.status)}`}>
                      {conversation.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {conversation.lastMessage}
                </p>
                <div className="flex items-center mt-2 text-xs text-gray-400">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{conversation.timestamp}</span>
                  <span className="mx-2">•</span>
                  <MessageSquare className="h-3 w-3 mr-1" />
                  <span>{conversation.messages} messages</span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-4 flex-shrink-0"
            >
              View
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      ))}
      
      {/* Show "View All" button if limited */}
      {limit && conversations.length === limit && (
        <div className="p-4">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.location.href = '/conversations'}
          >
            View All Conversations
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}