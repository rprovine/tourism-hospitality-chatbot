'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Key,
  Save,
  Upload,
  AlertCircle
} from 'lucide-react'

export default function SettingsPage() {
  const [business, setBusiness] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    type: '',
    welcomeMessage: '',
    primaryColor: '#0891b2'
  })
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    conversationAlerts: true,
    paymentAlerts: true
  })
  
  useEffect(() => {
    loadSettings()
  }, [])
  
  const loadSettings = () => {
    const businessData = localStorage.getItem('business')
    if (businessData) {
      const parsed = JSON.parse(businessData)
      setBusiness(parsed)
      setProfileData({
        name: parsed.name || '',
        email: parsed.email || '',
        type: parsed.type || '',
        welcomeMessage: parsed.welcomeMessage || 'Aloha! How can I help you today?',
        primaryColor: parsed.primaryColor || '#0891b2'
      })
    }
    setLoading(false)
  }
  
  const saveProfile = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      })
      
      if (response.ok) {
        const updated = await response.json()
        localStorage.setItem('business', JSON.stringify(updated))
        alert('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }
  
  if (loading) {
    return <div className="p-8">Loading settings...</div>
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and chatbot configuration</p>
      </div>
      
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="chatbot">Chatbot</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Business Profile</CardTitle>
              <CardDescription>Update your business information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Business Name</label>
                <Input
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Your Business Name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  placeholder="contact@business.com"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Business Type</label>
                <select
                  value={profileData.type}
                  onChange={(e) => setProfileData({ ...profileData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="hotel">Hotel</option>
                  <option value="resort">Resort</option>
                  <option value="vacation_rental">Vacation Rental</option>
                  <option value="tour_operator">Tour Operator</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                  <Button variant="outline">Upload Logo</Button>
                </div>
              </div>
              
              <Button onClick={saveProfile} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="chatbot">
          <Card>
            <CardHeader>
              <CardTitle>Chatbot Configuration</CardTitle>
              <CardDescription>Customize your chatbot's behavior and appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Welcome Message</label>
                <textarea
                  value={profileData.welcomeMessage}
                  onChange={(e) => setProfileData({ ...profileData, welcomeMessage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  rows={3}
                  placeholder="Aloha! How can I help you today?"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Primary Color</label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={profileData.primaryColor}
                    onChange={(e) => setProfileData({ ...profileData, primaryColor: e.target.value })}
                    className="h-10 w-20"
                  />
                  <Input
                    value={profileData.primaryColor}
                    onChange={(e) => setProfileData({ ...profileData, primaryColor: e.target.value })}
                    placeholder="#0891b2"
                    className="w-32"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Response Style</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                  <option>Professional</option>
                  <option>Friendly</option>
                  <option>Casual</option>
                  <option>Formal</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Languages</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-gray-700">English</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-gray-700">Japanese</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-gray-700">Chinese</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-gray-700">Spanish</span>
                  </label>
                </div>
              </div>
              
              <Button onClick={saveProfile} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                Save Chatbot Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Email Notifications</div>
                    <div className="text-sm text-gray-500">Receive updates via email</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      emailNotifications: e.target.checked
                    })}
                    className="rounded"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">SMS Notifications</div>
                    <div className="text-sm text-gray-500">Get text message alerts</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.smsNotifications}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      smsNotifications: e.target.checked
                    })}
                    className="rounded"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Weekly Reports</div>
                    <div className="text-sm text-gray-500">Receive weekly analytics summary</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.weeklyReports}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      weeklyReports: e.target.checked
                    })}
                    className="rounded"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Conversation Alerts</div>
                    <div className="text-sm text-gray-500">Alert when chatbot needs help</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.conversationAlerts}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      conversationAlerts: e.target.checked
                    })}
                    className="rounded"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Payment Alerts</div>
                    <div className="text-sm text-gray-500">Billing and subscription updates</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.paymentAlerts}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      paymentAlerts: e.target.checked
                    })}
                    className="rounded"
                  />
                </label>
              </div>
              
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Password</label>
                <Input type="password" placeholder="Enter current password" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <Input type="password" placeholder="Enter new password" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm New Password</label>
                <Input type="password" placeholder="Confirm new password" />
              </div>
              
              <Button>
                <Shield className="h-4 w-4 mr-2" />
                Update Password
              </Button>
              
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <div className="font-medium">2FA is not enabled</div>
                      <div className="text-sm text-gray-600">Add an extra layer of security</div>
                    </div>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Manage your payment methods and billing details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Current Plan</span>
                    <span className="text-lg font-bold capitalize">{business?.tier || 'Starter'}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {business?.tier === 'premium' ? 'Unlimited conversations, all features' :
                     business?.tier === 'professional' ? '1,000 conversations/month' :
                     '100 conversations/month'}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Payment Method</h3>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-gray-600">No payment method on file</div>
                    <Button className="mt-3" variant="outline">Add Payment Method</Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Billing History</h3>
                  <div className="text-sm text-gray-600">No billing history available</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}