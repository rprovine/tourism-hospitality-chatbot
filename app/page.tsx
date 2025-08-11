'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Check, 
  X, 
  MessageSquare, 
  Globe, 
  Zap, 
  Shield, 
  HeadphonesIcon,
  ArrowRight,
  Sparkles,
  Bot,
  ChevronRight,
  Brain,
  TrendingUp,
  DollarSign,
  BarChart3,
  Activity,
  Target,
  Gift,
  RefreshCw,
  User,
  Users,
  Menu
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ChatWidget from '@/components/chatbot/ChatWidget'
import ROICalculator from '@/components/pricing/ROICalculator'
import CompetitiveAdvantage from '@/components/pricing/CompetitiveAdvantage'
import { tierComparison, pricingTiers, useCases, sampleQuestions } from '@/lib/data/pricing'

export default function LandingPage() {
  const [selectedTier, setSelectedTier] = useState<'starter' | 'professional' | 'premium' | 'enterprise'>('starter')
  const [showDemo, setShowDemo] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div id="top" className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <a href="#top" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Bot className="h-6 sm:h-8 w-6 sm:w-8 text-cyan-700" />
              <span className="text-lg sm:text-xl font-bold text-gray-900 hidden sm:inline">LeniLani Hospitality AI</span>
              <span className="text-lg font-bold text-gray-900 sm:hidden">LeniLani AI</span>
            </a>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-700 hover:text-cyan-700 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-cyan-700 transition-colors">Pricing</a>
              <a href="#demo" className="text-gray-700 hover:text-cyan-700 transition-colors">Demo</a>
              <a href="/login" className="text-gray-700 hover:text-cyan-700 transition-colors">Login</a>
              <Button 
                className="bg-cyan-700 hover:bg-cyan-800 text-white shadow-md"
                onClick={() => window.location.href = '/checkout?plan=starter&interval=monthly'}
              >
                Start 14-Day Free Trial
              </Button>
            </div>
            
            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center gap-2">
              <Button 
                className="bg-cyan-700 hover:bg-cyan-800 text-white text-xs px-3 py-2"
                onClick={() => window.location.href = '/checkout?plan=starter&interval=monthly'}
              >
                Free Trial
              </Button>
              <button
                className="p-2 text-gray-700 hover:text-cyan-700 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
              <div className="flex flex-col p-4 space-y-3">
                <a 
                  href="#features" 
                  className="text-gray-700 hover:text-cyan-700 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a 
                  href="#pricing" 
                  className="text-gray-700 hover:text-cyan-700 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </a>
                <a 
                  href="#demo" 
                  className="text-gray-700 hover:text-cyan-700 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Demo
                </a>
                <a 
                  href="/login" 
                  className="text-gray-700 hover:text-cyan-700 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-cyan-700 text-white px-4 py-2 rounded-full mb-6 border border-cyan-600 shadow-md">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-bold">🚀 NEW: GPT-5 (Auto-Optimizing) + Claude AI</span>
          </div>
          
          {/* Hawaiian Market Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 p-1 rounded-full shadow-lg">
              <div className="bg-white rounded-full px-6 py-3 flex items-center gap-2">
                <span className="text-2xl">🌺</span>
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-purple-600 text-lg">
                  Built for Hawaiian Hospitality & Tourism
                </span>
                <span className="text-2xl">🏝️</span>
              </div>
            </div>
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Dual AI Platform:{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-blue-700">
              GPT-5 + Claude Intelligence
            </span>
          </h1>
          <p className="text-xl text-gray-700 mb-4 leading-relaxed">
            The FIRST platform powered by GPT-5's revolutionary capabilities combined with Claude's conversational excellence. 
            Experience 10x faster responses, deeper understanding, and unprecedented accuracy. Boost revenue by 35%.
          </p>
          
          {/* Hawaiian Market Focus */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 mb-8 font-medium"
          >
            🌴 Understands local culture • 🗣️ Speaks Pidgin & Hawaiian • 📍 Knows every beach, trail & restaurant
          </motion.p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-cyan-700 hover:bg-cyan-800 text-white font-semibold"
              onClick={() => setShowDemo(true)}
            >
              Try Live Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="font-semibold border-2 border-gray-700 text-gray-800 bg-white hover:bg-gray-100">
              Schedule Demo
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-20"
        >
          {[
            { label: 'Revenue Increase', value: '+23%', icon: TrendingUp },
            { label: 'Automation Rate', value: '85%', icon: Brain },
            { label: 'ROI Average', value: '400%', icon: DollarSign },
            { label: 'Recovery Rate', value: '25%', icon: Target }
          ].map((stat, index) => (
            <Card key={index} className="text-center border-gray-200 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <stat.icon className="h-8 w-8 text-cyan-700 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-700 font-medium">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </section>

      {/* New Advanced Features Section */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 py-20 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-2 rounded-full mb-6">
              <Brain className="h-4 w-4" />
              <span className="text-sm font-bold uppercase tracking-wider">Advanced AI Features</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">Enterprise-Grade AI Technology</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Industry-leading features that set us apart from basic chatbots
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* GPT-4 Integration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-cyan-600 transition-all"
            >
              <Brain className="h-12 w-12 text-cyan-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">🎯 GPT-5 + Claude Dual AI</h3>
              <p className="text-gray-400 mb-4">
                GPT-5 auto-optimizes for speed or quality as needed. Combined with Claude for perfect conversations.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• GPT-5 auto-optimization</li>
                <li>• Claude conversational AI</li>
                <li>• Seamless mode switching</li>
              </ul>
            </motion.div>

            {/* Sentiment Analysis */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-600 transition-all"
            >
              <Activity className="h-12 w-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Real-Time Sentiment Analysis</h3>
              <p className="text-gray-400 mb-4">
                Detect emotions instantly: joy, anger, sadness, fear, surprise, and disgust with urgency assessment
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Emotion detection</li>
                <li>• Urgency alerts</li>
                <li>• Human handoff triggers</li>
              </ul>
            </motion.div>

            {/* Self-Learning */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-600 transition-all"
            >
              <Sparkles className="h-12 w-12 text-green-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Self-Learning Engine</h3>
              <p className="text-gray-400 mb-4">
                AI that improves continuously from every interaction with pattern recognition and feedback learning
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Pattern recognition</li>
                <li>• Response optimization</li>
                <li>• Insight generation</li>
              </ul>
            </motion.div>

            {/* Dynamic Pricing */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-yellow-600 transition-all"
            >
              <DollarSign className="h-12 w-12 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Dynamic Pricing Engine</h3>
              <p className="text-gray-400 mb-4">
                AI-driven price optimization based on demand, seasonality, events, and competitor monitoring
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Demand forecasting</li>
                <li>• Event-based pricing</li>
                <li>• Last-minute deals</li>
              </ul>
            </motion.div>

            {/* Intelligent Upselling */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-orange-600 transition-all"
            >
              <TrendingUp className="h-12 w-12 text-orange-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Intelligent Upselling</h3>
              <p className="text-gray-400 mb-4">
                Personalized offers at the perfect moment with bundle recommendations and cross-sell opportunities
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Room upgrades</li>
                <li>• Experience packages</li>
                <li>• Smart bundling</li>
              </ul>
            </motion.div>

            {/* Journey Mapping */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-600 transition-all"
            >
              <BarChart3 className="h-12 w-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Customer Journey Analytics</h3>
              <p className="text-gray-400 mb-4">
                Complete visualization of guest experience with ROI calculator and conversion funnel analysis
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Journey mapping</li>
                <li>• Drop-off analysis</li>
                <li>• 5-year ROI projections</li>
              </ul>
            </motion.div>
          </div>

          {/* Multi-Channel Support */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-4 text-center">Omnichannel Messaging Platform</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                {['WhatsApp', 'SMS/MMS', 'Instagram', 'Web Chat', 'Email'].map((channel) => (
                  <div key={channel} className="bg-white/10 rounded-lg px-4 py-3 text-center font-medium backdrop-blur">
                    {channel}
                  </div>
                ))}
              </div>
              <p className="text-center mt-6 text-cyan-100">
                Unified inbox for all channels with message queuing and delivery tracking
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue & Guest Intelligence Section */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-full mb-6 border border-green-200">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-bold uppercase tracking-wider">Revenue Intelligence</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Turn Every Conversation Into Revenue
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Not just a chatbot - a complete revenue optimization system that learns, predicts, and maximizes income 24/7
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            {/* Revenue Section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Revenue Optimization</h3>
                  <p className="text-gray-600">Increase revenue by 15-30% automatically</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
                >
                  <h4 className="font-semibold text-lg mb-2 flex items-center gap-2 text-gray-900">
                    <Target className="h-5 w-5 text-green-600" />
                    Dynamic Pricing Engine
                  </h4>
                  <p className="text-gray-700 mb-3">
                    AI adjusts prices in real-time based on demand, events, and competitor rates
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Seasonal demand forecasting
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Event-based pricing spikes
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Last-minute deal optimization
                    </li>
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
                >
                  <h4 className="font-semibold text-lg mb-2 flex items-center gap-2 text-gray-900">
                    <Gift className="h-5 w-5 text-purple-600" />
                    Intelligent Upselling
                  </h4>
                  <p className="text-gray-700 mb-3">
                    Identifies perfect moments to suggest upgrades and add-ons
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Room upgrade suggestions
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Activity package offers
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Dining & spa recommendations
                    </li>
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
                >
                  <h4 className="font-semibold text-lg mb-2 flex items-center gap-2 text-gray-900">
                    <RefreshCw className="h-5 w-5 text-blue-600" />
                    Abandonment Recovery
                  </h4>
                  <p className="text-gray-700 mb-3">
                    Automatically recovers 25% of abandoned bookings
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Smart follow-up timing
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Personalized incentives
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Multi-channel recovery
                    </li>
                  </ul>
                </motion.div>
              </div>
            </div>

            {/* Guest Intelligence Section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Guest Intelligence</h3>
                  <p className="text-gray-600">Know every guest like they're family</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
                >
                  <h4 className="font-semibold text-lg mb-2 flex items-center gap-2 text-gray-900">
                    <User className="h-5 w-5 text-blue-600" />
                    360° Guest Profiles
                  </h4>
                  <p className="text-gray-700 mb-3">
                    Automatically builds rich profiles from every interaction
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Preferences & dietary needs
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Booking history & patterns
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Special occasions tracking
                    </li>
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
                >
                  <h4 className="font-semibold text-lg mb-2 flex items-center gap-2 text-gray-900">
                    <Activity className="h-5 w-5 text-purple-600" />
                    Behavioral Analytics
                  </h4>
                  <p className="text-gray-700 mb-3">
                    Predict guest needs before they ask
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Sentiment tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Lifetime value calculation
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Churn risk detection
                    </li>
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
                >
                  <h4 className="font-semibold text-lg mb-2 flex items-center gap-2 text-gray-900">
                    <Sparkles className="h-5 w-5 text-yellow-600" />
                    VIP Recognition
                  </h4>
                  <p className="text-gray-700 mb-3">
                    Automatically identify and prioritize valuable guests
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Repeat guest detection
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      High-value customer alerts
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Personalized VIP treatment
                    </li>
                  </ul>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Live Example */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white"
          >
            <h3 className="text-2xl font-bold mb-6 text-center">See It In Action: Real Guest Journey</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-6xl mx-auto">
              {[
                { step: '1', title: 'Guest Chats', desc: 'Sarah asks about ocean view rooms for anniversary' },
                { step: '2', title: 'AI Recognizes', desc: 'VIP guest, 3rd stay, prefers premium rooms' },
                { step: '3', title: 'Smart Pricing', desc: 'Offers 10% loyalty discount on suite upgrade' },
                { step: '4', title: 'Upsell Success', desc: 'Suggests couples spa package (bought before)' },
                { step: '5', title: 'Revenue +45%', desc: '$850 booking instead of $580 standard' }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                    {item.step}
                  </div>
                  <h4 className="font-semibold mb-1">{item.title}</h4>
                  <p className="text-sm text-green-100">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ROI Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { metric: '+23%', label: 'Average Revenue Increase' },
              { metric: '25%', label: 'Bookings Recovered' },
              { metric: '3.2x', label: 'Upsell Success Rate' },
              { metric: '400%', label: 'ROI in 6 Months' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-green-600">{stat.metric}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-gray-100 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for Hawaii&apos;s Tourism Industry</h2>
            <p className="text-lg text-gray-700">Tailored solutions for every hospitality business</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-gray-200 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
                  <CardHeader>
                    <div className="text-4xl mb-4">{useCase.icon}</div>
                    <CardTitle>{useCase.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{useCase.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section id="features" className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Compare Our Tiers</h2>
          <p className="text-lg text-gray-700">Choose the perfect plan for your business needs</p>
        </div>
        
        <div className="max-w-7xl mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg overflow-hidden shadow-sm">
              <thead>
                <tr className="border-b-2 border-gray-300 bg-gray-50">
                  <th className="text-left py-4 px-4 font-medium text-gray-900 min-w-[200px]">Features</th>
                  <th className="text-center py-6 px-4 bg-white min-w-[150px]">
                    <div className="font-bold text-lg text-gray-900">Starter</div>
                    <div className="text-2xl font-extrabold text-gray-900 mt-2">$29<span className="text-sm font-normal text-gray-600">/mo</span></div>
                    <div className="text-xs text-green-600 font-medium mt-1">14-day free trial</div>
                    <div className="text-xs text-green-600 mt-1">Perfect for small businesses</div>
                  </th>
                  <th className="text-center py-6 px-4 bg-cyan-50 min-w-[150px]">
                    <div className="inline-flex items-center gap-2 mb-2">
                      <span className="font-bold text-lg text-gray-900">Professional</span>
                      <span className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white text-xs px-2 py-1 rounded-full font-bold uppercase">Most Popular</span>
                    </div>
                    <div className="relative">
                      <span className="text-lg text-gray-400 line-through">$199</span>
                      <div className="text-2xl font-extrabold text-cyan-700">$149<span className="text-sm font-normal text-gray-600">/mo</span></div>
                    </div>
                    <div className="text-xs text-green-600 font-medium">14-day free trial</div>
                    <div className="text-xs text-green-600 mt-1">Best value with dual AI</div>
                  </th>
                  <th className="text-center py-6 px-4 bg-purple-50 min-w-[150px]">
                    <div className="inline-flex items-center gap-2 mb-2">
                      <span className="font-bold text-lg text-gray-900">Premium</span>
                      <span className="text-2xl">✨</span>
                    </div>
                    <div className="text-2xl font-extrabold text-purple-700">$299<span className="text-sm font-normal text-gray-600">/mo</span></div>
                    <div className="text-xs text-green-600 font-medium">30-day money-back guarantee</div>
                    <div className="text-xs text-green-600 mt-1">Full AI suite + analytics</div>
                  </th>
                  <th className="text-center py-6 px-4 bg-gray-100 min-w-[150px]">
                    <div className="inline-flex items-center gap-2 mb-2">
                      <span className="font-bold text-lg text-gray-900">Enterprise</span>
                      <span className="text-2xl">🏢</span>
                    </div>
                    <div className="text-2xl font-extrabold text-gray-900">$999+</div>
                    <div className="text-xs text-green-600 font-medium">30-day money-back guarantee</div>
                    <div className="text-xs text-green-600 mt-1">Custom AI models</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {tierComparison.map((feature, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-cyan-50/30">
                    <td className="py-4 px-4 text-gray-800 font-medium">{feature.name}</td>
                    <td className="text-center py-4 px-4">
                      {typeof feature.starter === 'boolean' ? (
                        feature.starter ? (
                          <Check className="h-5 w-5 text-green-700 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-800 text-sm">{feature.starter}</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4 bg-cyan-50/30">
                      {typeof feature.professional === 'boolean' ? (
                        feature.professional ? (
                          <Check className="h-5 w-5 text-green-700 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-900 text-sm font-medium">{feature.professional}</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4 bg-purple-50/30">
                      {typeof feature.premium === 'boolean' ? (
                        feature.premium ? (
                          <Check className="h-5 w-5 text-green-700 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mx-auto" />
                        )
                      ) : (
                        <span className="text-purple-900 text-sm font-medium">{feature.premium}</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4 bg-gray-50">
                      {typeof feature.enterprise === 'boolean' ? (
                        feature.enterprise ? (
                          <Check className="h-5 w-5 text-green-700 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-900 text-sm font-medium">{feature.enterprise}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Value Proposition Banner */}
          <div className="mt-8 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-6 text-white max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2">🎉 Limited Time: Professional Tier Now $149</h3>
                <p className="text-cyan-100">
                  Save $50/month with Dual AI Power • Annual discounts available • 14-day free trial
                </p>
              </div>
              <Button 
                className="bg-white text-cyan-700 hover:bg-cyan-50 font-semibold px-6 py-3"
                onClick={() => window.location.href = '/checkout?plan=starter&interval=monthly'}
              >
                Start Free Trial
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Deployment Timeline Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Fast Deployment, Tailored to Your Needs</h2>
            <p className="text-lg text-gray-700">Get your AI chatbot up and running based on your tier</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Card className="h-full border-2 border-green-200 bg-green-50">
                <CardHeader>
                  <div className="text-4xl mb-3">⚡</div>
                  <CardTitle className="text-xl">Starter</CardTitle>
                  <div className="text-2xl font-bold text-green-700 mt-2">Instant</div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">Automated deployment</p>
                  <p className="text-sm text-gray-600 mt-2">Start using immediately after payment</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Card className="h-full border-2 border-green-200 bg-green-50">
                <CardHeader>
                  <div className="text-4xl mb-3">⚡</div>
                  <CardTitle className="text-xl">Professional</CardTitle>
                  <div className="text-2xl font-bold text-green-700 mt-2">Instant</div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">Automated deployment</p>
                  <p className="text-sm text-gray-600 mt-2">Full features active immediately</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Card className="h-full border-2 border-blue-200 bg-blue-50">
                <CardHeader>
                  <div className="text-4xl mb-3">🎯</div>
                  <CardTitle className="text-xl">Premium</CardTitle>
                  <div className="text-2xl font-bold text-blue-700 mt-2">2-3 Days</div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">Custom setup required</p>
                  <p className="text-sm text-gray-600 mt-2">AI training on your data & integrations</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Card className="h-full border-2 border-purple-200 bg-purple-50">
                <CardHeader>
                  <div className="text-4xl mb-3">🏢</div>
                  <CardTitle className="text-xl">Enterprise</CardTitle>
                  <div className="text-2xl font-bold text-purple-700 mt-2">5-10 Days</div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">Full integration process</p>
                  <p className="text-sm text-gray-600 mt-2">Multi-property setup, training & SSO</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          <div className="mt-12 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-8 max-w-4xl mx-auto">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What Happens After Payment?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="text-green-600">✓</span> Starter & Professional
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Instant access to dashboard</li>
                    <li>• Widget code ready to embed</li>
                    <li>• Pre-configured knowledge base</li>
                    <li>• Start chatting immediately</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="text-blue-600">✓</span> Premium & Enterprise
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Dedicated onboarding specialist</li>
                    <li>• Custom AI training sessions</li>
                    <li>• Integration with your systems</li>
                    <li>• Staff training & documentation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section id="pricing" className="bg-gradient-to-b from-white to-gray-100 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-700 font-medium">No hidden fees. Cancel anytime.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className={tier.highlighted ? 'border-cyan-600 border-2 shadow-2xl transform scale-105' : 'border-gray-200 shadow-lg hover:shadow-xl transition-shadow'}>
                  {tier.highlighted && (
                    <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white text-center py-3 text-sm font-semibold tracking-wide">
                      Most Popular Choice
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <CardDescription className="text-gray-700">{tier.description}</CardDescription>
                    <div className="mt-4">
                      {tier.originalPrice && (
                        <span className="text-2xl text-gray-400 line-through mr-2">{tier.originalPrice}</span>
                      )}
                      <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                      <span className="text-gray-700 font-medium">/month</span>
                    </div>
                    {tier.savings && (
                      <div className="mt-2 text-sm font-semibold text-green-600">
                        {tier.savings}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                          <span className="text-gray-800">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={tier.highlighted ? 'w-full mt-6 bg-cyan-600 hover:bg-cyan-700' : 'w-full mt-6'}
                      variant={tier.highlighted ? 'default' : 'outline'}
                      onClick={() => window.location.href = '/checkout?plan=starter&interval=monthly'}
                    >
                      Start 14-Day Free Trial
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitive Advantage */}
      <CompetitiveAdvantage />

      {/* ROI Calculator */}
      <ROICalculator />

      {/* Demo Section */}
      <section id="demo" className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">See It In Action</h2>
          <p className="text-lg text-gray-700">Experience the difference between our tiers</p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant={selectedTier === 'starter' ? 'default' : 'outline'}
            onClick={() => setSelectedTier('starter')}
            className={selectedTier === 'starter' ? 'bg-cyan-700 hover:bg-cyan-800 font-semibold' : 'font-medium'}
          >
            Starter Demo
          </Button>
          <Button
            variant={selectedTier === 'professional' ? 'default' : 'outline'}
            onClick={() => setSelectedTier('professional')}
            className={selectedTier === 'professional' ? 'bg-cyan-700 hover:bg-cyan-800 font-semibold' : 'font-medium'}
          >
            Professional Demo
          </Button>
          <Button
            variant={selectedTier === 'premium' ? 'default' : 'outline'}
            onClick={() => setSelectedTier('premium')}
            className={selectedTier === 'premium' ? 'bg-cyan-700 hover:bg-cyan-800 font-semibold' : 'font-medium'}
          >
            Premium Demo ✨
          </Button>
          <Button
            variant={selectedTier === 'enterprise' ? 'default' : 'outline'}
            onClick={() => setSelectedTier('enterprise')}
            className={selectedTier === 'enterprise' ? 'bg-cyan-700 hover:bg-cyan-800 font-semibold' : 'font-medium'}
          >
            Enterprise Demo 🏢
          </Button>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>
              {selectedTier === 'starter' ? 'Starter Tier - Basic Q&A Only' : 
               selectedTier === 'professional' ? 'Professional Tier - CRM & Booking Enabled ✅' : 
               selectedTier === 'premium' ? 'Premium Tier - Full Personalization & VIP 👑' : 
               'Enterprise Tier - Complete Integration Suite 🏢'} 
            </CardTitle>
            <CardDescription>
              {selectedTier === 'starter' ? '❌ No integrations - Manual processes only' : 
               selectedTier === 'professional' ? '✅ CRM + Booking system connected' : 
               selectedTier === 'premium' ? '✨ AI personalization + VIP services' : 
               '🚀 Full enterprise stack with predictive analytics'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Integration Status */}
            <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className={selectedTier !== 'starter' ? 'text-green-600' : 'text-gray-400'}>
                    {selectedTier !== 'starter' ? '✅' : '❌'}
                  </div>
                  <span className={selectedTier !== 'starter' ? 'font-semibold' : 'text-gray-500'}>
                    Booking System
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={selectedTier !== 'starter' ? 'text-green-600' : 'text-gray-400'}>
                    {selectedTier !== 'starter' ? '✅' : '❌'}
                  </div>
                  <span className={selectedTier !== 'starter' ? 'font-semibold' : 'text-gray-500'}>
                    CRM Integration
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={selectedTier === 'premium' || selectedTier === 'enterprise' ? 'text-green-600' : 'text-gray-400'}>
                    {selectedTier === 'premium' || selectedTier === 'enterprise' ? '✅' : '❌'}
                  </div>
                  <span className={selectedTier === 'premium' || selectedTier === 'enterprise' ? 'font-semibold' : 'text-gray-500'}>
                    AI Personalization
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={selectedTier === 'enterprise' ? 'text-green-600' : 'text-gray-400'}>
                    {selectedTier === 'enterprise' ? '✅' : '❌'}
                  </div>
                  <span className={selectedTier === 'enterprise' ? 'font-semibold' : 'text-gray-500'}>
                    Multi-Property
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sampleQuestions[selectedTier].map((question, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200 hover:border-cyan-500"
                  onClick={() => {
                    setSelectedQuestion(question)
                    setShowDemo(true)
                  }}
                >
                  <MessageSquare className="h-4 w-4 text-cyan-700" />
                  <span className="text-sm text-gray-700">{question}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button
                size="lg"
                className="bg-cyan-700 hover:bg-cyan-800 text-white font-semibold"
                onClick={() => {
                  setSelectedQuestion('')
                  setShowDemo(true)
                }}
              >
                Launch Interactive Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-cyan-700 to-blue-700 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Guest Experience?
          </h2>
          <p className="text-xl text-cyan-50 mb-8 max-w-2xl mx-auto">
            Join hundreds of Hawaiian hospitality businesses already using our AI platform
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-cyan-700 hover:bg-gray-50 font-semibold"
              onClick={() => window.location.href = '/checkout?plan=professional&interval=monthly'}
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" className="bg-white/20 backdrop-blur text-white border-2 border-white hover:bg-white hover:text-cyan-700 font-semibold transition-all">
              Schedule Demo
            </Button>
          </div>
          <p className="text-sm text-cyan-50 mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Bot className="h-6 w-6 text-cyan-500" />
                <span className="text-white font-semibold">LeniLani AI</span>
              </div>
              <p className="text-sm text-gray-400">
                Empowering Hawaii&apos;s hospitality industry with intelligent AI solutions.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-cyan-400 transition-colors text-gray-300">Features</a></li>
                <li><a href="#pricing" className="hover:text-cyan-400 transition-colors text-gray-300">Pricing</a></li>
                <li><a href="#demo" className="hover:text-cyan-400 transition-colors text-gray-300">Demo</a></li>
                <li><a href="#revenue" className="hover:text-cyan-400 transition-colors text-gray-300">Revenue</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://lenilani.com/about" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors text-gray-300">About</a></li>
                <li><a href="https://lenilani.com/contact" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors text-gray-300">Contact</a></li>
                <li><a href="https://lenilani.com/partners" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors text-gray-300">Partners</a></li>
                <li><a href="https://lenilani.com/careers" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors text-gray-300">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://lenilani.com/blog" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors text-gray-300">Blog</a></li>
                <li><a href="https://lenilani.com/newsletter" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors text-gray-300">Newsletter</a></li>
                <li><a href="https://lenilani.com/community" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors text-gray-300">Community</a></li>
                <li><a href="https://lenilani.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors text-gray-300">Visit LeniLani.com</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>© 2024 LeniLani Consulting. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Chat Widget Demo */}
      {showDemo && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 z-40" 
            onClick={() => {
              setShowDemo(false)
              setSelectedQuestion('')
            }}
          />
          <ChatWidget 
            tier={selectedTier}
            businessName="Demo Resort Hawaii"
            primaryColor="#0891b2"
            welcomeMessage={
              selectedTier === 'starter' 
                ? "Aloha! Welcome to our resort. How can I help you today?"
                : selectedTier === 'professional'
                ? "Aloha! I'm your AI concierge. I can help with bookings, recommendations, and answer any questions about your stay!"
                : selectedTier === 'premium'
                ? "Aloha and welcome to our exclusive luxury experience. I'm your personal AI concierge, available 24/7 to curate your perfect Hawaiian escape. How may I exceed your expectations today?"
                : "Welcome to our enterprise hospitality platform. I'm your advanced AI assistant with access to all properties, loyalty programs, and corporate services. How may I assist with your multi-property or group requirements today?"
            }
            autoOpen={true}
            initialQuestion={selectedQuestion}
            isDemo={true}
          />
        </>
      )}
    </div>
  )
}