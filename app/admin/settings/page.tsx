'use client'

import { useState, useEffect } from 'react'
import AdminNav from '@/components/admin/AdminNav'
import { 
  Settings, 
  Save, 
  Palette, 
  Globe, 
  Bell, 
  Shield,
  CreditCard,
  User,
  Building,
  Check
} from 'lucide-react'

interface BusinessSettings {
  name: string
  type: string
  email: string
  phone: string
  address: string
  website: string
  primaryColor: string
  secondaryColor: string
  welcomeMessage: string
  languages: string[]
  notifications: {
    emailAlerts: boolean
    lowUsageWarning: boolean
    paymentReminders: boolean
  }
  security: {
    twoFactorEnabled: boolean
    ipWhitelisting: boolean
    apiRateLimiting: boolean
  }
}

export default function SettingsPage() {
  const [businessTier, setBusinessTier] = useState<string>('starter')
  const [settings, setSettings] = useState<BusinessSettings>({
    name: 'Demo Resort Hawaii',
    type: 'hotel',
    email: 'admin@lenilani.com',
    phone: '808-555-0123',
    address: '123 Beach Road, Honolulu, HI 96815',
    website: 'https://lenilani.com',
    primaryColor: '#0891b2',
    secondaryColor: '#06b6d4',
    welcomeMessage: 'Aloha! Welcome to Demo Resort Hawaii. How can I assist you today?',
    languages: ['en'],
    notifications: {
      emailAlerts: true,
      lowUsageWarning: true,
      paymentReminders: false
    },
    security: {
      twoFactorEnabled: false,
      ipWhitelisting: false,
      apiRateLimiting: true
    }
  })
  
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'notifications' | 'security'>('general')

  useEffect(() => {
    // Get business tier from localStorage
    const businessData = localStorage.getItem('business')
    if (businessData) {
      try {
        const parsed = JSON.parse(businessData)
        setBusinessTier(parsed.tier || 'starter')
        // Set appropriate default languages based on tier
        if (parsed.tier === 'starter') {
          setSettings(prev => ({ ...prev, languages: ['en'] }))
        } else if (parsed.tier === 'professional') {
          setSettings(prev => ({ ...prev, languages: ['en', 'ja'] }))
        }
      } catch (e) {
        console.error('Error parsing business data:', e)
      }
    }
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const allLanguages = [
    { code: 'en', name: 'English' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'es', name: 'Spanish' },
    { code: 'ko', name: 'Korean' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ar', name: 'Arabic' }
  ]

  // Get available languages based on tier
  const getAvailableLanguages = () => {
    switch (businessTier) {
      case 'starter':
        return [{ code: 'en', name: 'English' }]
      case 'professional':
        return [
          { code: 'en', name: 'English' },
          { code: 'ja', name: 'Japanese' }
        ]
      case 'premium':
        // Premium can choose any 5 languages
        return allLanguages.slice(0, 5)
      case 'enterprise':
        // Enterprise gets all languages
        return allLanguages
      default:
        return [{ code: 'en', name: 'English' }]
    }
  }

  const availableLanguages = getAvailableLanguages()

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="h-6 w-6 text-cyan-700" />
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              </div>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {saved ? (
                  <>
                    <Check className="h-4 w-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b px-6">
            <div className="flex gap-6">
              {[
                { id: 'general', label: 'General', icon: Building },
                { id: 'branding', label: 'Branding', icon: Palette },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'security', label: 'Security', icon: Shield }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-3 px-1 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-cyan-700 text-cyan-700'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={settings.name}
                      onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Type
                    </label>
                    <select
                      value={settings.type}
                      onChange={(e) => setSettings({ ...settings, type: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="hotel">Hotel</option>
                      <option value="tour_operator">Tour Operator</option>
                      <option value="vacation_rental">Vacation Rental</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="activity">Activity Provider</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={settings.phone}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={settings.website}
                      onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supported Languages
                    {businessTier === 'starter' && <span className="text-xs text-gray-500 ml-2">(English only)</span>}
                    {businessTier === 'professional' && <span className="text-xs text-gray-500 ml-2">(Fixed: English & Japanese)</span>}
                    {businessTier === 'premium' && <span className="text-xs text-gray-500 ml-2">(Choose up to 5)</span>}
                    {businessTier === 'enterprise' && <span className="text-xs text-gray-500 ml-2">(All languages)</span>}
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {businessTier === 'starter' ? (
                      // Starter: English only, no checkboxes
                      <div className="flex items-center gap-2 text-gray-600">
                        <input type="checkbox" checked disabled className="rounded text-gray-400" />
                        <span className="text-sm">English</span>
                      </div>
                    ) : businessTier === 'professional' ? (
                      // Professional: Fixed English & Japanese
                      <>
                        <div className="flex items-center gap-2 text-gray-600">
                          <input type="checkbox" checked disabled className="rounded text-gray-400" />
                          <span className="text-sm">English</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <input type="checkbox" checked disabled className="rounded text-gray-400" />
                          <span className="text-sm">Japanese</span>
                        </div>
                      </>
                    ) : businessTier === 'premium' ? (
                      // Premium: Choose up to 5 languages
                      allLanguages.map((lang) => (
                        <label key={lang.code} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={settings.languages.includes(lang.code)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                // Limit to 5 languages
                                if (settings.languages.length < 5) {
                                  setSettings({ ...settings, languages: [...settings.languages, lang.code] })
                                }
                              } else {
                                setSettings({ ...settings, languages: settings.languages.filter(l => l !== lang.code) })
                              }
                            }}
                            disabled={!settings.languages.includes(lang.code) && settings.languages.length >= 5}
                            className="rounded text-cyan-600 focus:ring-cyan-500 disabled:text-gray-400"
                          />
                          <span className={`text-sm ${!settings.languages.includes(lang.code) && settings.languages.length >= 5 ? 'text-gray-400' : 'text-gray-700'}`}>
                            {lang.name}
                          </span>
                        </label>
                      ))
                    ) : (
                      // Enterprise: All languages selectable
                      allLanguages.map((lang) => (
                        <label key={lang.code} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={settings.languages.includes(lang.code)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSettings({ ...settings, languages: [...settings.languages, lang.code] })
                              } else {
                                setSettings({ ...settings, languages: settings.languages.filter(l => l !== lang.code) })
                              }
                            }}
                            className="rounded text-cyan-600 focus:ring-cyan-500"
                          />
                          <span className="text-sm text-gray-700">{lang.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                  {businessTier === 'premium' && settings.languages.length > 0 && (
                    <p className="text-xs text-gray-600 mt-2">
                      {settings.languages.length}/5 languages selected
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'branding' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="h-10 w-20 rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.secondaryColor}
                        onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                        className="h-10 w-20 rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.secondaryColor}
                        onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Welcome Message
                  </label>
                  <textarea
                    value={settings.welcomeMessage}
                    onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Enter the greeting message for your chatbot..."
                  />
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-medium text-gray-900 mb-4">Preview</h3>
                  <div className="max-w-sm mx-auto">
                    <div 
                      className="rounded-lg shadow-lg p-4 text-white"
                      style={{ backgroundColor: settings.primaryColor }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div 
                          className="h-8 w-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: settings.secondaryColor }}
                        >
                          <Building className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-semibold">{settings.name}</span>
                      </div>
                      <div className="bg-white/10 rounded p-3">
                        <p className="text-sm">{settings.welcomeMessage}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Email Alerts</div>
                      <div className="text-sm text-gray-600">Receive email notifications for important events</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailAlerts}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, emailAlerts: e.target.checked }
                      })}
                      className="h-5 w-5 rounded text-cyan-600 focus:ring-cyan-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Low Usage Warning</div>
                      <div className="text-sm text-gray-600">Get notified when approaching usage limits</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.lowUsageWarning}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, lowUsageWarning: e.target.checked }
                      })}
                      className="h-5 w-5 rounded text-cyan-600 focus:ring-cyan-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Payment Reminders</div>
                      <div className="text-sm text-gray-600">Reminder before subscription renewal</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.paymentReminders}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, paymentReminders: e.target.checked }
                      })}
                      className="h-5 w-5 rounded text-cyan-600 focus:ring-cyan-500"
                    />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                      <div className="text-sm text-gray-600">Add an extra layer of security to your account</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorEnabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, twoFactorEnabled: e.target.checked }
                      })}
                      className="h-5 w-5 rounded text-cyan-600 focus:ring-cyan-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">IP Whitelisting</div>
                      <div className="text-sm text-gray-600">Restrict admin access to specific IP addresses</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.security.ipWhitelisting}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, ipWhitelisting: e.target.checked }
                      })}
                      className="h-5 w-5 rounded text-cyan-600 focus:ring-cyan-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">API Rate Limiting</div>
                      <div className="text-sm text-gray-600">Protect against API abuse and excessive usage</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.security.apiRateLimiting}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, apiRateLimiting: e.target.checked }
                      })}
                      className="h-5 w-5 rounded text-cyan-600 focus:ring-cyan-500"
                    />
                  </label>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-900">Security Recommendation</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        We recommend enabling Two-Factor Authentication and API Rate Limiting for optimal security.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}