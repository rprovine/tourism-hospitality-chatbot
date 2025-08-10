'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CheckCircle2, 
  Circle, 
  Rocket,
  BookOpen,
  MessageSquare,
  Settings,
  Upload,
  Globe,
  Users,
  BarChart3,
  Zap,
  Target,
  ArrowRight,
  Download,
  Copy,
  Phone,
  Mail,
  AlertCircle,
  Lightbulb,
  FileText,
  Database,
  Link as LinkIcon,
  Star,
  TrendingUp,
  Shield,
  Clock,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

interface ChecklistItem {
  id: string
  title: string
  description: string
  completed: boolean
  priority: 'essential' | 'recommended' | 'optional'
  link?: string
  timeEstimate?: string
}

interface TierGuide {
  tier: string
  title: string
  description: string
  setupSteps: ChecklistItem[]
  bestPractices: string[]
  proTips: string[]
  commonMistakes: string[]
  successMetrics: string[]
  upgradeHints?: string[]
}

export default function GettingStartedPage() {
  const [businessTier, setBusinessTier] = useState<string>('starter')
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState('checklist')
  const [showEmbedCode, setShowEmbedCode] = useState(false)

  useEffect(() => {
    // Get business tier and load saved progress
    const businessData = localStorage.getItem('business')
    if (businessData) {
      const business = JSON.parse(businessData)
      setBusinessTier(business.tier || 'starter')
    }
    
    // Load saved progress
    const savedProgress = localStorage.getItem('onboarding_progress')
    if (savedProgress) {
      setCompletedSteps(new Set(JSON.parse(savedProgress)))
    }
  }, [])

  const toggleStep = (stepId: string) => {
    const newCompleted = new Set(completedSteps)
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId)
    } else {
      newCompleted.add(stepId)
    }
    setCompletedSteps(newCompleted)
    localStorage.setItem('onboarding_progress', JSON.stringify(Array.from(newCompleted)))
  }

  const tierGuides: Record<string, TierGuide> = {
    starter: {
      tier: 'starter',
      title: 'Starter Plan Setup Guide',
      description: 'Get your basic chatbot up and running in 30 minutes',
      setupSteps: [
        {
          id: 'starter-1',
          title: 'Complete Business Profile',
          description: 'Add your business name, contact info, and hours of operation',
          completed: false,
          priority: 'essential',
          link: '/settings',
          timeEstimate: '5 min'
        },
        {
          id: 'starter-2',
          title: 'Add Top 20 FAQs',
          description: 'Start with your most common questions: hours, location, parking, wifi password, check-in/out times',
          completed: false,
          priority: 'essential',
          link: '/knowledge-base',
          timeEstimate: '15 min'
        },
        {
          id: 'starter-3',
          title: 'Configure Quick Actions',
          description: 'Set up responses for "Check Availability", "View Amenities", and "Get Directions" buttons',
          completed: false,
          priority: 'essential',
          link: '/knowledge-base',
          timeEstimate: '5 min'
        },
        {
          id: 'starter-4',
          title: 'Customize Welcome Message',
          description: 'Create a friendly greeting that reflects your brand voice',
          completed: false,
          priority: 'essential',
          link: '/ai-config',
          timeEstimate: '2 min'
        },
        {
          id: 'starter-5',
          title: 'Test Your Chatbot',
          description: 'Try common questions to ensure responses are accurate',
          completed: false,
          priority: 'essential',
          link: '/dashboard',
          timeEstimate: '5 min'
        },
        {
          id: 'starter-6',
          title: 'Install on Website',
          description: 'Copy and paste the widget code to your website',
          completed: false,
          priority: 'essential',
          timeEstimate: '5 min'
        },
        {
          id: 'starter-7',
          title: 'Add Seasonal Information',
          description: 'Include holiday hours, seasonal amenities, or special events',
          completed: false,
          priority: 'recommended',
          link: '/knowledge-base',
          timeEstimate: '10 min'
        },
        {
          id: 'starter-8',
          title: 'Create Contact Collection Q&As',
          description: 'Add responses that encourage guests to share contact info for follow-up',
          completed: false,
          priority: 'recommended',
          link: '/knowledge-base',
          timeEstimate: '5 min'
        }
      ],
      bestPractices: [
        '📝 Focus on your TOP 20 most asked questions first - quality over quantity',
        '📞 Always include your phone number in booking-related responses',
        '⏰ Update seasonal information monthly (pool hours, special events)',
        '🎯 Use specific keywords in your Q&As for better matching',
        '👥 Train front desk staff to mention the chat option to guests',
        '📊 Review chat logs weekly to identify new questions to add',
        '✉️ Set up email alerts for when guests leave contact information',
        '🔄 Keep answers concise - under 3 sentences when possible'
      ],
      proTips: [
        '💡 Add variations of the same question for better matching (e.g., "wifi", "internet", "wi-fi")',
        '🎨 Match widget color to your website for seamless integration',
        '📱 Test on mobile devices - 60% of users chat from phones',
        '🌟 Add your direct booking link even if you can\'t process bookings in chat',
        '📈 Track which Q&As get used most and prioritize updates to those'
      ],
      commonMistakes: [
        '❌ Adding too many Q&As at once - start with 20 essential ones',
        '❌ Using technical hotel jargon guests won\'t search for',
        '❌ Forgetting to update seasonal information',
        '❌ Not including contact info in responses that need follow-up',
        '❌ Making answers too long - guests want quick info'
      ],
      successMetrics: [
        '✅ 80% of common questions answered without phone calls',
        '✅ 10+ guest email addresses collected per week',
        '✅ 50% reduction in repetitive phone inquiries',
        '✅ Widget active on website homepage and contact page',
        '✅ All staff aware of chatbot capabilities'
      ],
      upgradeHints: [
        '🚀 Getting 20+ booking inquiries weekly? Upgrade to Professional for instant booking',
        '🌍 International guests? Professional adds multi-language support',
        '📊 Need guest history? Professional includes CRM integration'
      ]
    },
    professional: {
      tier: 'professional',
      title: 'Professional Plan Setup Guide',
      description: 'Maximize bookings and guest satisfaction with advanced features',
      setupSteps: [
        {
          id: 'pro-1',
          title: 'Complete Starter Setup',
          description: 'Ensure all basic Q&As and profile info are complete',
          completed: false,
          priority: 'essential',
          link: '/settings',
          timeEstimate: '10 min'
        },
        {
          id: 'pro-2',
          title: 'Connect Your PMS/Booking System',
          description: 'Enable real-time availability and instant booking',
          completed: false,
          priority: 'essential',
          link: '/integrations',
          timeEstimate: '30 min'
        },
        {
          id: 'pro-3',
          title: 'Import Guest Database',
          description: 'Upload existing guest profiles for personalized service',
          completed: false,
          priority: 'essential',
          link: '/guest-profiles',
          timeEstimate: '15 min'
        },
        {
          id: 'pro-4',
          title: 'Set Up Room Types & Rates',
          description: 'Configure all room categories with descriptions and dynamic pricing',
          completed: false,
          priority: 'essential',
          link: '/ai-config',
          timeEstimate: '20 min'
        },
        {
          id: 'pro-5',
          title: 'Enable Multi-Language Support',
          description: 'Activate languages for your top guest demographics',
          completed: false,
          priority: 'recommended',
          link: '/ai-config',
          timeEstimate: '10 min'
        },
        {
          id: 'pro-6',
          title: 'Configure Email/SMS Notifications',
          description: 'Set up alerts for bookings, VIP guests, and high-value inquiries',
          completed: false,
          priority: 'recommended',
          link: '/integrations',
          timeEstimate: '10 min'
        },
        {
          id: 'pro-7',
          title: 'Create Upsell Opportunities',
          description: 'Add spa services, dining reservations, and activities to booking flow',
          completed: false,
          priority: 'recommended',
          link: '/knowledge-base',
          timeEstimate: '15 min'
        },
        {
          id: 'pro-8',
          title: 'Train Revenue Management AI',
          description: 'Set pricing rules and occupancy targets for dynamic pricing',
          completed: false,
          priority: 'optional',
          link: '/ai-config',
          timeEstimate: '20 min'
        },
        {
          id: 'pro-9',
          title: 'Implement on OTA Websites',
          description: 'Add widget to Booking.com, Expedia landing pages',
          completed: false,
          priority: 'optional',
          timeEstimate: '15 min'
        }
      ],
      bestPractices: [
        '🎯 Keep room inventory updated in real-time to prevent overbooking',
        '👤 Tag VIP guests and repeat customers for special treatment',
        '💰 Set up package deals (room + breakfast, romantic getaway)',
        '🌍 Translate key amenities and policies for top 3 guest languages',
        '📧 Send booking confirmations within 2 minutes',
        '📊 Review conversion metrics weekly and adjust messaging',
        '🔄 Sync with PMS every 15 minutes for accuracy',
        '💳 Display your best available rate prominently',
        '🎁 Create seasonal packages and promote via chatbot'
      ],
      proTips: [
        '🚀 Create urgency with "Only 2 rooms left" messaging when below 20% availability',
        '💎 Offer room upgrades at 50% discount during slow periods',
        '📱 Enable WhatsApp integration for international guests',
        '🏆 Give returning guests their previous room if available',
        '📈 A/B test different upsell messages to maximize revenue',
        '🎯 Set up abandoned cart recovery for incomplete bookings'
      ],
      commonMistakes: [
        '❌ Not updating inventory during peak booking times',
        '❌ Generic responses for all guest types (business vs. leisure)',
        '❌ Forgetting to promote packages and special offers',
        '❌ Not following up on high-value inquiries quickly',
        '❌ Overwhelming guests with too many upsell options'
      ],
      successMetrics: [
        '✅ 30% of bookings coming through chatbot',
        '✅ Average response time under 2 seconds',
        '✅ 15% upsell conversion rate on amenities',
        '✅ 90% guest satisfaction rating',
        '✅ 25% increase in direct bookings',
        '✅ 40% reduction in OTA commissions'
      ],
      upgradeHints: [
        '💼 Managing multiple properties? Premium adds multi-property support',
        '📊 Need advanced analytics? Premium includes predictive insights',
        '🌟 Want white-glove service? Premium includes dedicated support'
      ]
    },
    premium: {
      tier: 'premium',
      title: 'Premium Plan Power User Guide',
      description: 'Enterprise-grade setup for maximum automation and revenue',
      setupSteps: [
        {
          id: 'prem-1',
          title: 'Complete Professional Setup',
          description: 'Ensure all Professional features are fully configured',
          completed: false,
          priority: 'essential',
          timeEstimate: '30 min'
        },
        {
          id: 'prem-2',
          title: 'Integrate All Revenue Channels',
          description: 'Connect restaurant POS, spa booking, activities, and retail',
          completed: false,
          priority: 'essential',
          link: '/integrations',
          timeEstimate: '2 hours'
        },
        {
          id: 'prem-3',
          title: 'Configure AI Personalization',
          description: 'Set up guest preference learning and predictive recommendations',
          completed: false,
          priority: 'essential',
          link: '/ai-config',
          timeEstimate: '45 min'
        },
        {
          id: 'prem-4',
          title: 'Import Historical Data',
          description: 'Upload 2+ years of booking data for AI training',
          completed: false,
          priority: 'essential',
          link: '/analytics',
          timeEstimate: '1 hour'
        },
        {
          id: 'prem-5',
          title: 'Set Up Multi-Property Dashboard',
          description: 'Configure portfolio view if managing multiple properties',
          completed: false,
          priority: 'recommended',
          link: '/dashboard',
          timeEstimate: '30 min'
        },
        {
          id: 'prem-6',
          title: 'Create VIP Guest Workflows',
          description: 'Automate special treatment for high-value guests',
          completed: false,
          priority: 'recommended',
          link: '/guest-profiles',
          timeEstimate: '30 min'
        },
        {
          id: 'prem-7',
          title: 'Enable Predictive Analytics',
          description: 'Configure demand forecasting and pricing optimization',
          completed: false,
          priority: 'recommended',
          link: '/analytics',
          timeEstimate: '45 min'
        },
        {
          id: 'prem-8',
          title: 'Build Custom Integrations',
          description: 'Connect proprietary systems via API',
          completed: false,
          priority: 'optional',
          link: '/integrations',
          timeEstimate: '4 hours'
        },
        {
          id: 'prem-9',
          title: 'Train Your Team',
          description: 'Conduct staff training on advanced features',
          completed: false,
          priority: 'essential',
          timeEstimate: '2 hours'
        }
      ],
      bestPractices: [
        '🎯 Use AI insights to adjust pricing 4x daily during peak season',
        '🏆 Create automatic VIP recognition for guests spending $10K+ annually',
        '📊 Set up custom dashboards for each department (front desk, sales, revenue)',
        '🤖 Let AI handle 80% of interactions, escalate complex requests only',
        '💼 Create corporate account portals for your top 10 business clients',
        '🌍 Offer support in 10+ languages to capture global market',
        '📈 Use predictive analytics to staff appropriately for forecasted demand',
        '🎁 Automate birthday and anniversary recognition with special offers',
        '🔄 Integrate with CRM for 360-degree guest view across all touchpoints'
      ],
      proTips: [
        '💡 Use AI to identify guests likely to extend stays and offer targeted deals',
        '🚀 Set up "surprise and delight" automation for milestone stays (10th visit)',
        '📱 Create dedicated chat flows for group bookings and events',
        '💰 Enable cryptocurrency payments for international luxury travelers',
        '🎯 Use sentiment analysis to identify and resolve issues before reviews',
        '📊 Export data to PowerBI for executive reporting',
        '🏅 Gamify staff performance with chatbot interaction metrics'
      ],
      commonMistakes: [
        '❌ Over-automating without human oversight for VIP interactions',
        '❌ Not segmenting guests for targeted messaging',
        '❌ Ignoring AI recommendations for pricing optimization',
        '❌ Failing to integrate all revenue centers into unified system',
        '❌ Not training staff on advanced features they could leverage'
      ],
      successMetrics: [
        '✅ 50% of revenue from direct bookings',
        '✅ 25% increase in average daily rate',
        '✅ 35% upsell rate on premium amenities',
        '✅ 95% guest satisfaction score',
        '✅ 30% reduction in operational costs',
        '✅ 20% increase in repeat guest rate',
        '✅ RevPAR increased by 40%'
      ]
    },
    enterprise: {
      tier: 'enterprise',
      title: 'Enterprise Implementation Playbook',
      description: 'Complete digital transformation for hotel groups and chains',
      setupSteps: [
        {
          id: 'ent-1',
          title: 'Strategic Planning Session',
          description: 'Define KPIs, integration roadmap, and success metrics with stakeholders',
          completed: false,
          priority: 'essential',
          timeEstimate: '1 week'
        },
        {
          id: 'ent-2',
          title: 'Technical Infrastructure Audit',
          description: 'Assess current systems and plan integration architecture',
          completed: false,
          priority: 'essential',
          timeEstimate: '3 days'
        },
        {
          id: 'ent-3',
          title: 'Data Migration & Cleansing',
          description: 'Consolidate and clean data from all properties and systems',
          completed: false,
          priority: 'essential',
          timeEstimate: '2 weeks'
        },
        {
          id: 'ent-4',
          title: 'Custom Development Sprint',
          description: 'Build property-specific features and brand customizations',
          completed: false,
          priority: 'essential',
          timeEstimate: '4 weeks'
        },
        {
          id: 'ent-5',
          title: 'Pilot Property Launch',
          description: 'Deploy to 1-2 properties for testing and refinement',
          completed: false,
          priority: 'essential',
          timeEstimate: '2 weeks'
        },
        {
          id: 'ent-6',
          title: 'Group-Wide Training Program',
          description: 'Train all property managers and key staff',
          completed: false,
          priority: 'essential',
          timeEstimate: '1 week'
        },
        {
          id: 'ent-7',
          title: 'Phased Rollout',
          description: 'Deploy to all properties in planned phases',
          completed: false,
          priority: 'essential',
          timeEstimate: '4 weeks'
        },
        {
          id: 'ent-8',
          title: 'Performance Optimization',
          description: 'Fine-tune based on real-world usage and metrics',
          completed: false,
          priority: 'essential',
          timeEstimate: 'Ongoing'
        }
      ],
      bestPractices: [
        '🏢 Standardize core features while allowing property-level customization',
        '📊 Implement centralized reporting with property-level drill-downs',
        '🔐 Set up role-based access control for corporate vs. property staff',
        '🌐 Create brand standards for AI personality and voice',
        '💼 Establish SLAs for support response times',
        '🎯 Define clear escalation paths for each property',
        '📈 Set up automated reporting to C-suite stakeholders',
        '🔄 Plan quarterly feature releases with property manager input',
        '🏆 Create inter-property competitions using platform metrics'
      ],
      proTips: [
        '🚀 Start with highest-revenue properties for maximum ROI impact',
        '💡 Create property-specific dashboards for GMs',
        '📱 Build mobile app for property managers to monitor on-the-go',
        '🎯 Use A/B testing across properties to optimize conversion',
        '💰 Negotiate group-wide vendor integrations for cost savings',
        '🌟 Showcase success stories in internal communications'
      ],
      commonMistakes: [
        '❌ Rolling out to all properties simultaneously without testing',
        '❌ Not getting buy-in from property-level management',
        '❌ Underestimating training and change management needs',
        '❌ Over-standardizing without allowing local market adaptation',
        '❌ Not planning for 24/7 support across time zones'
      ],
      successMetrics: [
        '✅ 60% of all bookings through platform',
        '✅ 45% reduction in customer service costs',
        '✅ 30% increase in portfolio RevPAR',
        '✅ 98% system uptime',
        '✅ 50% reduction in training time for new staff',
        '✅ 35% increase in corporate account retention'
      ]
    }
  }

  const currentGuide = tierGuides[businessTier] || tierGuides.starter
  const completedCount = currentGuide.setupSteps.filter(step => completedSteps.has(step.id)).length
  const progressPercentage = (completedCount / currentGuide.setupSteps.length) * 100

  const getEmbedCode = () => {
    const businessData = localStorage.getItem('business')
    const business = businessData ? JSON.parse(businessData) : { id: 'your-business-id' }
    
    return `<!-- LeniLani AI Chat Widget -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://app.lenilani.ai/widget.js';
    script.setAttribute('data-business-id', '${business.id}');
    script.setAttribute('data-position', 'bottom-right');
    script.async = true;
    document.head.appendChild(script);
  })();
</script>
<!-- End LeniLani AI Chat Widget -->`
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'essential': return 'text-red-600 bg-red-50 border-red-200'
      case 'recommended': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'optional': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'essential': return 'Essential'
      case 'recommended': return 'Recommended'
      case 'optional': return 'Optional'
      default: return priority
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
            <Rocket className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Getting Started Guide</h1>
            <p className="text-gray-600 mt-1">{currentGuide.description}</p>
          </div>
          <Badge className="text-lg px-4 py-2" variant="outline">
            {businessTier.charAt(0).toUpperCase() + businessTier.slice(1)} Plan
          </Badge>
        </div>

        {/* Progress Bar */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">Setup Progress</h3>
              <p className="text-sm text-gray-600">
                {completedCount} of {currentGuide.setupSteps.length} steps completed
              </p>
            </div>
            <div className="text-3xl font-bold text-cyan-600">
              {Math.round(progressPercentage)}%
            </div>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          {progressPercentage === 100 && (
            <Alert className="mt-4 border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Congratulations!</AlertTitle>
              <AlertDescription className="text-green-700">
                You've completed all setup steps. Your chatbot is fully configured!
              </AlertDescription>
            </Alert>
          )}
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="checklist">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Checklist
          </TabsTrigger>
          <TabsTrigger value="best-practices">
            <Lightbulb className="h-4 w-4 mr-2" />
            Best Practices
          </TabsTrigger>
          <TabsTrigger value="resources">
            <BookOpen className="h-4 w-4 mr-2" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Success Metrics
          </TabsTrigger>
        </TabsList>

        {/* Checklist Tab */}
        <TabsContent value="checklist" className="space-y-4">
          <div className="grid gap-4">
            {['essential', 'recommended', 'optional'].map(priority => {
              const steps = currentGuide.setupSteps.filter(s => s.priority === priority)
              if (steps.length === 0) return null
              
              return (
                <Card key={priority}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge className={getPriorityColor(priority)}>
                        {getPriorityLabel(priority)}
                      </Badge>
                      <span className="text-sm font-normal text-gray-600">
                        ({steps.filter(s => completedSteps.has(s.id)).length}/{steps.length} completed)
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {steps.map(step => (
                      <div
                        key={step.id}
                        className={`flex items-start gap-3 p-3 rounded-lg transition-all cursor-pointer hover:bg-gray-50 ${
                          completedSteps.has(step.id) ? 'bg-green-50' : 'bg-white'
                        }`}
                        onClick={() => toggleStep(step.id)}
                      >
                        <button className="mt-1">
                          {completedSteps.has(step.id) ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-medium ${
                              completedSteps.has(step.id) ? 'text-gray-500 line-through' : 'text-gray-900'
                            }`}>
                              {step.title}
                            </h4>
                            {step.timeEstimate && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {step.timeEstimate}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                        </div>
                        {step.link && !completedSteps.has(step.id) && (
                          <Link href={step.link}>
                            <Button size="sm" variant="ghost">
                              Start
                              <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Quick Install Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Quick Install
              </CardTitle>
              <CardDescription>
                Add the chatbot to your website in seconds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Copy this code and paste it before the closing &lt;/body&gt; tag on your website
                  </AlertDescription>
                </Alert>
                
                {showEmbedCode ? (
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{getEmbedCode()}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2 bg-white hover:bg-gray-100"
                      onClick={() => {
                        navigator.clipboard.writeText(getEmbedCode())
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setShowEmbedCode(true)} className="w-full">
                    Show Embed Code
                  </Button>
                )}
                
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Download Instructions
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Mail className="h-4 w-4 mr-2" />
                    Email to Developer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Best Practices Tab */}
        <TabsContent value="best-practices" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Best Practices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentGuide.bestPractices.map((practice, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-lg">{practice.substring(0, 2)}</span>
                      <p className="text-sm text-gray-700">{practice.substring(2)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pro Tips */}
            <Card className="border-cyan-200 bg-cyan-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-900">
                  <Lightbulb className="h-5 w-5 text-cyan-600" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentGuide.proTips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-lg">{tip.substring(0, 2)}</span>
                      <p className="text-sm text-cyan-900">{tip.substring(2)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Common Mistakes */}
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Common Mistakes to Avoid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentGuide.commonMistakes.map((mistake, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-lg text-red-600">❌</span>
                      <p className="text-sm text-red-900">{mistake.substring(2)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upgrade Hints */}
            {currentGuide.upgradeHints && (
              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-900">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    Ready to Level Up?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentGuide.upgradeHints.map((hint, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-lg">{hint.substring(0, 2)}</span>
                        <p className="text-sm text-purple-900">{hint.substring(2)}</p>
                      </div>
                    ))}
                    <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                      View Upgrade Options
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-blue-600" />
                  Quick Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/knowledge-base" className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                  <Database className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Knowledge Base</span>
                </Link>
                <Link href="/ai-config" className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                  <Settings className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">AI Configuration</span>
                </Link>
                <Link href="/integrations" className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Integrations</span>
                </Link>
                <Link href="/analytics" className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                  <BarChart3 className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Analytics</span>
                </Link>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Get Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Documentation
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Live Chat Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  Schedule Call
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Button>
              </CardContent>
            </Card>

            {/* Downloads */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-indigo-600" />
                  Downloads
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Setup Guide PDF
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Q&A Templates
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  ROI Calculator
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Brand Assets
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Video Tutorials */}
          <Card>
            <CardHeader>
              <CardTitle>Video Tutorials</CardTitle>
              <CardDescription>Step-by-step video guides for common tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { title: 'Initial Setup', duration: '5:32', views: '1.2K' },
                  { title: 'Adding Q&As', duration: '3:45', views: '856' },
                  { title: 'Website Installation', duration: '2:18', views: '643' },
                  { title: 'Booking Integration', duration: '8:24', views: '432' },
                  { title: 'Multi-Language Setup', duration: '4:15', views: '321' },
                  { title: 'Analytics Overview', duration: '6:51', views: '287' }
                ].map((video, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="aspect-video bg-gray-200 rounded mb-3 flex items-center justify-center">
                      <div className="text-gray-400">
                        <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    <h4 className="font-medium text-sm">{video.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span>{video.duration}</span>
                      <span>•</span>
                      <span>{video.views} views</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Success Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Success Metrics for {businessTier.charAt(0).toUpperCase() + businessTier.slice(1)} Plan
              </CardTitle>
              <CardDescription>
                Key performance indicators to track your chatbot's effectiveness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentGuide.successMetrics.map((metric, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <p className="text-sm text-gray-700">{metric.substring(2)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Track Your Progress</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Monitor these metrics weekly to ensure you're getting maximum value from your chatbot
                </p>
                <Link href="/analytics">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    View Analytics Dashboard
                    <BarChart3 className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* ROI Calculator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                ROI Calculator
              </CardTitle>
              <CardDescription>
                Estimate your return on investment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Monthly Phone Inquiries</label>
                    <Input type="number" placeholder="500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Average Handle Time (min)</label>
                    <Input type="number" placeholder="5" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Staff Hourly Cost</label>
                    <Input type="number" placeholder="25" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Conversion Rate Increase (%)</label>
                    <Input type="number" placeholder="15" />
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-600">Monthly Savings</p>
                      <p className="text-2xl font-bold text-green-600">$2,450</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Additional Revenue</p>
                      <p className="text-2xl font-bold text-green-600">$8,200</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ROI</p>
                      <p className="text-2xl font-bold text-green-600">425%</p>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full">
                  Get Detailed ROI Report
                  <Download className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}