'use client'

import { useState } from 'react'
import AdminNav from '@/components/admin/AdminNav'
import { 
  Code,
  Copy,
  Check,
  Globe,
  Settings,
  ChevronRight,
  AlertCircle,
  Sparkles
} from 'lucide-react'

export default function WidgetInstallationPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState('html')
  
  // Generate unique widget ID (in production, this would come from the backend)
  const widgetId = 'lwc_' + Math.random().toString(36).substring(7)
  const apiKey = 'pk_demo_' + Math.random().toString(36).substring(2, 15)

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const embedCode = {
    html: `<!-- LeniLani AI Chatbot Widget -->
<script>
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://cdn.lenilani.com/widget.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${widgetId}');
</script>
<!-- End LeniLani AI Chatbot Widget -->`,
    
    wordpress: `// Add this to your theme's functions.php file
function add_lenilani_chatbot() {
    ?>
    <script>
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://cdn.lenilani.com/widget.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${widgetId}');
    </script>
    <?php
}
add_action('wp_footer', 'add_lenilani_chatbot');`,
    
    react: `// Install: npm install @lenilani/react-chatbot
import { LeniLaniChatbot } from '@lenilani/react-chatbot'

function App() {
  return (
    <>
      {/* Your app content */}
      <LeniLaniChatbot 
        widgetId="${widgetId}"
        position="bottom-right"
        primaryColor="#0891b2"
      />
    </>
  )
}`,
    
    nextjs: `// Install: npm install @lenilani/react-chatbot
// Add to your _app.tsx or layout.tsx

import { LeniLaniChatbot } from '@lenilani/react-chatbot'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <LeniLaniChatbot 
          widgetId="${widgetId}"
          position="bottom-right"
        />
      </body>
    </html>
  )
}`
  }

  const platforms = [
    { id: 'html', name: 'HTML/JavaScript', icon: Globe },
    { id: 'wordpress', name: 'WordPress', icon: Globe },
    { id: 'react', name: 'React', icon: Code },
    { id: 'nextjs', name: 'Next.js', icon: Code }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Widget Installation</h1>
          <p className="text-gray-600 mt-1">Add the AI chatbot to your website in minutes</p>
        </div>

        <div className="p-6">
          {/* Widget ID & API Key */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-cyan-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-cyan-900">Your Widget Credentials</h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between bg-white rounded px-3 py-2">
                    <div>
                      <span className="text-xs text-gray-500">Widget ID:</span>
                      <p className="font-mono text-sm">{widgetId}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(widgetId, -1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {copiedIndex === -1 ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded px-3 py-2">
                    <div>
                      <span className="text-xs text-gray-500">API Key:</span>
                      <p className="font-mono text-sm">{apiKey}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(apiKey, -2)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {copiedIndex === -2 ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Selection */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Choose Your Platform</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedPlatform === platform.id
                      ? 'border-cyan-600 bg-cyan-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <platform.icon className={`h-5 w-5 mx-auto mb-1 ${
                    selectedPlatform === platform.id ? 'text-cyan-600' : 'text-gray-400'
                  }`} />
                  <div className={`text-sm font-medium ${
                    selectedPlatform === platform.id ? 'text-cyan-900' : 'text-gray-700'
                  }`}>
                    {platform.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Installation Steps */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Installation Steps</h2>
            
            {selectedPlatform === 'html' && (
              <ol className="space-y-3">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </span>
                  <div>
                    <p className="text-gray-700">Copy the embed code below</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </span>
                  <div>
                    <p className="text-gray-700">Paste it just before the closing <code className="bg-gray-100 px-1 rounded">&lt;/body&gt;</code> tag</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </span>
                  <div>
                    <p className="text-gray-700">Save and refresh your website</p>
                  </div>
                </li>
              </ol>
            )}

            {selectedPlatform === 'wordpress' && (
              <ol className="space-y-3">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </span>
                  <div>
                    <p className="text-gray-700">Go to Appearance → Theme Editor</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </span>
                  <div>
                    <p className="text-gray-700">Open <code className="bg-gray-100 px-1 rounded">functions.php</code></p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </span>
                  <div>
                    <p className="text-gray-700">Add the code below at the end of the file</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center text-sm font-medium">
                    4
                  </span>
                  <div>
                    <p className="text-gray-700">Save changes</p>
                  </div>
                </li>
              </ol>
            )}

            {(selectedPlatform === 'react' || selectedPlatform === 'nextjs') && (
              <ol className="space-y-3">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </span>
                  <div>
                    <p className="text-gray-700">Install the NPM package:</p>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm block mt-1">
                      npm install @lenilani/react-chatbot
                    </code>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </span>
                  <div>
                    <p className="text-gray-700">Import and add the component</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </span>
                  <div>
                    <p className="text-gray-700">Configure with your widget ID</p>
                  </div>
                </li>
              </ol>
            )}
          </div>

          {/* Code Block */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900">Embed Code</h2>
              <button
                onClick={() => copyToClipboard(embedCode[selectedPlatform as keyof typeof embedCode], 1)}
                className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm transition-colors"
              >
                {copiedIndex === 1 ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-300">
                <code>{embedCode[selectedPlatform as keyof typeof embedCode]}</code>
              </pre>
            </div>
          </div>

          {/* Customization Options */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Customization Options
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <ChevronRight className="h-3 w-3 text-gray-400" />
                <span className="text-gray-700">Position: bottom-right, bottom-left, top-right, top-left</span>
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight className="h-3 w-3 text-gray-400" />
                <span className="text-gray-700">Primary color: Match your brand colors</span>
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight className="h-3 w-3 text-gray-400" />
                <span className="text-gray-700">Welcome message: Customize greeting text</span>
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight className="h-3 w-3 text-gray-400" />
                <span className="text-gray-700">Auto-open: Show chat on page load</span>
              </div>
            </div>
          </div>

          {/* Testing Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-900">Testing Your Installation</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  After installation, the chatbot may take up to 2 minutes to appear. Clear your browser cache if you don't see it immediately.
                </p>
                <p className="text-sm text-yellow-700 mt-2">
                  For local development, use <code className="bg-yellow-100 px-1 rounded">localhost</code> or add your domain to the allowed origins in settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}