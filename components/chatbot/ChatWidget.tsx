'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { ChatMessage } from '@/lib/types'
import { getOrCreateSessionId } from '@/lib/utils/session'
import { mockBusinessData, mockKnowledgeBase, mockRealTimeData } from '@/lib/data/mock-business-data'

interface ChatWidgetProps {
  tier: 'starter' | 'professional' | 'premium' | 'enterprise'
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
      
      // Add demo disclaimer if not already present
      const disclaimer = "\n\n[🔸 Demo Mode: Using sample data. In production, this would show YOUR actual business information.]"
      const messageContent = data.message.includes('[🔸 Demo Mode') 
        ? data.message 
        : data.message + disclaimer
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: messageContent,
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

  const generateResponse = (query: string, tierLevel: string) => {
    const lowerQuery = query.toLowerCase()
    const business = mockBusinessData[tierLevel as keyof typeof mockBusinessData]
    const realTime = mockRealTimeData[tierLevel as keyof typeof mockRealTimeData]
    const knowledge = mockKnowledgeBase[tierLevel as keyof typeof mockKnowledgeBase]
    
    // Add demo mode disclaimer
    const disclaimer = "\n\n[🔸 Demo Mode: Using sample data. In production, this would show YOUR actual business information.]"
    
    if (tierLevel === 'starter') {
      // Starter: Basic FAQ only, English only
      if (lowerQuery.includes('room') || lowerQuery.includes('availability')) {
        return `We have rooms available. Please call ${business.contact} to check availability and make a reservation.${disclaimer}`
      }
      if (lowerQuery.includes('check')) {
        return `Check-in time is ${business.checkIn} and check-out is ${business.checkOut}.${disclaimer}`
      }
      if (lowerQuery.includes('price') || lowerQuery.includes('rate')) {
        return `Our rates vary by season. Please call ${business.contact} for current pricing.${disclaimer}`
      }
      if (lowerQuery.includes('cancel')) {
        return `For cancellation policy, please call ${business.contact}.${disclaimer}`
      }
      // Starter limitation - can't handle complex queries
      return `I can only answer basic questions about check-in/out times and contact info. For other inquiries, please call ${business.contact}.${disclaimer}`
    } 
    
    else if (tierLevel === 'professional') {
      // Professional: Booking capability, 2 languages, real-time data
      if (lowerQuery.includes('book') || lowerQuery.includes('reserve')) {
        return `I can help you book! We have ${realTime.availableRooms} rooms available tonight at ${business.name}. 
        
Ocean View Room: $${business.avgRate}/night
Garden View Room: $${business.avgRate - 50}/night

Would you like to proceed with a reservation? I can check specific dates for you.${disclaimer}`
      }
      
      if (lowerQuery.includes('availability') || lowerQuery.includes('tonight')) {
        return `Live Availability at ${business.name}:
• Tonight: ${realTime.availableRooms} rooms available
• Current occupancy: ${realTime.occupancy}%
• Check-ins today: ${realTime.todayCheckIns}
• Check-outs today: ${realTime.todayCheckOuts}

Our best rate tonight is $${business.avgRate}. Shall I reserve a room for you?${disclaimer}`
      }
      
      if (lowerQuery.includes('japanese') || lowerQuery.includes('日本語')) {
        return `はい、日本語でお手伝いできます。${business.name}へようこそ。
        
本日の空室状況：${realTime.availableRooms}室
料金：$${business.avgRate}より

ご予約をご希望ですか？${disclaimer}`
      }
      
      if (lowerQuery.includes('restaurant') || lowerQuery.includes('dining')) {
        return `${business.name} has ${business.restaurants} restaurants:
• Sunset Grill (American) - Open 7am-10pm
• Kai Lounge (Hawaiian) - Open 5pm-midnight

I can make reservations for you. Which would you prefer?${disclaimer}`
      }
      
      return `Welcome to ${business.name}! I can help with:
• Real-time room availability (${realTime.availableRooms} rooms tonight)
• Direct booking at best rates
• Restaurant reservations
• Activity recommendations
• Support in English and Japanese

How may I assist you?${disclaimer}`
    }
    
    else if (tierLevel === 'premium') {
      // Premium: Luxury personalization, 5 languages, VIP services
      if (lowerQuery.includes('suite') || lowerQuery.includes('luxury') || lowerQuery.includes('best')) {
        return `Welcome to ${business.name}! For the ultimate luxury experience:

🏆 **Presidential Suite** - $${business.avgRate * 3}/night
• 2,400 sq ft with panoramic ocean views
• Private butler service 24/7
• Complimentary spa credits ($500 value)
• Private beach cabana included

🌟 **Ocean Villa** - $${business.avgRate * 2}/night
• 1,800 sq ft, private plunge pool
• Daily champagne breakfast
• Priority restaurant reservations

Currently ${realTime.availableSuites} luxury suites available. With ${realTime.vipArrivals} VIP arrivals today, I recommend booking immediately. 

Shall I reserve the Presidential Suite for you?${disclaimer}`
      }
      
      if (lowerQuery.includes('chinese') || lowerQuery.includes('中文')) {
        return `欢迎来到${business.name}！

豪华套房：${realTime.availableSuites}间可用
今晚特价：$${business.avgRate}起
VIP礼遇：免费机场接送、水疗积分、私人管家

需要我为您预订吗？${disclaimer}`
      }
      
      if (lowerQuery.includes('spanish') || lowerQuery.includes('español')) {
        return `¡Bienvenido a ${business.name}!

Suites de lujo disponibles: ${realTime.availableSuites}
Tarifa desde: $${business.avgRate}/noche
Servicios VIP incluidos

¿Le gustaría hacer una reserva?${disclaimer}`
      }
      
      if (lowerQuery.includes('special') || lowerQuery.includes('vip') || lowerQuery.includes('exclusive')) {
        return `As a premium guest at ${business.name}, you have access to:

**Exclusive Experiences:**
• Private yacht charter (3 yachts available)
• Helicopter tour with champagne landing
• Private chef dining (Michelin-starred)
• After-hours shopping at luxury boutiques
• Golf at ${business.golfCourses} championship courses

**Complimentary VIP Services:**
• Rolls-Royce airport transfer
• 24/7 personal butler
• Priority access to all ${business.restaurants} restaurants
• Private beach club membership

Your preferences are saved for personalized service. How may I enhance your stay?${disclaimer}`
      }
      
      return `Welcome to ${business.name} - Hawaii's premier luxury destination.

With ${realTime.occupancy}% occupancy and ${realTime.vipArrivals} VIP arrivals today, our exclusive services are in high demand.

I provide personalized assistance in English, Japanese, Chinese, Spanish, and Korean. I have access to your preferences and can arrange:
• Luxury suite bookings
• Private experiences
• Michelin-star dining
• Yacht and helicopter charters

How may I create magic for you today?${disclaimer}`
    }
    
    else {
      // Enterprise: Multi-property, analytics, full integration
      const properties = (business as any).properties || []
      
      if (lowerQuery.includes('group') || lowerQuery.includes('conference') || lowerQuery.includes('meeting')) {
        return `**${business.name} Group Booking System**

📊 **Multi-Property Availability:**
${properties.slice(0, 3).map((p: string) => `• ${p}: 85-120 rooms`).join('\n')}

**Total Portfolio Capacity:**
• ${(business as any).totalRooms} rooms across ${properties.length} properties
• 15 conference centers (150,000 sq ft)
• Largest ballroom: 1,200 guests

**Current Group Bookings:**
• Tech Summit (Oct 15-20): 450 rooms - $580K
• Medical Conference (Nov 5-8): 320 rooms - $385K

**Your Group Benefits:**
• 15% off for 50+ rooms
• 20% off for 100+ rooms
• Dedicated event coordinator
• Custom F&B packages

I can coordinate across all properties. What are your group requirements?${disclaimer}`
      }
      
      if (lowerQuery.includes('analytics') || lowerQuery.includes('performance') || lowerQuery.includes('revenue')) {
        return `**Real-Time Business Intelligence Dashboard**

📈 **System-Wide Performance:**
• Occupancy: ${realTime.systemOccupancy}% (↑3% vs last week)
• ADR: $${business.avgRate} (↑$15 vs last month)
• RevPAR: $${Math.round(business.avgRate * realTime.systemOccupancy / 100)}
• Revenue Today: $${(realTime.revenueToday / 1000000).toFixed(1)}M

**Property Performance:**
${properties.slice(0, 3).map((p: string, i: number) => 
  `• ${p}: ${85 + i * 3}% occupancy, ADR $${business.avgRate + i * 25}`
).join('\n')}

**Predictive Insights:**
• Peak demand expected next week (+12%)
• Recommend 8% rate increase for optimal yield
• Group booking pipeline: $4.2M (next 90 days)

Full analytics dashboard with drill-down available in your portal.${disclaimer}`
      }
      
      if (lowerQuery.includes('loyalty') || lowerQuery.includes('member')) {
        return `**Paradise Rewards Program Management**

👥 **Program Overview:**
• Total Members: ${(business as any).loyaltyMembers.toLocaleString()}
• Diamond Elite: 850 members
• Point Redemptions Today: 1,250 across all properties

**Member Benefits Across Properties:**
• Diamond: Guaranteed upgrades, club access, 30% discount
• Platinum: Priority check-in, 20% discount
• Gold: Late checkout, 15% discount

**Cross-Property Integration:**
• Points valid at all ${properties.length} properties
• Partner airlines: Hawaiian, United, Delta
• Partner car rentals: Hertz, Avis
• Dining partners: 50+ restaurants

I can look up any member, process upgrades, or analyze loyalty metrics. What do you need?${disclaimer}`
      }
      
      // Show off language capabilities
      if (lowerQuery.includes('language')) {
        return `**Language Support Demonstration:**

🌍 English: Full support with natural language processing
🇯🇵 日本語: 完全な日本語サポート
🇨🇳 中文: 完整的中文支持
🇪🇸 Español: Soporte completo en español
🇰🇷 한국어: 완전한 한국어 지원
🇫🇷 Français: Support complet en français
🇩🇪 Deutsch: Vollständige deutsche Unterstützung
🇵🇹 Português: Suporte completo em português
🇷🇺 Русский: Полная поддержка на русском
🇸🇦 العربية: دعم كامل باللغة العربية

Each language includes cultural customization and local payment methods.${disclaimer}`
      }
      
      return `**${business.name} Enterprise Command Center**

I'm your AI-powered enterprise assistant with access to:

🏨 **${properties.length} Properties** - ${(business as any).totalRooms} total rooms
💰 **Revenue Management** - Real-time pricing optimization
👥 **${(business as any).loyaltyMembers.toLocaleString()} Loyalty Members** - Full CRM integration
📊 **Advanced Analytics** - Predictive modeling & forecasting
🌍 **10+ Languages** - Global guest support
🤝 **Corporate Accounts** - Microsoft, Amazon, Google contracts

Current system status:
• ${realTime.availableRooms} rooms available system-wide
• ${realTime.systemOccupancy}% average occupancy
• ${realTime.groupArrivals} group arrivals tomorrow
• $${(realTime.revenueToday / 1000000).toFixed(1)}M revenue today

I can handle any enterprise hospitality need. What would you like to explore?${disclaimer}`
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
                  <div className="font-semibold">{businessName}</div>
                  <div className="text-xs opacity-90">
                    {tier === 'starter' && 'Basic Support'}
                    {tier === 'professional' && 'Professional AI Assistant'}
                    {tier === 'premium' && 'Premium Concierge AI'}
                    {tier === 'enterprise' && 'Enterprise AI Platform'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] rounded-lg px-4 py-2',
                        message.role === 'user'
                          ? 'bg-cyan-700 text-white'
                          : 'bg-white text-gray-800 shadow-sm'
                      )}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div 
                        className={cn(
                          'mt-1 text-xs',
                          message.role === 'user' ? 'text-cyan-50 opacity-90' : 'text-gray-500'
                        )}
                      >
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="border-t bg-white p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-600 text-white transition-colors hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}