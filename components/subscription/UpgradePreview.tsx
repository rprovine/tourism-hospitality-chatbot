'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Check, 
  X, 
  AlertCircle, 
  ArrowRight,
  Zap,
  Shield,
  Crown,
  Building,
  Plus,
  Minus,
  MessageSquare,
  Users,
  DollarSign,
  ArrowUpRight
} from 'lucide-react'

interface UpgradePreviewProps {
  currentTier: string
  newTier: string
  currentPrice: number
  newPrice: number
  interval: 'monthly' | 'yearly'
  onConfirm: () => void
  onCancel: () => void
}

const tierIcons = {
  starter: Zap,
  professional: Shield,
  premium: Crown,
  enterprise: Building
}

const tierFeatures = {
  starter: {
    conversations: 100,
    knowledgeItems: 50,
    guestProfiles: 0,
    revenueOptimization: false,
    channels: ['Web Chat'],
    aiModels: ['GPT-3.5'],
    support: 'Email',
    api: false,
    whiteLabel: false,
    customIntegrations: false
  },
  professional: {
    conversations: 1000,
    knowledgeItems: 500,
    guestProfiles: 1000,
    revenueOptimization: true,
    channels: ['Web Chat', 'WhatsApp', 'SMS'],
    aiModels: ['GPT-3.5', 'GPT-4'],
    support: 'Priority Email',
    api: false,
    whiteLabel: false,
    customIntegrations: false
  },
  premium: {
    conversations: -1, // unlimited
    knowledgeItems: -1,
    guestProfiles: -1,
    revenueOptimization: true,
    channels: ['Web Chat', 'WhatsApp', 'SMS', 'Instagram', 'Facebook'],
    aiModels: ['GPT-3.5', 'GPT-4', 'Claude Sonnet', 'Claude Opus'],
    support: '24/7 Phone & Email',
    api: true,
    whiteLabel: true,
    customIntegrations: false
  },
  enterprise: {
    conversations: -1,
    knowledgeItems: -1,
    guestProfiles: -1,
    revenueOptimization: true,
    channels: ['All Channels'],
    aiModels: ['All Models'],
    support: 'Dedicated Account Manager',
    api: true,
    whiteLabel: true,
    customIntegrations: true
  }
}

