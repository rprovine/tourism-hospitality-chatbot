'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
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
  AlertCircle,
  CheckCircle,
  X,
  Building2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Car,
  Wifi,
  Coffee,
  Users,
  CreditCard,
  Info,
  MessageSquare,
  Star,
  Utensils,
  Dumbbell,
  Waves,
  Trees,
  Plane,
  Baby,
  Dog,
  Ban,
  Calendar
} from 'lucide-react'

export default function SettingsPage() {
  const [business, setBusiness] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('profile')
  
  const [profileData, setProfileData] = useState({
    // Basic Info
    name: '',
    type: '',
    welcomeMessage: '',
    primaryColor: '#0891b2',
    logo: '',
    // Contact Details (Customer-facing)
    contactEmail: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    // Operating Hours
    checkInTime: '3:00 PM',
    checkOutTime: '11:00 AM',
    frontDeskHours: '24/7',
    // Amenities
    parking: 'Free self-parking available',
    wifi: 'Free WiFi throughout property',
    breakfast: 'Continental breakfast 7:00 AM - 10:00 AM',
    pool: 'Outdoor pool open 7:00 AM - 9:00 PM',
    gym: '24/7 fitness center',
    restaurant: 'On-site restaurant open 7:00 AM - 10:00 PM',
    // Policies
    cancellationPolicy: '48 hours before arrival for full refund',
    petPolicy: 'Service animals only',
    smokingPolicy: 'Non-smoking property',
    // Additional
    numberOfRooms: '',
    yearEstablished: '',
    acceptedPayments: ['Visa', 'Mastercard', 'Amex', 'Discover'],
    airportDistance: '',
    beachDistance: ''
  })
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    conversationAlerts: true,
    paymentAlerts: true
  })
  
  const [quickActions, setQuickActions] = useState({
    action1: {
      text: 'Check Availability',
      response: ''
    },
    action2: {
      text: 'View Amenities',
      response: ''
    },
    action3: {
      text: 'Get Directions',
      response: ''
    }
  })
  
  useEffect(() => {
    loadSettings()
    
    // Check for hash in URL to set active tab
    const hash = window.location.hash.replace('#', '')
    if (hash && ['profile', 'chatbot', 'quickactions', 'notifications', 'security', 'billing'].includes(hash)) {
      setActiveTab(hash)
    }
  }, [])
  
  const loadSettings = () => {
    const businessData = localStorage.getItem('business')
    if (businessData) {
      const parsed = JSON.parse(businessData)
      setBusiness(parsed)
      setProfileData({
        name: parsed.name || '',
        type: parsed.type || '',
        welcomeMessage: parsed.welcomeMessage || 'Aloha! How can I help you today?',
        primaryColor: parsed.primaryColor || '#0891b2',
        logo: parsed.logo || '',
        contactEmail: parsed.businessInfo?.contactEmail || '',
        // Load additional business info if it exists
        ...(parsed.businessInfo || {})
      })
      setLogoUrl(parsed.logo || null)
    }
    setLoading(false)
  }
  
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }
    
    // Validate file size (max 2MB for base64)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB')
      return
    }
    
    setUploadingLogo(true)
    
    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setLogoUrl(base64String)
        setProfileData(prev => ({ ...prev, logo: base64String }))
        
        // Immediately update localStorage for preview
        const currentBusiness = JSON.parse(localStorage.getItem('business') || '{}')
        localStorage.setItem('business', JSON.stringify({
          ...currentBusiness,
          logo: base64String
        }))
        
        setUploadingLogo(false)
      }
      reader.onerror = () => {
        alert('Failed to read file')
        setUploadingLogo(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading logo:', error)
      alert('Failed to upload logo')
      setUploadingLogo(false)
    }
  }
  
  const saveProfile = async () => {
    setSaving(true)
    try {
      // Include logo in the profile data
      const dataToSave = {
        ...profileData,
        logo: profileData.logo || logoUrl // Ensure logo is included
      }
      
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dataToSave)
      })
      
      if (response.ok) {
        const updated = await response.json()
        // Update localStorage with the new data including logo
        const updatedBusiness = {
          ...updated,
          logo: dataToSave.logo
        }
        localStorage.setItem('business', JSON.stringify(updatedBusiness))
        setBusiness(updatedBusiness)
        alert('Profile updated successfully!')
        // Force navigation refresh to update logo in nav
        window.location.reload()
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="chatbot">Chatbot</TabsTrigger>
          <TabsTrigger value="quickactions">Quick Actions</TabsTrigger>
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
                  className="text-gray-900"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Account Email</label>
                <Input
                  type="email"
                  value={business?.email || ''}
                  disabled
                  className="text-gray-900 bg-gray-50"
                />
                <p className="text-xs text-gray-500">This is your login email and cannot be changed</p>
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
                <label className="text-sm font-medium text-gray-700">Business Logo</label>
                <div className="flex items-start gap-4">
                  <div className="relative group">
                    <div className="w-24 h-24 bg-gray-50 border-2 border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Business logo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                          <p className="text-xs text-gray-500 mt-1">No logo</p>
                        </div>
                      )}
                    </div>
                    {logoUrl && (
                      <button
                        onClick={() => {
                          setLogoUrl(null)
                          setProfileData({ ...profileData, logo: '' })
                          // Update localStorage immediately
                          const currentBusiness = JSON.parse(localStorage.getItem('business') || '{}')
                          delete currentBusiness.logo
                          localStorage.setItem('business', JSON.stringify(currentBusiness))
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                      disabled={uploadingLogo}
                    />
                    <label htmlFor="logo-upload">
                      <Button 
                        variant="outline" 
                        disabled={uploadingLogo}
                        onClick={(e) => {
                          e.preventDefault()
                          document.getElementById('logo-upload')?.click()
                        }}
                        className="w-full sm:w-auto"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingLogo ? 'Processing...' : 'Choose Logo'}
                      </Button>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Recommended: Square image, max 2MB, PNG or JPG
                    </p>
                    {logoUrl && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Logo uploaded successfully
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t pt-4 mt-4" id="contact-info">
                <h3 className="font-medium text-gray-900 mb-3">Contact Information (Customer-Facing)</h3>
                <p className="text-sm text-gray-600 mb-4">This information will be shown to customers in the chatbot</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Customer Service Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        value={profileData.contactEmail}
                        onChange={(e) => setProfileData({ ...profileData, contactEmail: e.target.value })}
                        placeholder="info@yourhotel.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="(808) 555-0100"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Website</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        value={profileData.website}
                        onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                        placeholder="https://www.yourhotel.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium text-gray-900 mb-3">Location</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Street Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        value={profileData.address}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        placeholder="123 Beach Road"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">City</label>
                      <Input
                        value={profileData.city}
                        onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                        placeholder="Honolulu"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">State</label>
                      <Input
                        value={profileData.state}
                        onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                        placeholder="HI"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">ZIP</label>
                      <Input
                        value={profileData.zip}
                        onChange={(e) => setProfileData({ ...profileData, zip: e.target.value })}
                        placeholder="96815"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium text-gray-900 mb-3">Operating Hours</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Check-in Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        value={profileData.checkInTime}
                        onChange={(e) => setProfileData({ ...profileData, checkInTime: e.target.value })}
                        placeholder="3:00 PM"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Check-out Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        value={profileData.checkOutTime}
                        onChange={(e) => setProfileData({ ...profileData, checkOutTime: e.target.value })}
                        placeholder="11:00 AM"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Front Desk</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        value={profileData.frontDeskHours}
                        onChange={(e) => setProfileData({ ...profileData, frontDeskHours: e.target.value })}
                        placeholder="24/7"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Amenities */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium text-gray-900 mb-3">Key Amenities</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Parking</label>
                    <div className="relative">
                      <Car className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        value={profileData.parking}
                        onChange={(e) => setProfileData({ ...profileData, parking: e.target.value })}
                        placeholder="Free self-parking"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">WiFi</label>
                    <div className="relative">
                      <Wifi className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        value={profileData.wifi}
                        onChange={(e) => setProfileData({ ...profileData, wifi: e.target.value })}
                        placeholder="Free WiFi throughout"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Breakfast</label>
                    <div className="relative">
                      <Coffee className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        value={profileData.breakfast}
                        onChange={(e) => setProfileData({ ...profileData, breakfast: e.target.value })}
                        placeholder="Continental 7-10 AM"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Pool</label>
                    <div className="relative">
                      <Waves className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        value={profileData.pool}
                        onChange={(e) => setProfileData({ ...profileData, pool: e.target.value })}
                        placeholder="Outdoor pool 7 AM - 9 PM"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Policies */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium text-gray-900 mb-3">Policies</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Cancellation Policy</label>
                    <Input
                      value={profileData.cancellationPolicy}
                      onChange={(e) => setProfileData({ ...profileData, cancellationPolicy: e.target.value })}
                      placeholder="48 hours before arrival for full refund"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Pet Policy</label>
                      <div className="relative">
                        <Dog className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          value={profileData.petPolicy}
                          onChange={(e) => setProfileData({ ...profileData, petPolicy: e.target.value })}
                          placeholder="Service animals only"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Smoking Policy</label>
                      <div className="relative">
                        <Ban className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          value={profileData.smokingPolicy}
                          onChange={(e) => setProfileData({ ...profileData, smokingPolicy: e.target.value })}
                          placeholder="Non-smoking property"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chatbot Preview */}
              <div className="border-t pt-4 mt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium text-blue-900">Chatbot Preview</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="bg-white rounded p-2">
                      <span className="text-gray-600">Guest: "What time is check-in?"</span><br/>
                      <span className="text-gray-800">Bot: Check-in begins at {profileData.checkInTime || '3:00 PM'}.</span>
                    </div>
                    <div className="bg-white rounded p-2">
                      <span className="text-gray-600">Guest: "Do you have parking?"</span><br/>
                      <span className="text-gray-800">Bot: Yes! {profileData.parking || 'We offer parking'}.</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button onClick={saveProfile} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save All Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="chatbot">
          <Card>
            <CardHeader>
              <CardTitle>Chatbot Configuration</CardTitle>
              <CardDescription>Customize your chatbot&apos;s behavior and appearance</CardDescription>
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
                    className="w-32 text-gray-900"
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
        
        <TabsContent value="quickactions">
          <Card>
            <CardHeader>
              <CardTitle>Quick Action Buttons</CardTitle>
              <CardDescription>Configure the 3 quick action buttons that appear when users first open the chat</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <MessageSquare className="h-4 w-4" />
                <AlertTitle>Quick Actions Help Users Get Started</AlertTitle>
                <AlertDescription>
                  These buttons appear at the bottom of the chat when it first opens. They help guide users to common questions and increase engagement.
                </AlertDescription>
              </Alert>
              
              {/* Tier-based limitations */}
              {business?.tier === 'starter' && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-800">Starter Plan Limitations</AlertTitle>
                  <AlertDescription className="text-yellow-700">
                    Quick actions on Starter plan provide basic responses with contact information. 
                    Upgrade to Professional for dynamic responses and real-time availability.
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Quick Action 1 - Check Availability */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-cyan-600" />
                  </div>
                  <h3 className="font-medium">Quick Action #1: Check Availability</h3>
                  {business?.tier !== 'starter' && (
                    <Badge variant="green" className="text-xs">Dynamic</Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Button Text</label>
                  <Input
                    value={quickActions.action1.text}
                    onChange={(e) => setQuickActions({
                      ...quickActions,
                      action1: { ...quickActions.action1, text: e.target.value }
                    })}
                    placeholder="e.g., Check Availability"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Response {business?.tier === 'starter' ? '(Basic)' : '(Dynamic)'}
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    rows={4}
                    value={
                      quickActions.action1.response || (
                        business?.tier === 'starter' 
                          ? `To check room availability, please call ${profileData.phone || '(808) 555-0100'}. Our team is standing by to help you find the perfect room for your dates.`
                          : `Checking availability for your dates...\n\n[Professional+ shows real-time availability]\n[Includes room types, rates, and instant booking]\n\nFor immediate assistance, call ${profileData.phone || '(808) 555-0100'}.`
                      )
                    }
                    onChange={(e) => setQuickActions({
                      ...quickActions,
                      action1: { ...quickActions.action1, response: e.target.value }
                    })}
                    placeholder="What the chatbot will say when this button is clicked"
                    disabled={business?.tier !== 'starter'}
                  />
                  {business?.tier !== 'starter' && (
                    <p className="text-xs text-gray-500">Professional+ plans pull real-time availability from your PMS integration</p>
                  )}
                </div>
              </div>
              
              {/* Quick Action 2 - View Amenities */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <Utensils className="h-5 w-5 text-cyan-600" />
                  </div>
                  <h3 className="font-medium">Quick Action #2: View Amenities</h3>
                  {business?.tier === 'premium' && (
                    <Badge variant="purple" className="text-xs">Interactive</Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Button Text</label>
                  <Input
                    value={quickActions.action2.text}
                    onChange={(e) => setQuickActions({
                      ...quickActions,
                      action2: { ...quickActions.action2, text: e.target.value }
                    })}
                    placeholder="e.g., View Amenities"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Response {business?.tier === 'premium' ? '(Interactive)' : '(Standard)'}
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    rows={5}
                    value={
                      quickActions.action2.response || (
                        business?.tier === 'premium'
                          ? `🏨 Resort Amenities (Interactive Menu)\n\n[Premium tier shows interactive amenity selector]\n[Includes photos, operating hours, and booking]\n\nSelect an amenity to learn more or make a reservation.`
                          : `Our amenities include:\n• ${profileData.wifi || 'Free WiFi'}\n• ${profileData.parking || 'Free parking'}\n• ${profileData.pool || 'Pool'}\n• ${profileData.gym || 'Fitness Center'}\n• ${profileData.breakfast || 'Breakfast'}\n\nCall ${profileData.phone || '(808) 555-0100'} for more information.`
                      )
                    }
                    onChange={(e) => setQuickActions({
                      ...quickActions,
                      action2: { ...quickActions.action2, response: e.target.value }
                    })}
                    placeholder="What the chatbot will say when this button is clicked"
                  />
                  {business?.tier === 'premium' && (
                    <p className="text-xs text-gray-500">Premium plans show interactive amenity galleries with booking capabilities</p>
                  )}
                </div>
              </div>
              
              {/* Quick Action 3 - Get Directions */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-cyan-600" />
                  </div>
                  <h3 className="font-medium">Quick Action #3: Get Directions</h3>
                  {(business?.tier === 'professional' || business?.tier === 'premium') && (
                    <Badge variant="blue" className="text-xs">Maps</Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Button Text</label>
                  <Input
                    value={quickActions.action3.text}
                    onChange={(e) => setQuickActions({
                      ...quickActions,
                      action3: { ...quickActions.action3, text: e.target.value }
                    })}
                    placeholder="e.g., Get Directions"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Response {business?.tier !== 'starter' ? '(With Maps)' : '(Basic)'}
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    rows={5}
                    value={
                      quickActions.action3.response || (
                        business?.tier !== 'starter'
                          ? `📍 ${profileData.name || 'Our Location'}\n${profileData.address || '123 Beach Road'}, ${profileData.city || 'Honolulu'}, ${profileData.state || 'HI'} ${profileData.zip || '96815'}\n\n[Professional+ shows interactive map]\n[Includes real-time traffic and parking info]\n\nGet directions: [View on Google Maps]`
                          : `We're located at:\n${profileData.address || '123 Beach Road'}, ${profileData.city || 'Honolulu'}, ${profileData.state || 'HI'} ${profileData.zip || '96815'}\n\nFrom the airport: Take H1 West and exit at our street. The drive is about 20 minutes.\n\nNeed help? Call ${profileData.phone || '(808) 555-0100'}`
                      )
                    }
                    onChange={(e) => setQuickActions({
                      ...quickActions,
                      action3: { ...quickActions.action3, response: e.target.value }
                    })}
                    placeholder="What the chatbot will say when this button is clicked"
                  />
                  {business?.tier !== 'starter' && (
                    <p className="text-xs text-gray-500">Professional+ plans include interactive maps with real-time traffic</p>
                  )}
                </div>
              </div>
              
              {/* Tier Feature Summary */}
              <div className="border-t pt-6 mt-6">
                <h3 className="font-medium mb-4">Quick Actions Features by Tier</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="gray">Starter</Badge>
                    <span className="text-gray-600">Basic text responses with contact information</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="blue">Professional</Badge>
                    <span className="text-gray-600">Real-time availability, interactive maps, dynamic pricing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="purple">Premium</Badge>
                    <span className="text-gray-600">All Professional features + interactive galleries, instant booking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="yellow">Enterprise</Badge>
                    <span className="text-gray-600">Custom quick actions with AI-powered responses</span>
                  </div>
                </div>
              </div>
              
              <Button onClick={saveProfile} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                Save Quick Actions
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
                    <div className="font-medium text-gray-900">Conversation Alerts</div>
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
                    <div className="font-medium text-gray-900">Payment Alerts</div>
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
                <label className="text-sm font-medium text-gray-700">Current Password</label>
                <Input type="password" placeholder="Enter current password" className="text-gray-900" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">New Password</label>
                <Input type="password" placeholder="Enter new password" className="text-gray-900" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                <Input type="password" placeholder="Confirm new password" className="text-gray-900" />
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
                      <div className="font-medium text-gray-900">2FA is not enabled</div>
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
                    <span className="font-medium text-gray-700">Current Plan</span>
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