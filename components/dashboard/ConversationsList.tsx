'use client'

import { useState } from 'react'
import { MessageSquare, User, Clock, ChevronRight, Star } from 'lucide-react'
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
  const [conversations] = useState<Conversation[]>([
    {
      id: '1',
      user: 'John Smith',
      lastMessage: 'Can I book a room for next weekend?',
      timestamp: '5 minutes ago',
      status: 'active',
      satisfaction: 5,
      messages: 8
    },
    {
      id: '2',
      user: 'Maria Garcia',
      lastMessage: 'What activities do you recommend for families?',
      timestamp: '15 minutes ago',
      status: 'resolved',
      satisfaction: 4,
      messages: 12
    },
    {
      id: '3',
      user: 'Takeshi Yamamoto',
      lastMessage: 'ありがとうございました',
      timestamp: '1 hour ago',
      status: 'resolved',
      satisfaction: 5,
      messages: 6
    },
    {
      id: '4',
      user: 'Sarah Johnson',
      lastMessage: 'Do you have airport shuttle service?',
      timestamp: '2 hours ago',
      status: 'pending',
      messages: 3
    },
    {
      id: '5',
      user: 'Robert Chen',
      lastMessage: 'I need to modify my reservation',
      timestamp: '3 hours ago',
      status: 'resolved',
      satisfaction: 4,
      messages: 15
    },
    {
      id: '6',
      user: 'Emily Wilson',
      lastMessage: 'What time is breakfast served?',
      timestamp: '4 hours ago',
      status: 'resolved',
      satisfaction: 5,
      messages: 4
    },
    {
      id: '7',
      user: 'Michael Brown',
      lastMessage: 'Is the pool heated?',
      timestamp: '5 hours ago',
      status: 'resolved',
      satisfaction: 5,
      messages: 5
    },
    {
      id: '8',
      user: 'Lisa Anderson',
      lastMessage: 'Can you recommend restaurants nearby?',
      timestamp: '6 hours ago',
      status: 'resolved',
      satisfaction: 4,
      messages: 9
    }
  ])

  const displayConversations = limit ? conversations.slice(0, limit) : conversations

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'resolved':
        return 'bg-gray-100 text-gray-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-2">
      {displayConversations.map((conversation) => (
        <div
          key={conversation.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg border hover:border-cyan-200 transition-colors cursor-pointer"
        >
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900">{conversation.user}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(conversation.status)}`}>
                  {conversation.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{conversation.lastMessage}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {conversation.timestamp}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {conversation.messages} messages
                </span>
                {conversation.satisfaction && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    {conversation.satisfaction}/5
                  </span>
                )}
              </div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      ))}
      
      {limit && conversations.length > limit && (
        <div className="text-center pt-4">
          <Button variant="outline">
            View All Conversations
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}