export default function UpgradePreview({
  currentTier,
  newTier,
  currentPrice,
  newPrice,
  interval,
  onConfirm,
  onCancel
}: UpgradePreviewProps) {
  const isDowngrade = ['starter', 'professional', 'premium', 'enterprise'].indexOf(newTier) < 
                      ['starter', 'professional', 'premium', 'enterprise'].indexOf(currentTier)
  
  const CurrentIcon = tierIcons[currentTier as keyof typeof tierIcons] || Zap
  const NewIcon = tierIcons[newTier as keyof typeof tierIcons] || Zap
  
  const currentFeatures = tierFeatures[currentTier as keyof typeof tierFeatures]
  const newFeatures = tierFeatures[newTier as keyof typeof tierFeatures]
  
  const proratedAmount = ((newPrice - currentPrice) * 0.5).toFixed(2) // 50% for half month
  const nextBillingAmount = newPrice
  
  const formatLimit = (value: number, label: string) => {
    if (value === -1) return `Unlimited ${label}`
    if (value === 0) return `No ${label}`
    return `${value.toLocaleString()} ${label}`
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-2xl">
            {isDowngrade ? 'Downgrade' : 'Upgrade'} Preview
          </CardTitle>
          <CardDescription>
            Review the changes to your subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current Plan */}
            <Card className="border-gray-200">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CurrentIcon className="h-8 w-8 text-gray-400" />
                  <Badge variant="outline">Current</Badge>
                </div>
                <CardTitle className="capitalize">{currentTier}</CardTitle>
                <div className="text-2xl font-bold">
                  ${currentPrice}/{interval === 'yearly' ? 'year' : 'month'}
                </div>
              </CardHeader>
            </Card>
            
            {/* Arrow */}
            <div className="flex items-center justify-center">
              <ArrowRight className="h-8 w-8 text-gray-400" />
            </div>
            
            {/* New Plan */}
            <Card className={isDowngrade ? 'border-yellow-400' : 'border-green-400'}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <NewIcon className="h-8 w-8 text-gray-600" />
                  <Badge className={isDowngrade ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                    New
                  </Badge>
                </div>
                <CardTitle className="capitalize">{newTier}</CardTitle>
                <div className="text-2xl font-bold">
                  ${newPrice}/{interval === 'yearly' ? 'year' : 'month'}
                </div>
              </CardHeader>
            </Card>
          </div>
          
          {/* Feature Changes */}
          <div>
            <h3 className="font-semibold mb-3">What Changes</h3>
            <div className="space-y-2">
              {/* Conversations */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Monthly Conversations</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {formatLimit(currentFeatures.conversations, 'conversations')}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <span className={`text-sm font-medium ${
                    newFeatures.conversations > currentFeatures.conversations ? 'text-green-600' : 
                    newFeatures.conversations < currentFeatures.conversations ? 'text-red-600' : ''
                  }`}>
                    {formatLimit(newFeatures.conversations, 'conversations')}
                  </span>
                </div>
              </div>
              
              {/* Knowledge Items */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Knowledge Base Items</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {formatLimit(currentFeatures.knowledgeItems, 'items')}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <span className={`text-sm font-medium ${
                    newFeatures.knowledgeItems > currentFeatures.knowledgeItems ? 'text-green-600' : 
                    newFeatures.knowledgeItems < currentFeatures.knowledgeItems ? 'text-red-600' : ''
                  }`}>
                    {formatLimit(newFeatures.knowledgeItems, 'items')}
                  </span>
                </div>
              </div>
              
              {/* Guest Profiles */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Guest Intelligence Profiles</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {formatLimit(currentFeatures.guestProfiles, 'profiles')}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <span className={`text-sm font-medium ${
                    newFeatures.guestProfiles > currentFeatures.guestProfiles ? 'text-green-600' : 
                    newFeatures.guestProfiles < currentFeatures.guestProfiles ? 'text-red-600' : ''
                  }`}>
                    {formatLimit(newFeatures.guestProfiles, 'profiles')}
                  </span>
                </div>
              </div>
              
              {/* Revenue Optimization */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Revenue Optimization</span>
                <div className="flex items-center gap-2">
                  {currentFeatures.revenueOptimization ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-gray-400" />
                  )}
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  {newFeatures.revenueOptimization ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Downgrade Warnings */}
          {isDowngrade && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <div className="font-semibold mb-2">Important: Data Loss Warning</div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {currentFeatures.conversations > newFeatures.conversations && newFeatures.conversations !== -1 && (
                    <li>Conversation history will be limited to {newFeatures.conversations} per month</li>
                  )}
                  {currentFeatures.knowledgeItems > newFeatures.knowledgeItems && newFeatures.knowledgeItems !== -1 && (
                    <li>Only your most recent {newFeatures.knowledgeItems} knowledge items will be retained</li>
                  )}
                  {currentFeatures.guestProfiles > newFeatures.guestProfiles && newFeatures.guestProfiles > 0 && (
                    <li>Guest profiles will be limited to {newFeatures.guestProfiles} profiles</li>
                  )}
                  {currentFeatures.guestProfiles > 0 && newFeatures.guestProfiles === 0 && (
                    <li>You will lose access to Guest Intelligence features</li>
                  )}
                  {currentFeatures.revenueOptimization && !newFeatures.revenueOptimization && (
                    <li>Revenue Optimization features will be disabled</li>
                  )}
                </ul>
                <div className="mt-3 font-medium">
                  Grace Period: You'll have 30 days to export your data before it's removed.
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Billing Information */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg">Billing Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Current plan ({currentTier})</span>
                <span className="text-sm">${currentPrice}/{interval}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">New plan ({newTier})</span>
                <span className="text-sm font-medium">${newPrice}/{interval}</span>
              </div>
              {!isDowngrade && (
                <>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="text-sm text-gray-600">Prorated charge (this period)</span>
                    <span className="text-sm font-medium text-green-600">+${proratedAmount}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    You'll be charged the prorated amount immediately
                  </div>
                </>
              )}
              <div className="border-t pt-3 flex justify-between">
                <span className="font-medium">Next billing amount</span>
                <span className="font-bold text-lg">${nextBillingAmount}/{interval}</span>
              </div>
            </CardContent>
          </Card>
          
          {/* New Features Gained (for upgrades) */}
          {!isDowngrade && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="h-5 w-5 text-green-600" />
                  New Features You'll Unlock
                </CardTitle>
                <CardDescription className="text-green-700">
                  Everything you need to transform your guest experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Channel Expansions */}
                {newFeatures.channels.filter(c => !currentFeatures.channels.includes(c)).length > 0 && (
                  <div className="pb-3 border-b border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Multi-Channel Communication
                    </h4>
                    <ul className="space-y-2">
                      {newFeatures.channels.filter(c => !currentFeatures.channels.includes(c)).map((channel) => (
                        <li key={channel} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600 mt-0.5" />
                          <div>
                            <span className="font-medium">{channel}</span>
                            {channel === 'WhatsApp' && (
                              <p className="text-xs text-green-600 mt-0.5">Connect with 2+ billion WhatsApp users. Send booking confirmations, answer questions, and provide support 24/7.</p>
                            )}
                            {channel === 'SMS' && (
                              <p className="text-xs text-green-600 mt-0.5">Reach guests instantly with 98% open rates. Perfect for urgent updates and last-minute offers.</p>
                            )}
                            {channel === 'Instagram' && (
                              <p className="text-xs text-green-600 mt-0.5">Engage younger travelers on their favorite platform. Handle DMs automatically.</p>
                            )}
                            {channel === 'Facebook' && (
                              <p className="text-xs text-green-600 mt-0.5">Manage Facebook Messenger conversations. Never miss a potential booking.</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* AI Model Upgrades */}
                {newFeatures.aiModels.filter(m => !currentFeatures.aiModels.includes(m)).length > 0 && (
                  <div className="pb-3 border-b border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Advanced AI Models
                    </h4>
                    <ul className="space-y-2">
                      {newFeatures.aiModels.filter(m => !currentFeatures.aiModels.includes(m)).map((model) => (
                        <li key={model} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600 mt-0.5" />
                          <div>
                            <span className="font-medium">{model}</span>
                            {model === 'GPT-4' && (
                              <p className="text-xs text-green-600 mt-0.5">Most advanced reasoning. Handles complex requests, multi-step bookings, and nuanced conversations.</p>
                            )}
                            {model === 'Claude Sonnet' && (
                              <p className="text-xs text-green-600 mt-0.5">Superior conversation flow. More natural, empathetic responses that feel genuinely human.</p>
                            )}
                            {model === 'Claude Opus' && (
                              <p className="text-xs text-green-600 mt-0.5">Ultimate AI capability. Perfect for luxury properties requiring exceptional service.</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Guest Intelligence */}
                {newFeatures.guestProfiles > 0 && currentFeatures.guestProfiles === 0 && (
                  <div className="pb-3 border-b border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Guest Intelligence System
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <span className="font-medium">Guest Profiles</span>
                          <p className="text-xs text-green-600 mt-0.5">
                            Track {newFeatures.guestProfiles === -1 ? 'unlimited' : newFeatures.guestProfiles.toLocaleString()} guest profiles with preferences, booking history, and lifetime value.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <span className="font-medium">VIP Recognition</span>
                          <p className="text-xs text-green-600 mt-0.5">Automatically identify and prioritize high-value guests for personalized service.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <span className="font-medium">Preference Tracking</span>
                          <p className="text-xs text-green-600 mt-0.5">Remember room preferences, dietary restrictions, and special requests automatically.</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                )}
                
                {/* Revenue Optimization */}
                {newFeatures.revenueOptimization && !currentFeatures.revenueOptimization && (
                  <div className="pb-3 border-b border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Revenue Optimization Suite
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <span className="font-medium">Dynamic Pricing</span>
                          <p className="text-xs text-green-600 mt-0.5">AI-powered rate optimization based on demand, events, and competitor pricing.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <span className="font-medium">Intelligent Upselling</span>
                          <p className="text-xs text-green-600 mt-0.5">Increase revenue by 15-30% with personalized upgrade offers and add-ons.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <span className="font-medium">Cart Recovery</span>
                          <p className="text-xs text-green-600 mt-0.5">Recover up to 40% of abandoned bookings with automated follow-ups.</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                )}
                
                {/* Capacity Increases */}
                <div className="pb-3 border-b border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4" />
                    Increased Capacity
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {newFeatures.conversations > currentFeatures.conversations && (
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <span className="font-medium">
                            {newFeatures.conversations === -1 ? 'Unlimited' : `${newFeatures.conversations.toLocaleString()}`} Monthly Conversations
                          </span>
                          <p className="text-xs text-green-600 mt-0.5">
                            {currentFeatures.conversations === -1 ? '' : `Up from ${currentFeatures.conversations.toLocaleString()} - `}
                            {newFeatures.conversations === -1 ? 'No limits on guest interactions' : 'Handle more guest inquiries'}
                          </p>
                        </div>
                      </li>
                    )}
                    {newFeatures.knowledgeItems > currentFeatures.knowledgeItems && (
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <span className="font-medium">
                            {newFeatures.knowledgeItems === -1 ? 'Unlimited' : `${newFeatures.knowledgeItems.toLocaleString()}`} Knowledge Base Items
                          </span>
                          <p className="text-xs text-green-600 mt-0.5">
                            {currentFeatures.knowledgeItems === -1 ? '' : `Up from ${currentFeatures.knowledgeItems.toLocaleString()} - `}
                            Store more FAQs, policies, and information
                          </p>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
                
                {/* API and White Label */}
                {(newFeatures.api && !currentFeatures.api) || (newFeatures.whiteLabel && !currentFeatures.whiteLabel) && (
                  <div className="pb-3 border-b border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Enterprise Features
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {newFeatures.api && !currentFeatures.api && (
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 mt-0.5" />
                          <div>
                            <span className="font-medium">API Access</span>
                            <p className="text-xs text-green-600 mt-0.5">Integrate with your existing systems. Build custom workflows and automations.</p>
                          </div>
                        </li>
                      )}
                      {newFeatures.whiteLabel && !currentFeatures.whiteLabel && (
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 mt-0.5" />
                          <div>
                            <span className="font-medium">White Label Branding</span>
                            <p className="text-xs text-green-600 mt-0.5">Remove LeniLani branding. Use your own domain and customize everything.</p>
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                
                {/* Support Upgrade */}
                {currentFeatures.support !== newFeatures.support && (
                  <div>
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Enhanced Support
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <span className="font-medium">{newFeatures.support}</span>
                          {newFeatures.support === 'Priority Email' && (
                            <p className="text-xs text-green-600 mt-0.5">Get responses within 4 hours during business hours.</p>
                          )}
                          {newFeatures.support === '24/7 Phone & Email' && (
                            <p className="text-xs text-green-600 mt-0.5">Direct phone line for urgent issues. Round-the-clock support team.</p>
                          )}
                          {newFeatures.support === 'Dedicated Account Manager' && (
                            <p className="text-xs text-green-600 mt-0.5">Personal account manager. Monthly strategy calls. Custom training sessions.</p>
                          )}
                        </div>
                      </li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Features Lost (for downgrades) */}
          {isDowngrade && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Minus className="h-5 w-5 text-red-600" />
                  Features You'll Lose
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {currentFeatures.channels.filter(c => !newFeatures.channels.includes(c)).map((channel) => (
                    <li key={channel} className="flex items-center gap-2 text-sm">
                      <X className="h-4 w-4 text-red-600" />
                      <span>{channel} support</span>
                    </li>
                  ))}
                  {currentFeatures.aiModels.filter(m => !newFeatures.aiModels.includes(m)).map((model) => (
                    <li key={model} className="flex items-center gap-2 text-sm">
                      <X className="h-4 w-4 text-red-600" />
                      <span>{model} AI model</span>
                    </li>
                  ))}
                  {currentFeatures.api && !newFeatures.api && (
                    <li className="flex items-center gap-2 text-sm">
                      <X className="h-4 w-4 text-red-600" />
                      <span>API Access</span>
                    </li>
                  )}
                  {currentFeatures.whiteLabel && !newFeatures.whiteLabel && (
                    <li className="flex items-center gap-2 text-sm">
                      <X className="h-4 w-4 text-red-600" />
                      <span>White Label Options</span>
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              className={`flex-1 ${isDowngrade ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}
              onClick={onConfirm}
            >
              {isDowngrade ? 'Confirm Downgrade' : 'Confirm Upgrade'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}