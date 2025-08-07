'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Bot, 
  LayoutDashboard, 
  BookOpen, 
  MessageSquare, 
  Settings, 
  Code,
  LogOut,
  DollarSign,
  Key,
  BarChart3
} from 'lucide-react'

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('business')
    router.push('/login')
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
    { href: '/admin/conversations', label: 'Conversations', icon: MessageSquare },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
    { href: '/admin/widget', label: 'Widget Install', icon: Code },
    { href: '/admin/api-access', label: 'API Access', icon: Key },
    { href: '/admin/usage-costs', label: 'Usage & Costs', icon: DollarSign },
  ]

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2">
              <Bot className="h-8 w-8 text-cyan-600" />
              <span className="text-xl font-bold text-gray-900">Admin Panel</span>
            </Link>
          </div>
          
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-cyan-50 text-cyan-700' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              )
            })}
            
            <div className="ml-4 pl-4 border-l">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}