'use client'

import { useState } from 'react'
import ChatWidget from '@/components/chatbot/ChatWidget'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Sparkles, Phone, X, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'

export default function StarterWidgetDemo() {
  const [showWidget, setShowWidget] = useState(true)
  const [tier, setTier] = useState<'starter' | 'professional' | 'premium' | 'enterprise'>('starter')
  const [businessName, setBusinessName] = useState('Aloha Resort Hawaii')
  const [primaryColor, setPrimaryColor] = useState('#0891b2')
  const [welcomeMessage, setWelcomeMessage] = useState('Aloha! Welcome to our resort. How can I help you today?')

  const starterFeatures = {
    included: [
      'Basic FAQ responses',
      'Business hours & location',
      'Check-in/check-out times',
      'General amenity information',
      'Contact information',
      'Simple greetings',
      '3 Quick action buttons',
      'Chat rating system'
    ],
    notIncluded: [
      'Real-time room availability',
      'Direct booking capability',
      'Guest history lookup',
      'Multi-language support',
      'Restaurant reservations',
      'Personalized recommendations',
      'CRM integration',
      'Revenue management'
    ]
  }

  const sampleQuestions = [
    "What time is check-in?",
    "Do you have rooms available tonight?",
    "I want to book a room",
    "What amenities do you offer?",
    "How do I get to your hotel?",
    "What's your cancellation policy?",
    "Do you have a pool?",
    "I stayed with you last month"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-8 w-8 text-cyan-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Starter Tier Widget Demo</h1>
                <p className="text-sm text-gray-600">Test the basic chatbot functionality</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-300 text-lg px-4 py-1">
              $29/month
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-1 space-y-6">
            {/* Widget Settings */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-600" />
                Widget Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Business Name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Primary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-20"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Welcome Message</label>
                  <textarea
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                  />
                </div>
                <Button
                  onClick={() => setShowWidget(!showWidget)}
                  className="w-full"
                  variant={showWidget ? "destructive" : "default"}
                >
                  {showWidget ? 'Hide Widget' : 'Show Widget'}
                </Button>
              </div>
            </Card>

            {/* Sample Questions */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Try These Questions</h3>
              <div className="space-y-2">
                {sampleQuestions.map((question, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 bg-gray-50 rounded-lg text-sm hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => {
                      // Copy to clipboard
                      navigator.clipboard.writeText(question)
                    }}
                  >
                    {question}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">Click to copy question</p>
            </Card>
          </div>

          {/* Middle Panel - Features */}
          <div className="lg:col-span-1 space-y-6">
            {/* Included Features */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 text-green-700">✅ Starter Includes</h3>
              <div className="space-y-2">
                {starterFeatures.included.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Not Included Features */}
            <Card className="p-6 border-orange-200 bg-orange-50">
              <h3 className="font-semibold text-lg mb-4 text-orange-700">❌ Not Available in Starter</h3>
              <div className="space-y-2">
                {starterFeatures.notIncluded.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <X className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-white rounded-lg border border-orange-300">
                <p className="text-sm font-medium text-orange-800 mb-2">
                  💡 Upgrade to Professional for:
                </p>
                <ul className="text-xs space-y-1 text-gray-600">
                  <li>• Real-time booking integration</li>
                  <li>• Guest history & CRM</li>
                  <li>• Multi-language support</li>
                  <li>• Advanced analytics</li>
                </ul>
                <Button className="w-full mt-3 bg-orange-600 hover:bg-orange-700">
                  Upgrade to Professional
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-[600px] relative">
              <h3 className="font-semibold text-lg mb-4">Live Preview Area</h3>
              
              {/* Phone Mockup */}
              <div className="relative mx-auto" style={{ maxWidth: '380px' }}>
                <div className="bg-gray-900 rounded-[2.5rem] p-3">
                  <div className="bg-white rounded-[2rem] h-[600px] relative overflow-hidden">
                    {/* Phone Status Bar */}
                    <div className="bg-gray-100 h-8 flex items-center justify-between px-4 text-xs">
                      <span>9:41 AM</span>
                      <span>100% 🔋</span>
                    </div>
                    
                    {/* Website Preview */}
                    <div className="bg-gradient-to-b from-cyan-600 to-cyan-700 p-8 text-white">
                      <h2 className="text-2xl font-bold mb-2">{businessName}</h2>
                      <p className="text-cyan-100">Experience Paradise in Hawaii</p>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Welcome to our resort website!</p>
                        <p className="text-xs text-gray-500 mt-2">The chat widget appears in the bottom right →</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-gray-400" />
                          <span className="text-sm">(808) 555-0100</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-5 w-5 text-gray-400" />
                          <span className="text-sm">Chat support available</span>
                        </div>
                      </div>
                    </div>

                    {/* Chat Widget Indicator */}
                    <div className="absolute bottom-20 right-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg px-3 py-2 text-xs font-medium text-yellow-800">
                      ← Widget appears here
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-2">💡 How Starter Widget Works:</p>
                <ol className="text-xs text-blue-700 space-y-1">
                  <li>1. Users click the chat bubble to open</li>
                  <li>2. They see your welcome message</li>
                  <li>3. Can ask basic FAQ questions</li>
                  <li>4. Get directed to call for bookings</li>
                  <li>5. Rate their experience when closing</li>
                </ol>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom Section - Response Examples */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Example Starter Responses</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-cyan-500 pl-4">
                <p className="text-sm font-medium text-gray-700 mb-1">User: "I want to book a room"</p>
                <div className="text-sm bg-gray-50 p-3 rounded">
                  <p className="font-medium text-red-600">❌ Booking Integration Not Available in Starter Plan</p>
                  <p className="mt-2">To make a reservation, please call (808) 555-0100.</p>
                  <p className="mt-2 text-cyan-600">💡 Upgrade to Professional to enable instant bookings!</p>
                </div>
              </div>
              
              <div className="border-l-4 border-cyan-500 pl-4">
                <p className="text-sm font-medium text-gray-700 mb-1">User: "What's available tonight?"</p>
                <div className="text-sm bg-gray-50 p-3 rounded">
                  <p>We have rooms available. Please call (808) 555-0100 to check specific dates.</p>
                  <p className="mt-2 text-orange-600">⚠️ Real-time availability requires Professional plan or higher.</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-cyan-50">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Quick Actions in Starter</h3>
            <p className="text-sm text-gray-600 mb-4">
              Starter tier includes 3 basic quick action buttons to help users get started:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                <span className="text-2xl">🏨</span>
                <div>
                  <p className="font-medium text-sm">Check Availability</p>
                  <p className="text-xs text-gray-500">Directs to phone number</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                <span className="text-2xl">🏖️</span>
                <div>
                  <p className="font-medium text-sm">View Amenities</p>
                  <p className="text-xs text-gray-500">Shows basic amenity list</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="font-medium text-sm">Get Directions</p>
                  <p className="text-xs text-gray-500">Provides address & directions</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Floating Chat Widget */}
      {showWidget && (
        <ChatWidget
          tier={tier}
          businessName={businessName}
          primaryColor={primaryColor}
          welcomeMessage={welcomeMessage}
        />
      )}
    </div>
  )
}