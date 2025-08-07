'use client'

import { motion } from 'framer-motion'
import { Sparkles, Zap, Trophy, Shield, Brain, Target } from 'lucide-react'

export default function CompetitiveAdvantage() {
  const advantages = [
    {
      icon: Brain,
      title: 'Powered by Claude AI',
      description: 'Industry-leading Anthropic Claude 3.5 models - superior to generic chatbots',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Zap,
      title: '85% Automation Rate',
      description: 'Handle 85% of guest inquiries automatically, 24/7',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      icon: Trophy,
      title: '15-30% More Bookings',
      description: 'Proven increase in direct bookings, reducing OTA commissions',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Shield,
      title: 'No Hidden Costs',
      description: 'Transparent pricing with usage-based alternatives available',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Sparkles,
      title: 'Instant Deployment',
      description: 'Starter & Professional tiers activate immediately after payment',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      icon: Target,
      title: 'Hospitality-Focused',
      description: 'Built specifically for hotels, not a generic chatbot',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Why Choose Us
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              The Claude AI Advantage
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              While competitors use generic AI, we leverage Anthropic&apos;s Claude - 
              the most advanced conversational AI designed for safety and helpfulness
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {advantages.map((advantage, index) => {
            const Icon = advantage.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="h-full p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all bg-white">
                  <div className={`inline-flex p-3 rounded-lg ${advantage.bgColor} mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-6 w-6 ${advantage.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {advantage.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {advantage.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 p-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white text-center max-w-4xl mx-auto"
        >
          <h3 className="text-2xl font-bold mb-4">
            Claude vs. Generic Chatbots
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div>
              <h4 className="font-semibold mb-2 text-yellow-300">Claude Haiku (Starter)</h4>
              <ul className="text-sm space-y-1 text-white/90">
                <li>• 3x faster than GPT-3.5</li>
                <li>• Better context understanding</li>
                <li>• Safer, more accurate responses</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-yellow-300">Claude Sonnet (Pro+)</h4>
              <ul className="text-sm space-y-1 text-white/90">
                <li>• Outperforms GPT-4 on hospitality</li>
                <li>• Superior nuance & empathy</li>
                <li>• Multi-turn conversation mastery</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-yellow-300">Why It Matters</h4>
              <ul className="text-sm space-y-1 text-white/90">
                <li>• Higher guest satisfaction</li>
                <li>• Fewer escalations to staff</li>
                <li>• More natural conversations</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}