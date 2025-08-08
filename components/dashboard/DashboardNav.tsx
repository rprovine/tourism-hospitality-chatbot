'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  BarChart3, 
  MessageSquare,
  Users,
  CreditCard,
  Settings,
  Brain,
  TrendingUp,
  LogOut,
  Home,
  Bot,
  Hash,
  Lock,
  Crown,
  Menu
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { isRouteAccessible } from '@/lib/tierRestrictions'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: Home, requiresTier: null },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, requiresTier: null },
  { href: '/knowledge-base', label: 'Knowledge Base', icon: Bot, requiresTier: null },
  { href: '/revenue', label: 'Revenue', icon: TrendingUp, requiresTier: 'professional' },
  { href: '/guests', label: 'Guests', icon: Users, requiresTier: 'professional' },
  { href: '/channels', label: 'Channels', icon: Hash, requiresTier: 'professional' },
  { href: '/ai-config', label: 'AI Config', icon: Brain, requiresTier: null },
  { href: '/subscription', label: 'Subscription', icon: CreditCard, requiresTier: null },
  { href: '/billing', label: 'Billing', icon: CreditCard, requiresTier: null },
  { href: '/settings', label: 'Settings', icon: Settings, requiresTier: null },
]

export default function DashboardNav() {
  const pathname = usePathname()
  const [businessTier, setBusinessTier] = useState<string>('starter')
  const [businessLogo, setBusinessLogo] = useState<string | null>(null)
  const [businessName, setBusinessName] = useState<string>('LeniLani AI')
  
  useEffect(() => {
    // Get business data from localStorage
    const businessData = localStorage.getItem('business')
    if (businessData) {
      try {
        const business = JSON.parse(businessData)
        setBusinessTier(business.tier || 'starter')
        setBusinessLogo(business.logo || null)
        setBusinessName(business.name || 'LeniLani AI')
      } catch (error) {
        console.error('Error parsing business data:', error)
      }
    }
  }, [])
  
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('business')
    window.location.href = '/login'
  }
  
  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 w-full overflow-x-hidden">
      <div className="w-full">
        {/* Top Row - Branding and Actions */}
        <div className="px-6 lg:px-10 border-b border-gray-100">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Logo */}
            <div className="flex-shrink-0">
              <Link href="/dashboard" className="inline-flex items-center gap-3 group">
                <div className="relative flex-shrink-0">
                  {businessLogo ? (
                    <img 
                      src={businessLogo} 
                      alt="Business Logo" 
                      className="h-10 w-10 rounded-xl object-cover shadow-sm ring-2 ring-gray-100 group-hover:ring-cyan-200 transition-all" 
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl flex items-center justify-center shadow-sm ring-2 ring-gray-100 group-hover:ring-cyan-200 transition-all">
                      <Bot className="h-5 w-5 text-cyan-600" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-gray-900 leading-tight group-hover:text-cyan-700 transition-colors">
                    {businessName}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      businessTier === 'premium' ? 'bg-purple-500' : 
                      businessTier === 'professional' ? 'bg-blue-500' : 
                      'bg-green-500'
                    }`}></span>
                    <span className="text-xs text-gray-500 capitalize">{businessTier} Plan</span>
                  </div>
                </div>
              </Link>
            </div>
            
            {/* Right Section - Actions */}
            <div className="flex items-center gap-3">
              {businessTier === 'starter' && (
                <Link href="/subscription" className="hidden sm:block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <Crown className="h-3.5 w-3.5" />
                    Upgrade
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-700 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
              
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => {}}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Bottom Row - Navigation Links */}
        <div className="hidden lg:block px-6 lg:px-10">
          <div className="flex items-center gap-1 h-12 overflow-x-auto">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                const isAccessible = !item.requiresTier || 
                  (item.requiresTier === 'professional' && (businessTier === 'professional' || businessTier === 'premium')) ||
                  (item.requiresTier === 'premium' && businessTier === 'premium')
                
                if (!isAccessible) {
                  return (
                    <div
                      key={item.href}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md text-gray-400 cursor-not-allowed relative group whitespace-nowrap"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                      <Lock className="h-3 w-3 ml-1" />
                      <div className="absolute top-full mt-1 left-0 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
                        Requires {item.requiresTier} plan
                      </div>
                    </div>
                  )
                }
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap
                      ${isActive 
                        ? 'bg-cyan-50 text-cyan-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
          </div>
        </div>
      </div>
    </nav>
  )
}