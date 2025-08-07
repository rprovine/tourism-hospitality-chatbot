'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import DashboardNav from '@/components/dashboard/DashboardNav'
import { 
  Users,
  Search,
  Filter,
  Download,
  MoreVertical,
  Mail,
  Calendar,
  CreditCard,
  Activity,
  UserCheck,
  UserX,
  Clock,
  ChevronRight,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  tier: string
  subscriptionStatus: string
  createdAt: string
  lastActive: string
  totalConversations: number
  monthlySpend: number
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTier, setFilterTier] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      } else {
        // Use mock data for demo
        setUsers(getMockUsers())
      }
    } catch (error) {
      setUsers(getMockUsers())
    } finally {
      setLoading(false)
    }
  }

  const getMockUsers = (): User[] => [
    {
      id: '1',
      email: 'paradise@resort.com',
      name: 'Paradise Resort Hawaii',
      tier: 'premium',
      subscriptionStatus: 'active',
      createdAt: '2024-01-15',
      lastActive: '2 hours ago',
      totalConversations: 12847,
      monthlySpend: 299
    },
    {
      id: '2',
      email: 'sunset@hotel.com',
      name: 'Sunset Beach Hotel',
      tier: 'professional',
      subscriptionStatus: 'active',
      createdAt: '2024-02-20',
      lastActive: '5 hours ago',
      totalConversations: 8234,
      monthlySpend: 149
    },
    {
      id: '3',
      email: 'ocean@tours.com',
      name: 'Ocean Adventures Tours',
      tier: 'professional',
      subscriptionStatus: 'trial',
      createdAt: '2024-03-01',
      lastActive: '1 day ago',
      totalConversations: 456,
      monthlySpend: 0
    },
    {
      id: '4',
      email: 'beach@villa.com',
      name: 'Beach Front Villas',
      tier: 'starter',
      subscriptionStatus: 'active',
      createdAt: '2024-03-10',
      lastActive: '3 days ago',
      totalConversations: 1234,
      monthlySpend: 29
    },
    {
      id: '5',
      email: 'island@chain.com',
      name: 'Island Hotel Chain',
      tier: 'enterprise',
      subscriptionStatus: 'active',
      createdAt: '2023-12-01',
      lastActive: '1 hour ago',
      totalConversations: 45678,
      monthlySpend: 1299
    },
    {
      id: '6',
      email: 'boutique@inn.com',
      name: 'Boutique Inn Waikiki',
      tier: 'starter',
      subscriptionStatus: 'canceled',
      createdAt: '2024-01-20',
      lastActive: '2 weeks ago',
      totalConversations: 789,
      monthlySpend: 0
    },
    {
      id: '7',
      email: 'luxury@estates.com',
      name: 'Luxury Estates Hawaii',
      tier: 'premium',
      subscriptionStatus: 'trial',
      createdAt: '2024-03-15',
      lastActive: '6 hours ago',
      totalConversations: 234,
      monthlySpend: 0
    },
    {
      id: '8',
      email: 'adventure@sports.com',
      name: 'Adventure Sports Center',
      tier: 'professional',
      subscriptionStatus: 'active',
      createdAt: '2024-02-10',
      lastActive: '12 hours ago',
      totalConversations: 5678,
      monthlySpend: 149
    }
  ]

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTier = filterTier === 'all' || user.tier === filterTier
    const matchesStatus = filterStatus === 'all' || user.subscriptionStatus === filterStatus
    return matchesSearch && matchesTier && matchesStatus
  })

  const getTierBadge = (tier: string) => {
    const colors = {
      starter: 'bg-gray-100 text-gray-800',
      professional: 'bg-cyan-100 text-cyan-800',
      premium: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-yellow-100 text-yellow-800'
    }
    return colors[tier as keyof typeof colors] || colors.starter
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      trial: 'bg-blue-100 text-blue-800',
      canceled: 'bg-red-100 text-red-800',
      past_due: 'bg-orange-100 text-orange-800'
    }
    return colors[status as keyof typeof colors] || colors.active
  }

  const exportUsers = () => {
    const csv = [
      ['Email', 'Name', 'Tier', 'Status', 'Created', 'Conversations', 'Monthly Spend'].join(','),
      ...filteredUsers.map(u => 
        [u.email, u.name, u.tier, u.subscriptionStatus, u.createdAt, u.totalConversations, u.monthlySpend].join(',')
      )
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users-export.csv'
    a.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">Loading users...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage all platform users and subscriptions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.subscriptionStatus === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                {users.filter(u => u.subscriptionStatus === 'trial').length} in trial
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total MRR</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${users.reduce((sum, u) => sum + u.monthlySpend, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Monthly recurring revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.3%</div>
              <p className="text-xs text-muted-foreground">
                {users.filter(u => u.subscriptionStatus === 'canceled').length} canceled
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by email or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All Tiers</option>
                <option value="starter">Starter</option>
                <option value="professional">Professional</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="canceled">Canceled</option>
              </select>
              <Button onClick={exportUsers} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              {filteredUsers.length} users found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Tier</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Conversations</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Monthly</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Last Active</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            Joined {user.createdAt}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTierBadge(user.tier)}`}>
                          {user.tier}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(user.subscriptionStatus)}`}>
                          {user.subscriptionStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-900">{user.totalConversations.toLocaleString()}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-gray-900">
                          ${user.monthlySpend}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {user.lastActive}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <Eye className="h-4 w-4 text-gray-600" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <Edit className="h-4 w-4 text-gray-600" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <Mail className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}