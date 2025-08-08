'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  BarChart3, 
  MessageSquare,
  Users,
  Settings,
  Brain,
  LogOut,
  Home,
  Bot,
  BookOpen,
  Activity,
  UserCog,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/admin', label: 'Overview', icon: Home },
  { href: '/admin/realtime', label: 'Real-Time', icon: Activity },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/conversations', label: 'Conversations', icon: MessageSquare },
  { href: '/admin/knowledge-base', label: 'Knowledge', icon: BookOpen },
  { href: '/admin/ai-settings', label: 'AI Config', icon: Brain },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminNav() {
  const pathname = usePathname()
  
  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('token')
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    localStorage.removeItem('business')
    // Clear cookie
    document.cookie = 'token=; path=/; max-age=0'
    // Redirect to login
    window.location.href = '/login'
  }
  
  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/admin" className="flex items-center gap-2">
              <Bot className="h-7 w-7 text-cyan-600" />
              <span className="text-xl font-bold text-gray-900">Admin Panel</span>
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                MASTER
              </span>
            </Link>
            
            {/* Nav Items */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || 
                  (item.href !== '/admin' && pathname?.startsWith(item.href))
                  
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-cyan-50 text-cyan-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
          
          {/* Right side */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
              Back to Dashboard
            </Link>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}