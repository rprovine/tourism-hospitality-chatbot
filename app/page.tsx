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
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ChatWidget from '@/components/chatbot/ChatWidget'
import { tierComparison, pricingTiers, useCases, sampleQuestions } from '@/lib/data/pricing'

export default function LandingPage() {
  const [selectedTier, setSelectedTier] = useState<'starter' | 'professional' | 'premium' | 'enterprise'>('starter')
  const [showDemo, setShowDemo] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState('')

  return (
    <div id="top" className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="#top" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Bot className="h-8 w-8 text-cyan-700" />
              <span className="text-xl font-bold text-gray-900">LeniLani Hospitality AI</span>
            </a>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-gray-800 font-semibold hover:text-cyan-700 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-800 font-semibold hover:text-cyan-700 transition-colors">Pricing</a>
              <a href="#demo" className="text-gray-800 font-semibold hover:text-cyan-700 transition-colors">Demo</a>
              <a href="/login" className="text-gray-800 font-semibold hover:text-cyan-700 transition-colors">Login</a>
              <Button 
                className="bg-cyan-700 hover:bg-cyan-800 text-white font-semibold shadow-md"
                onClick={() => window.location.href = '/register'}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-cyan-50 text-cyan-800 px-4 py-2 rounded-full mb-6 border border-cyan-200">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">AI-Powered Guest Experience Platform</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Transform Your Hospitality Business with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-blue-700">
              Intelligent AI Chatbots
            </span>
          </h1>
          <p className="text-xl text-gray-700 mb-8 leading-relaxed">
            24/7 guest assistance, instant bookings, and personalized recommendations. 
            Perfect for hotels, tour operators, and vacation rentals in Hawaii.
          </p>
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
            { label: 'Response Time', value: '<1 sec', icon: Zap },
            { label: 'Languages', value: '10+', icon: Globe },
            { label: 'Uptime', value: '99.9%', icon: Shield },
            { label: 'Support', value: '24/7', icon: HeadphonesIcon }
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

      {/* Use Cases */}
      <section className="bg-gray-100 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for Hawaii&apos;s Tourism Industry</h2>
            <p className="text-lg text-gray-700">Tailored solutions for every hospitality business</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                    <div className="text-2xl font-extrabold text-gray-900 mt-2">$299<span className="text-sm font-normal text-gray-600">/mo</span></div>
                  </th>
                  <th className="text-center py-6 px-4 bg-cyan-50 min-w-[150px]">
                    <div className="inline-flex items-center gap-2 mb-2">
                      <span className="font-bold text-lg text-gray-900">Professional</span>
                      <span className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white text-xs px-2 py-1 rounded-full font-bold uppercase">Popular</span>
                    </div>
                    <div className="text-2xl font-extrabold text-cyan-700">$899<span className="text-sm font-normal text-gray-600">/mo</span></div>
                  </th>
                  <th className="text-center py-6 px-4 bg-purple-50 min-w-[150px]">
                    <div className="inline-flex items-center gap-2 mb-2">
                      <span className="font-bold text-lg text-gray-900">Premium</span>
                      <span className="text-2xl">✨</span>
                    </div>
                    <div className="text-2xl font-extrabold text-purple-700">$2,499<span className="text-sm font-normal text-gray-600">/mo</span></div>
                  </th>
                  <th className="text-center py-6 px-4 bg-gray-100 min-w-[150px]">
                    <div className="inline-flex items-center gap-2 mb-2">
                      <span className="font-bold text-lg text-gray-900">Enterprise</span>
                      <span className="text-2xl">🏢</span>
                    </div>
                    <div className="text-2xl font-extrabold text-gray-900">Custom</div>
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
                      <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                      <span className="text-gray-700 font-medium">/month</span>
                    </div>
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
                      onClick={() => window.location.href = '/register'}
                    >
                      Get Started
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
              {selectedTier === 'starter' ? 'Starter Tier' : 
               selectedTier === 'professional' ? 'Professional Tier' : 
               selectedTier === 'premium' ? 'Premium Tier 👑' : 
               'Enterprise Tier 🏢'} Capabilities
            </CardTitle>
            <CardDescription>
              Try these sample questions to see the AI in action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sampleQuestions[selectedTier].map((question, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
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
              onClick={() => window.location.href = '/register'}
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
                <li><a href="#" className="hover:text-cyan-400 transition-colors text-gray-300">Features</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors text-gray-300">Pricing</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors text-gray-300">Demo</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors text-gray-300">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-cyan-400 transition-colors text-gray-300">About</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors text-gray-300">Contact</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors text-gray-300">Partners</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors text-gray-300">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-cyan-400 transition-colors text-gray-300">Documentation</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors text-gray-300">Help Center</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors text-gray-300">Status</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors text-gray-300">Terms</a></li>
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
          />
        </>
      )}
    </div>
  )
}