'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { ChatMessage } from '@/lib/types'
import { getOrCreateSessionId } from '@/lib/utils/session'

interface ChatWidgetProps {
  tier: 'starter' | 'professional'
  businessName?: string
  primaryColor?: string
  welcomeMessage?: string
}

export default function ChatWidget({
  tier = 'starter',
  businessName = 'Aloha Resort',
  primaryColor = '#0891b2',
  welcomeMessage = 'Aloha! How can I help you today?',
  autoOpen = false,
  initialQuestion = ''
}: ChatWidgetProps & { autoOpen?: boolean; initialQuestion?: string }) {
  const [isOpen, setIsOpen] = useState(autoOpen)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState(initialQuestion)
  const [isTyping, setIsTyping] = useState(false)
  const [hasAutoSent, setHasAutoSent] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Initialize session ID on mount
    const id = getOrCreateSessionId()
    setSessionId(id)
  }, [])

  useEffect(() => {
    if (initialQuestion && isOpen && !hasAutoSent) {
      // Automatically send the initial question after a short delay
      const timer = setTimeout(() => {
        if (input.trim()) {
          handleSend()
          setHasAutoSent(true)
        }
      }, 500)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialQuestion, hasAutoSent])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      // Call the API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          sessionId: sessionId,
          tier: tier,
          conversationId: conversationId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      // Store conversation ID for future messages
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId)
      }
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      // Fallback to local response generation
      const response = generateResponse(input, tier)
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const generateResponse = (query: string, tier: string) => {
    const lowerQuery = query.toLowerCase()
    
    if (tier === 'starter') {
      if (lowerQuery.includes('check') && lowerQuery.includes('in')) {
        return 'Check-in time is 3:00 PM and check-out is 11:00 AM. Early check-in may be available upon request.'
      }
      if (lowerQuery.includes('parking')) {
        return 'We offer both self-parking ($25/day) and valet parking ($35/day). Electric vehicle charging stations are available.'
      }
      if (lowerQuery.includes('breakfast') || lowerQuery.includes('food')) {
        return 'Continental breakfast is served from 6:30 AM to 10:30 AM in our Ocean View Restaurant.'
      }
      if (lowerQuery.includes('wifi') || lowerQuery.includes('internet')) {
        return 'Complimentary high-speed WiFi is available throughout the property.'
      }
      return "I'd be happy to help! For specific questions, please contact our front desk at (808) 555-0100."
    } else {
      // Professional tier with more advanced responses
      if (lowerQuery.includes('book') || lowerQuery.includes('reserve')) {
        return "I can help you make a reservation! What dates were you looking to stay with us? I can check availability and provide you with our best rates."
      }
      if (lowerQuery.includes('recommend') || lowerQuery.includes('what to do')) {
        return "Based on your interests, I'd recommend visiting Pearl Harbor in the morning, followed by lunch at Rainbow Drive-In. In the afternoon, enjoy snorkeling at Hanauma Bay. Would you like me to help arrange any of these activities?"
      }
      if (lowerQuery.includes('weather')) {
        return "Today's forecast shows sunny skies with a high of 82°F (28°C) and gentle trade winds. Perfect beach weather! UV index is high, so don't forget sunscreen."
      }
      if (lowerQuery.includes('restaurant')) {
        return "I'd be happy to make restaurant recommendations! For fine dining, try La Mer or Orchids. For local cuisine, Helena's Hawaiian Food is excellent. Would you like me to make a reservation?"
      }
      return "I understand you're asking about " + query + ". Let me provide you with detailed information and help you with that right away."
    }
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110"
            style={{ backgroundColor: primaryColor }}
          >
            <MessageCircle className="h-6 w-6 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[380px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between p-4 text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">{businessName}</h3>
                  <p className="text-xs opacity-90">
                    {tier === 'professional' ? 'AI Concierge' : 'Virtual Assistant'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'flex',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl px-4 py-2',
                        message.role === 'user'
                          ? 'bg-cyan-600 text-white'
                          : 'bg-white text-gray-800 shadow-sm'
                      )}
                      style={{
                        backgroundColor: message.role === 'user' ? primaryColor : undefined
                      }}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 animation-delay-0"></span>
                        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 animation-delay-200"></span>
                        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 animation-delay-400"></span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="border-t bg-white p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="rounded-lg p-2 text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              {tier === 'professional' && (
                <div className="mt-2 flex gap-2">
                  <button className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 font-medium hover:bg-gray-200">
                    Book a Room
                  </button>
                  <button className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 font-medium hover:bg-gray-200">
                    Activities
                  </button>
                  <button className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 font-medium hover:bg-gray-200">
                    Dining
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-6px);
          }
        }
        .animation-delay-0 {
          animation-delay: 0ms;
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-400 {
          animation-delay: 400ms;
        }
      `}</style>
    </>
  )
}