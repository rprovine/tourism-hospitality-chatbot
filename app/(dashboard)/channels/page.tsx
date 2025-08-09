'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingState } from '@/components/ui/loading-state'
import { 
  MessageSquare, 
  Phone, 
  Instagram, 
  Facebook,
  Send,
  AlertCircle,
  Loader2,
  Copy,
  ExternalLink,
  Globe
} from 'lucide-react'

interface ChannelConfig {
  id: string
  channel: string
  isActive: boolean
  config: Record<string, unknown>
  webhookUrl?: string
  metadata?: Record<string, unknown>
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<ChannelConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingChannel, setTestingChannel] = useState<string | null>(null)
  
  // Form states for each channel
  const [whatsappConfig, setWhatsappConfig] = useState({
    accessToken: '',
    phoneNumberId: '',
    businessAccountId: '',
    webhookVerifyToken: 'lenilani_whatsapp_2025'
  })
  
  const [smsConfig, setSmsConfig] = useState({
    accountSid: '',
    authToken: '',
    phoneNumber: '',
    messagingServiceSid: ''
  })

  useEffect(() => {
    fetchChannels()
  }, [])

  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/channels', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setChannels(data)
        
        // Load existing configs
        const whatsapp = data.find((c: ChannelConfig) => c.channel === 'whatsapp')
        if (whatsapp?.config) {
          setWhatsappConfig(whatsapp.config)
        }
        
        const sms = data.find((c: ChannelConfig) => c.channel === 'sms')
        if (sms?.config) {
          setSmsConfig(sms.config)
        }
      }
    } catch (error) {
      console.error('Failed to fetch channels:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveChannel = async (channel: string, config: Record<string, unknown>, isActive: boolean) => {
    setSaving(true)
    try {
      const response = await fetch('/api/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          channel,
          config,
          isActive
        })
      })
      
      if (response.ok) {
        await fetchChannels()
        alert(`${channel} configuration saved successfully!`)
      } else {
        alert(`Failed to save ${channel} configuration`)
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  const testChannel = async (channel: string) => {
    setTestingChannel(channel)
    try {
      const response = await fetch('/api/channels/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ channel })
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert(`${channel} test successful! Check your phone for a test message.`)
      } else {
        alert(`${channel} test failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Test error:', error)
      alert('Test failed')
    } finally {
      setTestingChannel(null)
    }
  }

  const copyWebhookUrl = (channel: string) => {
    const baseUrl = window.location.origin
    const webhookUrl = `${baseUrl}/api/channels/${channel}/webhook`
    navigator.clipboard.writeText(webhookUrl)
    alert('Webhook URL copied to clipboard!')
  }

  if (loading) {
    return <LoadingState message="Loading channel configurations..." size="lg" />
  }

  const getChannelStatus = (channel: string) => {
    const config = channels.find(c => c.channel === channel)
    return config?.isActive || false
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Multi-Channel Integration</h1>
        <p className="text-gray-600">Configure WhatsApp, SMS, and social media channels</p>
      </div>

      {/* Channel Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">WhatsApp</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getChannelStatus('whatsapp') ? (
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              ) : (
                <Badge variant="outline" className="text-gray-700 border-gray-300">Inactive</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">SMS (Twilio)</CardTitle>
            <Phone className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getChannelStatus('sms') ? (
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              ) : (
                <Badge variant="outline" className="text-gray-700 border-gray-300">Inactive</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Instagram</CardTitle>
            <Instagram className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-gray-700 border-gray-300">Coming Soon</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Facebook</CardTitle>
            <Facebook className="h-4 w-4 text-blue-700" />
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-gray-700 border-gray-300">Coming Soon</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Channel Configuration Tabs */}
      <Tabs defaultValue="webchat" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1">
          <TabsTrigger value="webchat" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Web Widget</span>
            <span className="sm:hidden">Web</span>
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="text-xs sm:text-sm">WhatsApp</TabsTrigger>
          <TabsTrigger value="sms" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">SMS (Twilio)</span>
            <span className="sm:hidden">SMS</span>
          </TabsTrigger>
          <TabsTrigger value="instagram" className="text-xs sm:text-sm">Instagram</TabsTrigger>
          <TabsTrigger value="templates" className="text-xs sm:text-sm col-span-2 sm:col-span-1">Templates</TabsTrigger>
        </TabsList>

        {/* Web Chat Widget Configuration */}
        <TabsContent value="webchat">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-cyan-600" />
                  Web Chat Widget
                </CardTitle>
                <CardDescription>
                  Add an AI-powered chat widget to your website with just a few lines of code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Widget Preview */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Widget Preview</h3>
                  <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-end">
                      <div className="bg-cyan-600 text-white p-3 rounded-full shadow-lg">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 text-right mt-2">Your chat widget will appear here</p>
                  </div>
                </div>

                {/* Installation Code */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Installation Code</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Copy and paste this code snippet just before the closing &lt;/body&gt; tag on your website:
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>{`<!-- LeniLani AI Chat Widget -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${window.location.origin}/widget.js';
    script.async = true;
    script.dataset.businessId = '${localStorage.getItem('business') ? JSON.parse(localStorage.getItem('business') || '{}').id : 'YOUR_BUSINESS_ID'}';
    script.dataset.position = 'bottom-right';
    script.dataset.primaryColor = '#0891b2';
    document.body.appendChild(script);
  })();
</script>
<!-- End LeniLani AI Chat Widget -->`}</pre>
                  </div>
                  <Button 
                    className="mt-3 bg-cyan-600 hover:bg-cyan-700"
                    onClick={() => {
                      const code = `<!-- LeniLani AI Chat Widget -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${window.location.origin}/widget.js';
    script.async = true;
    script.dataset.businessId = '${localStorage.getItem('business') ? JSON.parse(localStorage.getItem('business') || '{}').id : 'YOUR_BUSINESS_ID'}';
    script.dataset.position = 'bottom-right';
    script.dataset.primaryColor = '#0891b2';
    document.body.appendChild(script);
  })();
</script>
<!-- End LeniLani AI Chat Widget -->`;
                      navigator.clipboard.writeText(code);
                      alert('Widget code copied to clipboard!');
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </Button>
                </div>

                {/* Customization Options */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Customization Options</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Widget Position</label>
                      <select className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                        <option value="bottom-right">Bottom Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="top-right">Top Right</option>
                        <option value="top-left">Top Left</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Primary Color</label>
                      <div className="flex gap-2 mt-1">
                        <input 
                          type="color" 
                          defaultValue="#0891b2" 
                          className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                        />
                        <Input 
                          defaultValue="#0891b2" 
                          className="flex-1 text-gray-900"
                          placeholder="Hex color code"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Welcome Message</label>
                      <Input 
                        defaultValue="Aloha! How can I help you today?" 
                        className="text-gray-900"
                        placeholder="Enter your welcome message"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Auto-Open Delay (seconds)</label>
                      <Input 
                        type="number"
                        defaultValue="5" 
                        className="text-gray-900"
                        placeholder="0 to disable"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Automatically open the chat widget after this many seconds (0 to disable)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Advanced Settings</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm text-gray-700">Show agent avatar</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm text-gray-700">Play notification sound</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm text-gray-700">Show typing indicator</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm text-gray-700">Require email before chat</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="bg-cyan-600 hover:bg-cyan-700">
                    Save Widget Settings
                  </Button>
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Test Widget
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Integration Guide */}
            <Card>
              <CardHeader>
                <CardTitle>Integration Guide</CardTitle>
                <CardDescription>
                  Follow these steps to add the chat widget to your website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center font-semibold text-sm">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Copy the installation code</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Click the &quot;Copy Code&quot; button above to copy the widget script to your clipboard
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center font-semibold text-sm">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Add to your website</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Paste the code just before the closing &lt;/body&gt; tag in your HTML
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center font-semibold text-sm">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Test the widget</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Visit your website and look for the chat bubble in the corner
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Platform-Specific Instructions</p>
                      <div className="text-sm text-blue-800 mt-2 space-y-2">
                        <p><strong>WordPress:</strong> Add to your theme&apos;s footer.php or use a plugin like &quot;Insert Headers and Footers&quot;</p>
                        <p><strong>Shopify:</strong> Go to Online Store → Themes → Actions → Edit Code → theme.liquid</p>
                        <p><strong>Wix:</strong> Use the Tracking & Analytics feature to add custom code</p>
                        <p><strong>Squarespace:</strong> Settings → Advanced → Code Injection → Footer</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* WhatsApp Configuration */}
        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Business API Configuration</CardTitle>
              <CardDescription>
                Connect your WhatsApp Business account to enable messaging
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Access Token</label>
                <Input
                  type="password"
                  placeholder="Your WhatsApp Business API access token"
                  value={whatsappConfig.accessToken}
                  onChange={(e) => setWhatsappConfig({ ...whatsappConfig, accessToken: e.target.value })}
                  className="text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone Number ID</label>
                <Input
                  placeholder="WhatsApp phone number ID"
                  value={whatsappConfig.phoneNumberId}
                  onChange={(e) => setWhatsappConfig({ ...whatsappConfig, phoneNumberId: e.target.value })}
                  className="text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Business Account ID</label>
                <Input
                  placeholder="WhatsApp business account ID"
                  value={whatsappConfig.businessAccountId}
                  onChange={(e) => setWhatsappConfig({ ...whatsappConfig, businessAccountId: e.target.value })}
                  className="text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Webhook URL</label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={`${window.location.origin}/api/channels/whatsapp/webhook`}
                    className="text-gray-900 bg-gray-50"
                  />
                  <Button onClick={() => copyWebhookUrl('whatsapp')} size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Add this URL to your WhatsApp webhook configuration
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Webhook Verify Token</label>
                <Input
                  readOnly
                  value={whatsappConfig.webhookVerifyToken}
                  className="text-gray-900 bg-gray-50"
                />
                <p className="text-xs text-gray-500">
                  Use this token when setting up your webhook
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => saveChannel('whatsapp', whatsappConfig, true)}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Configuration
                </Button>
                <Button
                  variant="outline"
                  onClick={() => testChannel('whatsapp')}
                  disabled={testingChannel === 'whatsapp' || !getChannelStatus('whatsapp')}
                >
                  {testingChannel === 'whatsapp' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Test Connection
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('https://business.facebook.com/wa/manage/home/', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  WhatsApp Manager
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMS Configuration */}
        <TabsContent value="sms">
          <Card>
            <CardHeader>
              <CardTitle>Twilio SMS Configuration</CardTitle>
              <CardDescription>
                Connect your Twilio account for SMS messaging
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Account SID</label>
                <Input
                  placeholder="Your Twilio Account SID"
                  value={smsConfig.accountSid}
                  onChange={(e) => setSmsConfig({ ...smsConfig, accountSid: e.target.value })}
                  className="text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Auth Token</label>
                <Input
                  type="password"
                  placeholder="Your Twilio Auth Token"
                  value={smsConfig.authToken}
                  onChange={(e) => setSmsConfig({ ...smsConfig, authToken: e.target.value })}
                  className="text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <Input
                  placeholder="+1234567890"
                  value={smsConfig.phoneNumber}
                  onChange={(e) => setSmsConfig({ ...smsConfig, phoneNumber: e.target.value })}
                  className="text-gray-900"
                />
                <p className="text-xs text-gray-500">
                  Your Twilio phone number (with country code)
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Messaging Service SID (Optional)</label>
                <Input
                  placeholder="Messaging Service SID for advanced features"
                  value={smsConfig.messagingServiceSid}
                  onChange={(e) => setSmsConfig({ ...smsConfig, messagingServiceSid: e.target.value })}
                  className="text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Webhook URLs</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={`${window.location.origin}/api/channels/sms/webhook`}
                      className="text-gray-900 bg-gray-50"
                    />
                    <Button onClick={() => copyWebhookUrl('sms')} size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Message webhook URL - Add to your Twilio phone number configuration
                  </p>
                  
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={`${window.location.origin}/api/channels/sms/status`}
                      className="text-gray-900 bg-gray-50"
                    />
                    <Button onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/api/channels/sms/status`)
                      alert('Status webhook URL copied!')
                    }} size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Status callback URL - For delivery confirmations
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => saveChannel('sms', smsConfig, true)}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Configuration
                </Button>
                <Button
                  variant="outline"
                  onClick={() => testChannel('sms')}
                  disabled={testingChannel === 'sms' || !getChannelStatus('sms')}
                >
                  {testingChannel === 'sms' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Test SMS
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('https://console.twilio.com/', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Twilio Console
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Instagram Configuration */}
        <TabsContent value="instagram">
          <Card>
            <CardHeader>
              <CardTitle>Instagram Direct Messages</CardTitle>
              <CardDescription>
                Instagram integration coming soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <Instagram className="h-12 w-12 text-pink-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2 text-gray-900">Coming Soon</h3>
                <p className="text-sm text-gray-600">
                  Instagram Direct Message integration will be available in the next update.
                  This will allow you to respond to customer inquiries directly from Instagram.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Message Templates */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>
                Pre-approved message templates for WhatsApp and SMS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Create New Template
                </Button>
                
                <div className="text-center py-8 text-gray-500">
                  No templates created yet. Create your first template to get started.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>Resources for setting up multi-channel messaging</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <a href="#" className="flex items-center gap-2 text-cyan-700 hover:underline">
            <ExternalLink className="h-4 w-4" />
            WhatsApp Business API Setup Guide
          </a>
          <a href="#" className="flex items-center gap-2 text-cyan-700 hover:underline">
            <ExternalLink className="h-4 w-4" />
            Twilio SMS Configuration Tutorial
          </a>
          <a href="#" className="flex items-center gap-2 text-cyan-700 hover:underline">
            <ExternalLink className="h-4 w-4" />
            Multi-Channel Best Practices
          </a>
        </CardContent>
      </Card>
    </div>
  )
}