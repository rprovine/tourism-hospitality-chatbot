'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check, Code, Settings, Eye, Palette, Globe } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

export default function WidgetPage() {
  const [businessId, setBusinessId] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  
  // Widget Configuration
  const [config, setConfig] = useState({
    position: 'bottom-right',
    primaryColor: '#0891b2',
    buttonSize: 'medium',
    welcomeMessage: 'Aloha! How can I help you today?',
    placeholder: 'Type your message...',
    showBranding: true,
    autoOpen: false,
    language: 'en'
  })

  useEffect(() => {
    // Get business ID from localStorage
    const businessData = localStorage.getItem('business')
    if (businessData) {
      try {
        const business = JSON.parse(businessData)
        setBusinessId(business.id || 'demo-business-id')
      } catch (error) {
        console.error('Error parsing business data:', error)
        setBusinessId('demo-business-id')
      }
    }
  }, [])

  const generateEmbedCode = () => {
    return `<!-- LeniLani AI Chat Widget -->
<script>
  (function() {
    var w = window;
    var d = document;
    var s = d.createElement('script');
    s.src = '${process.env.NEXT_PUBLIC_APP_URL || 'https://app.lenilani.com'}/widget.js';
    s.async = true;
    s.setAttribute('data-business-id', '${businessId}');
    s.setAttribute('data-position', '${config.position}');
    s.setAttribute('data-primary-color', '${config.primaryColor}');
    s.setAttribute('data-button-size', '${config.buttonSize}');
    s.setAttribute('data-welcome-message', '${config.welcomeMessage}');
    s.setAttribute('data-placeholder', '${config.placeholder}');
    s.setAttribute('data-show-branding', '${config.showBranding}');
    s.setAttribute('data-auto-open', '${config.autoOpen}');
    s.setAttribute('data-language', '${config.language}');
    d.head.appendChild(s);
  })();
</script>
<!-- End LeniLani AI Chat Widget -->`
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateEmbedCode())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 lg:p-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat Widget</h1>
          <p className="text-gray-600">Install and customize your AI chatbot widget</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* Appearance Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance
                </CardTitle>
                <CardDescription>Customize how your widget looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="position">Position</Label>
                  <select
                    id="position"
                    value={config.position}
                    onChange={(e) => setConfig({...config, position: e.target.value})}
                    className="w-full h-10 px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="top-left">Top Left</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="primaryColor"
                      type="color" 
                      value={config.primaryColor}
                      onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
                      className="w-20 h-10"
                    />
                    <Input 
                      value={config.primaryColor}
                      onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
                      placeholder="#0891b2"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="buttonSize">Button Size</Label>
                  <select
                    id="buttonSize"
                    value={config.buttonSize}
                    onChange={(e) => setConfig({...config, buttonSize: e.target.value})}
                    className="w-full h-10 px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="showBranding">Show LeniLani Branding</Label>
                  <Switch
                    id="showBranding"
                    checked={config.showBranding}
                    onCheckedChange={(checked) => setConfig({...config, showBranding: checked})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Behavior Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Behavior
                </CardTitle>
                <CardDescription>Configure widget behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="welcomeMessage">Welcome Message</Label>
                  <Textarea
                    id="welcomeMessage"
                    value={config.welcomeMessage}
                    onChange={(e) => setConfig({...config, welcomeMessage: e.target.value})}
                    rows={2}
                    placeholder="Aloha! How can I help you today?"
                  />
                </div>

                <div>
                  <Label htmlFor="placeholder">Input Placeholder</Label>
                  <Input
                    id="placeholder"
                    value={config.placeholder}
                    onChange={(e) => setConfig({...config, placeholder: e.target.value})}
                    placeholder="Type your message..."
                  />
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <select
                    id="language"
                    value={config.language}
                    onChange={(e) => setConfig({...config, language: e.target.value})}
                    className="w-full h-10 px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="autoOpen">Auto-open on page load</Label>
                  <Switch
                    id="autoOpen"
                    checked={config.autoOpen}
                    onCheckedChange={(checked) => setConfig({...config, autoOpen: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Code Panel */}
          <div className="space-y-6">
            {/* Installation Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Installation Code
                </CardTitle>
                <CardDescription>
                  Copy and paste this code into your website's HTML, just before the closing &lt;/body&gt; tag
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
                    <code>{generateEmbedCode()}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Installation Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Installation Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center text-sm font-semibold">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Copy the installation code</p>
                      <p className="text-sm text-gray-600">Click the "Copy Code" button above</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center text-sm font-semibold">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Open your website's HTML</p>
                      <p className="text-sm text-gray-600">Access your website's code editor or CMS</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center text-sm font-semibold">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Paste before &lt;/body&gt;</p>
                      <p className="text-sm text-gray-600">Add the code just before the closing body tag</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-semibold">
                      ✓
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Save and publish</p>
                      <p className="text-sm text-gray-600">Your chat widget will appear immediately!</p>
                    </div>
                  </div>
                </div>

                {/* Platform-specific instructions */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Platform-Specific Guides:</h4>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li>• <strong>WordPress:</strong> Add to theme footer.php or use a plugin</li>
                    <li>• <strong>Shopify:</strong> Add to theme.liquid before &lt;/body&gt;</li>
                    <li>• <strong>Wix:</strong> Use the HTML embed element</li>
                    <li>• <strong>Squarespace:</strong> Add to Code Injection footer</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Test Widget Button */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Test Your Widget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  {previewMode ? 'Close Preview' : 'Open Widget Preview'}
                </Button>
                <p className="text-sm text-gray-600 mt-2">
                  Test your widget configuration before installing
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Widget Preview (Mock) */}
      {previewMode && (
        <div 
          className={`fixed ${
            config.position.includes('bottom') ? 'bottom-6' : 'top-6'
          } ${
            config.position.includes('right') ? 'right-6' : 'left-6'
          } z-50`}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-96 overflow-hidden">
            <div 
              className="p-4 text-white"
              style={{ backgroundColor: config.primaryColor }}
            >
              <h3 className="font-semibold">Chat Preview</h3>
              <p className="text-sm opacity-90">{config.welcomeMessage}</p>
            </div>
            <div className="p-4 bg-gray-50">
              <div className="bg-white rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-600">This is a preview of your chat widget</p>
              </div>
              <input 
                type="text" 
                placeholder={config.placeholder}
                className="w-full p-3 border rounded-lg text-sm"
                disabled
              />
            </div>
            {config.showBranding && (
              <div className="px-4 py-2 bg-gray-100 text-center">
                <p className="text-xs text-gray-500">Powered by LeniLani AI</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}