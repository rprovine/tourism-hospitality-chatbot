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
  Lock
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
  { href: '/ai-settings', label: 'AI Config', icon: Brain, requiresTier: null },
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
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 w-full">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              {businessLogo ? (
                <img src={businessLogo} alt="Business Logo" className="h-8 w-8 rounded-lg object-cover" />
              ) : (
                <Bot className="h-7 w-7 text-cyan-600" />
              )}
              <span className="text-xl font-bold text-gray-900">{businessName}</span>
            </Link>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
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
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-gray-400 cursor-not-allowed relative group"
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
                      flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors
                      ${isActive 
                        ? 'bg-cyan-50 text-cyan-700' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
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
          
          {/* Right Side */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              <span className="hidden sm:inline">Tier: </span>
              <span className="font-semibold text-gray-900 capitalize">{businessTier}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-700 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}