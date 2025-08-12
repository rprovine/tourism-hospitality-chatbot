'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Sparkles, Star } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { ChatMessage } from '@/lib/types'
import { getOrCreateSessionId } from '@/lib/utils/session'
interface ChatWidgetProps {
  tier: 'starter' | 'professional' | 'premium' | 'enterprise'
  businessName?: string
  primaryColor?: string
  welcomeMessage?: string
  businessData?: any
  isDemo?: boolean
}

interface QuickAction {
  label: string
  icon: string
  action: string
  tier: string[]
}

// Quick action menu items based on tier
const quickActions: QuickAction[] = [
  { label: 'Check Availability', icon: '🏨', action: 'What rooms are available tonight?', tier: ['starter', 'professional', 'premium', 'enterprise'] },
  { label: 'View Amenities', icon: '🏖️', action: 'What amenities do you offer?', tier: ['starter', 'professional', 'premium', 'enterprise'] },
  { label: 'Get Directions', icon: '📍', action: 'How do I get to your hotel?', tier: ['starter', 'professional', 'premium', 'enterprise'] },
  { label: 'Book a Room', icon: '📅', action: 'I want to book a room', tier: ['professional', 'premium', 'enterprise'] },
  { label: 'Restaurant Info', icon: '🍽️', action: 'Tell me about your restaurants', tier: ['professional', 'premium', 'enterprise'] },
  { label: 'Special Offers', icon: '🎁', action: 'Do you have any special offers?', tier: ['professional', 'premium', 'enterprise'] },
  { label: 'VIP Services', icon: '👑', action: 'What VIP services do you offer?', tier: ['premium', 'enterprise'] },
  { label: 'Concierge', icon: '🎯', action: 'I need concierge assistance', tier: ['premium', 'enterprise'] },
]

