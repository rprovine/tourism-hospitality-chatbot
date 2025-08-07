'use client'

import { useState } from 'react'
import { 
  Save, 
  Upload, 
  Globe, 
  Palette, 
  MessageSquare, 
  Database,
  Key,
  Bell,
  Shield
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface SettingsPanelProps {
  businessName: string
}

export default function SettingsPanel({ }: SettingsPanelProps) {
  const [settings, setSettings] = useState({
    primaryColor: '#0891b2',
    welcomeMessage: 'Aloha! How can I help you today?',
    businessHours: '24/7',
    responseDelay: '1000',
    language: 'en',
    autoReply: true,
    bookingIntegration: true,
    crmIntegration: false,
    emailNotifications: true,
    smsNotifications: false
  })

  const handleSave = () => {
    // Save settings logic
    console.log('Saving settings:', settings)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize your chatbot&apos;s look and feel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="h-10 w-20"
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="flex-1 px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo
            </label>
            <div className="flex items-center gap-2">
              <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>
              <Button variant="outline">Upload Logo</Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Welcome Message
            </label>
            <textarea
              value={settings.welcomeMessage}
              onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Language & Localization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Language & Localization
          </CardTitle>
          <CardDescription>Configure language settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white"
            >
              <option value="en">English</option>
              <option value="ja">Japanese</option>
              <option value="es">Spanish</option>
              <option value="zh">Chinese</option>
              <option value="ko">Korean</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supported Languages
            </label>
            <div className="space-y-2">
              {['English', 'Japanese', 'Spanish', 'Chinese', 'Korean'].map((lang) => (
                <label key={lang} className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked={lang === 'English'} />
                  <span className="text-sm">{lang}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Hours
            </label>
            <input
              type="text"
              value={settings.businessHours}
              onChange={(e) => setSettings({ ...settings, businessHours: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Integrations
          </CardTitle>
          <CardDescription>Connect with external services</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Booking System</p>
              <p className="text-sm text-gray-600">Connect to your reservation system</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.bookingIntegration}
                onChange={(e) => setSettings({ ...settings, bookingIntegration: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">CRM Integration</p>
              <p className="text-sm text-gray-600">Sync with customer database</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.crmIntegration}
                onChange={(e) => setSettings({ ...settings, crmIntegration: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="sk-..."
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <Button variant="outline">
                <Key className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Configure alert preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive alerts via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">SMS Notifications</p>
              <p className="text-sm text-gray-600">Get text message alerts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alert Threshold
            </label>
            <select className="w-full px-3 py-2 border rounded-lg">
              <option>High priority only</option>
              <option>Medium and high</option>
              <option>All conversations</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Base */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Knowledge Base
          </CardTitle>
          <CardDescription>Manage Q&A and responses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Total Q&As</p>
            <p className="text-2xl font-bold text-gray-900">127</p>
          </div>
          
          <Button variant="outline" className="w-full">
            Manage Knowledge Base
          </Button>
          
          <Button variant="outline" className="w-full">
            Import Q&As
          </Button>
          
          <Button variant="outline" className="w-full">
            Export Q&As
          </Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>Access and privacy settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allowed Domains
            </label>
            <textarea
              placeholder="example.com&#10;app.example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Data Encryption</p>
              <p className="text-sm text-gray-600">End-to-end encryption</p>
            </div>
            <span className="text-sm text-green-600 font-medium">Enabled</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">GDPR Compliance</p>
              <p className="text-sm text-gray-600">Data protection compliance</p>
            </div>
            <span className="text-sm text-green-600 font-medium">Active</span>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="lg:col-span-2">
        <Button 
          onClick={handleSave}
          className="w-full bg-cyan-600 hover:bg-cyan-700"
        >
          <Save className="mr-2 h-4 w-4" />
          Save All Settings
        </Button>
      </div>
    </div>
  )
}