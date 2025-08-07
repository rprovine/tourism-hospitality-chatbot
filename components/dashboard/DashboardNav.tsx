'use client'

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
  Hash
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/admin', label: 'Overview', icon: Home },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/revenue', label: 'Revenue', icon: TrendingUp },
  { href: '/admin/guests', label: 'Guests', icon: Users },
  { href: '/admin/channels', label: 'Channels', icon: Hash },
  { href: '/admin/ai', label: 'AI Config', icon: Brain },
  { href: '/admin/billing', label: 'Billing', icon: CreditCard },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function DashboardNav() {
  const pathname = usePathname()
  
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('business')
    window.location.href = '/login'
  }
  
  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Bot className="h-7 w-7 text-cyan-600" />
              <span className="text-xl font-bold text-gray-900">LeniLani AI</span>
            </Link>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || 
                  (item.href === '/admin' && pathname === '/dashboard') ||
                  (item.href === '/admin/analytics' && pathname?.includes('/analytics'))
                
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
              <span className="font-semibold text-gray-900">Premium</span>
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