export default function ChatWidget({
  tier = 'starter',
  businessName = 'Aloha Resort',
  primaryColor = '#0891b2',
  welcomeMessage = 'Aloha! How can I help you today?',
  businessData = null,
  isDemo = false,
  autoOpen = false,
  initialQuestion = '',
  embedded = false
}: ChatWidgetProps & { autoOpen?: boolean; initialQuestion?: string; embedded?: boolean }) {
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
  const [showRating, setShowRating] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [hasRated, setHasRated] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [showQuickActions, setShowQuickActions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Filter quick actions based on tier
  const availableQuickActions = quickActions.filter(action => action.tier.includes(tier))

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

  const handleQuickAction = (action: string) => {
    setInput(action)
    setShowQuickActions(false)
    // Automatically send the quick action
    setTimeout(() => {
      handleSend(action)
    }, 100)
  }

  const handleSend = async (customInput?: string) => {
    const messageToSend = customInput || input
    if (!messageToSend.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = messageToSend // Store before clearing
    if (!customInput) {
      setInput('')
    }
    setIsTyping(true)
    setShowQuickActions(false)
    
    // Increment message count
    setMessageCount(prev => prev + 1)
    
    // Check if user is providing contact information
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
    const phoneRegex = /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/
    
    const hasEmail = emailRegex.test(currentInput)
    const hasPhone = phoneRegex.test(currentInput)
    const email = hasEmail ? currentInput.match(emailRegex)?.[0] : undefined
    const phone = hasPhone ? currentInput.match(phoneRegex)?.[0] : undefined

    try {
      // Get businessId from URL params or use demo
      const urlParams = new URLSearchParams(window.location.search)
      const businessId = urlParams.get('businessId') || 'demo-business-id'
      
      // For demo mode, use local response generation
      if (businessId === 'demo-business-id' || businessId === 'demo') {
        const response = generateResponse(currentInput, tier)
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
        setIsTyping(false)
        return
      }
      
      // If contact info detected, capture as lead
      if ((hasEmail || hasPhone) && conversationId) {
        // Extract name if provided (common patterns)
        const nameMatch = currentInput.match(/(?:my name is|i'm|i am|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i)
        const name = nameMatch ? nameMatch[1] : undefined
        
        // Send lead capture in background
        fetch('/api/widget/lead', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversationId: conversationId,
            businessId: businessId,
            name: name,
            email: email,
            phone: phone,
            message: currentInput,
            preferredContact: hasEmail && hasPhone ? 'either' : hasEmail ? 'email' : 'phone'
          })
        }).catch(err => console.error('Failed to capture lead:', err))
      }
      
      // Call the widget API with CORS support
      const response = await fetch('/api/widget/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          sessionId: sessionId,
          businessId: businessId,
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
      
      // Don't add any demo disclaimer - let the backend handle it
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
      const response = generateResponse(currentInput, tier)
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

  const handleClose = () => {
    if (embedded && typeof window !== 'undefined' && window.parent !== window) {
      // Send message to parent window to close the widget
      window.parent.postMessage({ type: 'toggle-chat' }, '*')
    } else {
      // Show rating if user has sent at least 2 messages and hasn't rated yet
      if (messageCount >= 2 && !hasRated && conversationId) {
        setShowRating(true)
      } else {
        setIsOpen(false)
      }
    }
  }

  const submitRating = async () => {
    if (!conversationId || rating === 0) return

    try {
      const response = await fetch('/api/widget/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: conversationId,
          rating: rating,
          feedback: feedback.trim() || undefined
        })
      })

      if (response.ok) {
        setHasRated(true)
        // Show thank you message then close
        setTimeout(() => {
          setShowRating(false)
          setIsOpen(false)
        }, 2000)
      }
    } catch (error) {
      console.error('Failed to submit rating:', error)
      // Close anyway
      setShowRating(false)
      setIsOpen(false)
    }
  }

  const skipRating = () => {
    setShowRating(false)
    setIsOpen(false)
  }

  const generateResponse = (query: string, tierLevel: string) => {
    const lowerQuery = query.toLowerCase()
    
    // Use real business data if available, otherwise return a message to configure data
    if (!businessData && !isDemo) {
      return "Please configure your business information in Settings to provide accurate responses. The chatbot needs your business details to answer guest questions."
    }
    
    // For demo mode, load mock data
    let business: any = businessData || {}
    let realTime: any = {}
    let knowledge: any = {}
    
    if (isDemo) {
      // Only load mock data for demo accounts
      const { mockBusinessData, mockRealTimeData, mockKnowledgeBase } = require('@/lib/data/mock-business-data')
      business = mockBusinessData[tierLevel as keyof typeof mockBusinessData] || {}
      realTime = mockRealTimeData[tierLevel as keyof typeof mockRealTimeData] || {}
      knowledge = mockKnowledgeBase[tierLevel as keyof typeof mockKnowledgeBase] || {}
    }
    
    const disclaimer = isDemo 
      ? "\n\n[🔸 Demo Mode: Using sample data. In production, this would show YOUR actual business information.]"
      : ""
    
    if (tierLevel === 'starter') {
      // Starter: Basic FAQ only, NO integrations
      if (lowerQuery.includes('book') || lowerQuery.includes('reserve')) {
        return `❌ **Booking Integration Not Available in Starter Plan**\n\nTo make a reservation, please call ${'contact' in business ? business.contact : '815-641-6689'}.\n\n💡 Upgrade to Professional to enable instant bookings right from the chat!${disclaimer}`
      }
      if (lowerQuery.includes('room') || lowerQuery.includes('availability')) {
        return `We have rooms available. Please call ${'contact' in business ? business.contact : '815-641-6689'} to check specific dates.\n\n⚠️ Real-time availability requires Professional plan or higher.${disclaimer}`
      }
      if (lowerQuery.includes('my') || lowerQuery.includes('history') || lowerQuery.includes('stayed')) {
        return `❌ **CRM Integration Not Available**\n\nWe cannot access guest history in the Starter plan. Please call ${'contact' in business ? business.contact : '815-641-6689'} for assistance.\n\n💡 Professional plan includes full CRM integration!${disclaimer}`
      }
      if (lowerQuery.includes('check')) {
        return `Check-in time is ${'checkIn' in business ? business.checkIn : '3:00 PM'} and check-out is ${'checkOut' in business ? business.checkOut : '11:00 AM'}.${disclaimer}`
      }
      if (lowerQuery.includes('price') || lowerQuery.includes('rate')) {
        return `Our rates vary by season. Please call ${'contact' in business ? business.contact : '815-641-6689'} for current pricing.${disclaimer}`
      }
      // Starter limitation - can't handle complex queries
      return `I can only answer basic questions. For bookings or guest services, please call ${'contact' in business ? business.contact : '815-641-6689'}.\n\n⚠️ Limited to basic Q&A in Starter plan.${disclaimer}`
    } 
    
    else if (tierLevel === 'professional') {
      // Professional: Booking + CRM integration
      if (lowerQuery.includes('book') || lowerQuery.includes('reserve')) {
        return `✅ **Live Booking System Connected**\n\n📊 Real-time availability for ${business.name}:\n\n🏨 **Tonight (Dec 15)**\n• Ocean View Room: $${business.avgRate}/night - 3 available\n• Garden View Room: $${business.avgRate - 50}/night - 5 available\n• Suite: $${business.avgRate + 100}/night - 1 available\n\n📅 **Quick Booking**\nClick below to book instantly:\n[Book Ocean View] [Book Garden View] [Book Suite]\n\n✨ Features: Instant confirmation • Secure payment • Mobile check-in${disclaimer}`
      }
      
      if (lowerQuery.includes('my') || lowerQuery.includes('history') || lowerQuery.includes('stayed')) {
        return `✅ **CRM Integration Active**\n\n👤 **Guest Profile Found**\nWelcome back! I can see you're a valued guest.\n\n📊 **Your History:**\n• Last stay: Ocean View Room (Sept 2024)\n• Total stays: 3 visits\n• Loyalty points: 2,450\n• Preferred room: Ocean View, High floor\n\n🎁 **Special Offer:** As a returning guest, enjoy 15% off your next stay!\n\nWould you like to book your preferred Ocean View room?${disclaimer}`
      }
      
      if (lowerQuery.includes('availability') || lowerQuery.includes('tonight')) {
        return `Live Availability at ${business.name}:
• Tonight: ${realTime.availableRooms} rooms available
• Current occupancy: ${'occupancy' in realTime ? realTime.occupancy : 78}%
• Check-ins today: ${'todayCheckIns' in realTime ? realTime.todayCheckIns : 23}
• Check-outs today: ${'todayCheckOuts' in realTime ? realTime.todayCheckOuts : 18}

Our best rate tonight is $${business.avgRate}. Shall I reserve a room for you?${disclaimer}`
      }
      
      if (lowerQuery.includes('japanese') || lowerQuery.includes('日本語')) {
        return `はい、日本語でお手伝いできます。${business.name}へようこそ。
        
本日の空室状況：${realTime.availableRooms}室
料金：$${business.avgRate}より

ご予約をご希望ですか？${disclaimer}`
      }
      
      if (lowerQuery.includes('restaurant') || lowerQuery.includes('dining')) {
        return `${business.name} has ${'restaurants' in business ? business.restaurants : 2} restaurants:
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
      // Premium: Advanced CRM + Luxury Booking + Personalization
      if (lowerQuery.includes('book') || lowerQuery.includes('reserve')) {
        return `✅ **Premium Booking Concierge with AI Recommendations**\n\n🤖 **Based on your preferences and past stays:**\n\n⭐ **Recommended for You:**\n• Presidential Suite - $${business.avgRate * 3}/night\n  *Your favorite: Ocean view, high floor, away from elevators*\n  ✨ Includes: Butler service, spa credits, airport transfer\n\n📊 **Alternative Options:**\n• Ocean Villa (93% match) - $${business.avgRate * 2}/night\n• Penthouse (87% match) - $${business.avgRate * 2.5}/night\n\n💳 **One-Click Booking:**\n[Book with Saved Card ****1234] [Use Points (4,850 available)]\n\n🎁 **VIP Perks Included:**\n• Complimentary room upgrade (when available)\n• Early check-in guaranteed (10 AM)\n• Late checkout guaranteed (4 PM)\n• Welcome champagne & local delicacies\n• Private beach cabana reserved${disclaimer}`
      }
      
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

Currently ${'availableSuites' in realTime ? realTime.availableSuites : 3} luxury suites available. With ${'vipArrivals' in realTime ? realTime.vipArrivals : 3} VIP arrivals today, I recommend booking immediately. 

Shall I reserve the Presidential Suite for you?${disclaimer}`
      }
      
      if (lowerQuery.includes('chinese') || lowerQuery.includes('中文')) {
        return `欢迎来到${business.name}！

豪华套房：${'availableSuites' in realTime ? realTime.availableSuites : 3}间可用
今晚特价：$${business.avgRate}起
VIP礼遇：免费机场接送、水疗积分、私人管家

需要我为您预订吗？${disclaimer}`
      }
      
      if (lowerQuery.includes('spanish') || lowerQuery.includes('español')) {
        return `¡Bienvenido a ${business.name}!

Suites de lujo disponibles: ${'availableSuites' in realTime ? realTime.availableSuites : 3}
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
• Golf at ${'golfCourses' in business ? business.golfCourses : 2} championship courses

**Complimentary VIP Services:**
• Rolls-Royce airport transfer
• 24/7 personal butler
• Priority access to all ${'restaurants' in business ? business.restaurants : 8} restaurants
• Private beach club membership

Your preferences are saved for personalized service. How may I enhance your stay?${disclaimer}`
      }
      
      return `Welcome to ${business.name} - Hawaii's premier luxury destination.

With ${'occupancy' in realTime ? realTime.occupancy : 89}% occupancy and ${'vipArrivals' in realTime ? realTime.vipArrivals : 3} VIP arrivals today, our exclusive services are in high demand.

I provide personalized assistance in English, Japanese, Chinese, Spanish, and Korean. I have access to your preferences and can arrange:
• Luxury suite bookings
• Private experiences
• Michelin-star dining
• Yacht and helicopter charters

How may I create magic for you today?${disclaimer}`
    }
    
    else {
      // Enterprise: Full integration suite with predictive analytics
      const properties = ('properties' in business && Array.isArray(business.properties)) ? business.properties : []
      
      if (lowerQuery.includes('book') || lowerQuery.includes('reserve')) {
        return `✅ **Enterprise Booking Platform - Multi-Property Access**\n\n🏢 **Your Corporate Account (Microsoft - Global Agreement)**\n\n📊 **AI-Powered Recommendations based on your travel patterns:**\n\n**Honolulu (You visit 2x/month)**\n• Saved preference: Ocean Tower, Floor 25+\n• Your rate: $${business.avgRate - 100}/night (Corporate: -40%)\n• Available: 15 rooms in your preferred zone\n\n**Maui (Quarterly visits)**\n• Beachfront Villa - Your usual choice\n• Your rate: $${business.avgRate * 1.5}/night (Corporate rate)\n• Team booking available (up to 20 rooms)\n\n💼 **Quick Actions:**\n[Book Honolulu] [Book Maui] [Book Team Retreat] [View All 12 Properties]\n\n📈 **Your Company Stats:**\n• Annual savings: $124,000 vs public rates\n• 2024 nights booked: 487 across all properties\n• Carbon offset: Automatically included\n\n🔗 **Integrated Services:**\n✓ Direct billing to Microsoft (PO #48291)\n✓ Expense reports auto-generated\n✓ Travel policy compliant\n✓ Concur integration active${disclaimer}`
      }
      
      if (lowerQuery.includes('team') || lowerQuery.includes('group') || lowerQuery.includes('conference')) {
        return `✅ **Enterprise Group Booking System**\n\n🏢 **Multi-Property Conference Planning**\n\n📊 **Checking availability across all properties...**\n\n✅ **Available for 200 people (March 15-20):**\n\n**Option 1: Maui Grand Resort**\n• Ballroom: 500 capacity (divisible)\n• Room block: 200 ocean view rooms\n• Total: $${200 * business.avgRate * 5} (includes meeting space)\n• ✨ Can add team building on private beach\n\n**Option 2: Honolulu Business Hotel**\n• Conference center: 1000 capacity\n• Room block: 200 city view rooms\n• Total: $${180 * business.avgRate * 5}\n• ✨ Walking distance to 50+ restaurants\n\n**Option 3: Big Island Retreat**\n• Exclusive property buyout available\n• 150 rooms + 50 villas\n• Total: $${250 * business.avgRate * 5}\n• ✨ Perfect for executive retreats\n\n📱 **One-Click Actions:**\n[Send RFP to All] [Schedule Site Visits] [Hold Dates]\n\n💼 **Included in Corporate Package:**\n• Dedicated event manager\n• AV equipment and tech support\n• Custom F&B menus\n• Airport group transfers\n• Instant contract generation${disclaimer}`
      }
      
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
• Occupancy: ${'systemOccupancy' in realTime ? realTime.systemOccupancy : 85}% (↑3% vs last week)
• ADR: $${business.avgRate} (↑$15 vs last month)
• RevPAR: $${Math.round(business.avgRate * ('systemOccupancy' in realTime ? realTime.systemOccupancy : 85) / 100)}
• Revenue Today: $${('revenueToday' in realTime ? (realTime.revenueToday / 1000000).toFixed(1) : '1.3')}M

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
      
      if (lowerQuery.includes('my') || lowerQuery.includes('profile') || lowerQuery.includes('history')) {
        return `✅ **Enterprise CRM - Complete 360° Guest View**\n\n👤 **Executive Profile: John Smith (Microsoft)**\n\n📊 **Lifetime Analytics:**\n• Customer since: 2019\n• Total stays: 127 nights across 8 properties\n• Lifetime value: $487,000\n• Status: Diamond Elite + Corporate VIP\n• Next stay: Maui (Dec 20-27) - Already checked in online\n\n🏆 **Preferences (AI-learned):**\n• Room: High floor, away from elevators, ocean view\n• Bed: King, firm pillows (2), extra blankets\n• Amenities: Gym access 5:30 AM, espresso machine\n• Dietary: Gluten-free, no shellfish\n• Transport: Tesla Model S preferred\n\n👥 **Travel Patterns:**\n• Usually travels with: Sarah Smith (spouse)\n• Team trips: Quarterly with 5-8 people\n• Booking window: 14 days advance average\n\n🎯 **Predictive Services:**\n• Pre-arrival: Room pre-cooled to 68°F\n• Mini-bar: Stocked with Pellegrino, dark chocolate\n• Spa: Friday 3 PM massage auto-suggested\n• Restaurant: Sushi bar reservation recommended\n\n💼 **Corporate Benefits:**\n• Direct billing active\n• Expense integration: Concur\n• CO2 offset: 12.4 tons offset YTD\n• Savings vs public rate: $47,000 YTD${disclaimer}`
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
      
      return `**${business.name} Enterprise AI Platform**\n\n🚀 **Full Integration Suite Active:**\n\n✅ **Booking Engine**: Real-time across ${properties.length} properties\n✅ **CRM Integration**: Salesforce, HubSpot, Microsoft Dynamics\n✅ **Property Management**: Oracle Opera, Infor HMS\n✅ **Revenue Management**: Dynamic pricing AI active\n✅ **Analytics Platform**: PowerBI, Tableau dashboards\n✅ **Marketing Automation**: Personalized campaigns running\n\n📊 **Live Performance Metrics:**\n• Occupancy right now: ${'systemOccupancy' in realTime ? realTime.systemOccupancy : 85}% system-wide\n• Revenue today: $${('revenueToday' in realTime ? (realTime.revenueToday / 1000).toFixed(0) : '1250')}K\n• Bookings in last hour: 47\n• Average response time: 0.3 seconds\n\nI'm your AI-powered enterprise assistant with access to:

🏨 **${properties.length} Properties** - ${(business as any).totalRooms} total rooms
💰 **Revenue Management** - Real-time pricing optimization
👥 **${(business as any).loyaltyMembers.toLocaleString()} Loyalty Members** - Full CRM integration
📊 **Advanced Analytics** - Predictive modeling & forecasting
🌍 **10+ Languages** - Global guest support
🤝 **Corporate Accounts** - Microsoft, Amazon, Google contracts

Current system status:
• ${realTime.availableRooms} rooms available system-wide
• ${'systemOccupancy' in realTime ? realTime.systemOccupancy : 85}% average occupancy
• ${'groupArrivals' in realTime ? realTime.groupArrivals : 450} group arrivals tomorrow
• $${('revenueToday' in realTime ? (realTime.revenueToday / 1000000).toFixed(1) : '1.3')}M revenue today

I can handle any enterprise hospitality need. What would you like to explore?${disclaimer}`
    }
  }

  return (
    <div className={embedded ? "flex items-center justify-center h-screen" : ""}>
      <AnimatePresence>
        {!isOpen && !embedded && (
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
            className={cn(
              "z-50 h-[600px] w-[380px] rounded-2xl bg-white shadow-2xl",
              embedded ? "mx-auto" : "fixed bottom-6 right-6"
            )}
            style={{ display: 'flex', flexDirection: 'column' }}
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
              {!embedded && (
                <button
                  onClick={handleClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 transition-all hover:bg-black/20"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              )}
            </div>

            {/* Rating Overlay */}
            {showRating && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/95 backdrop-blur-sm">
                <div className="w-full max-w-sm p-6">
                  {!hasRated ? (
                    <>
                      <h3 className="text-center text-lg font-semibold text-gray-900 mb-4">
                        How was your experience?
                      </h3>
                      
                      {/* Star Rating */}
                      <div className="flex justify-center gap-2 mb-6">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={cn(
                                'h-8 w-8 transition-colors',
                                (hoverRating || rating) >= star
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              )}
                            />
                          </button>
                        ))}
                      </div>

                      {/* Feedback textarea (optional) */}
                      {rating > 0 && (
                        <div className="mb-4">
                          <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Any additional feedback? (optional)"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                          />
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={skipRating}
                          className="flex-1 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Skip
                        </button>
                        <button
                          onClick={submitRating}
                          disabled={rating === 0}
                          className="flex-1 px-4 py-2 text-sm text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ 
                            backgroundColor: rating > 0 ? primaryColor : '#9ca3af'
                          }}
                        >
                          Submit
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <div className="mb-4">
                        <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                          <svg
                            className="h-6 w-6 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Thank you!
                      </h3>
                      <p className="text-sm text-gray-600">
                        Your feedback helps us improve
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={message.id}>
                    <div
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
                    
                    {/* Quick Actions - Show after welcome message */}
                    {index === 0 && showQuickActions && messages.length === 1 && message.role === 'assistant' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4 space-y-2"
                      >
                        <div className="text-xs text-gray-500 mb-2">Quick actions:</div>
                        <div className="grid grid-cols-2 gap-2">
                          {availableQuickActions.map((action, actionIndex) => (
                            <motion.button
                              key={action.label}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.4 + actionIndex * 0.05 }}
                              onClick={() => handleQuickAction(action.action)}
                              className="flex items-center gap-2 px-3 py-2 text-sm bg-white rounded-lg border border-gray-200 hover:border-cyan-400 hover:bg-cyan-50 transition-all text-left group"
                            >
                              <span className="text-base">{action.icon}</span>
                              <span className="text-gray-700 group-hover:text-cyan-700">{action.label}</span>
                            </motion.button>
                          ))}
                        </div>
                        
                        {/* Tier-specific messaging */}
                        {tier === 'starter' && (
                          <div className="text-xs text-gray-400 italic mt-3 px-2">
                            💡 Upgrade to Professional for booking capabilities
                          </div>
                        )}
                        {tier === 'professional' && (
                          <div className="text-xs text-gray-400 italic mt-3 px-2">
                            🚀 Includes real-time booking & multi-language support
                          </div>
                        )}
                        {tier === 'premium' && (
                          <div className="text-xs text-gray-400 italic mt-3 px-2">
                            👑 VIP concierge service with personalized recommendations
                          </div>
                        )}
                        {tier === 'enterprise' && (
                          <div className="text-xs text-gray-400 italic mt-3 px-2">
                            🏢 Full enterprise integration with all systems active
                          </div>
                        )}
                      </motion.div>
                    )}
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
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 bg-white focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
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
    </div>
  )
}