'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { LoadingState } from '@/components/ui/loading-state'
import { 
  Search, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  DollarSign,
  MessageSquare,
  Star,
  Filter,
  Download,
  ChevronRight,
  Globe
} from 'lucide-react'

interface GuestProfile {
  id: string
  email: string | null
  phone: string | null
  name: string | null
  languagePreference: string
  totalConversations: number
  totalBookings: number
  lifetimeValue: string
  lastVisit: string | null
  tags: string[]
  preferences: any
  interactions: any[]
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<GuestProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGuest, setSelectedGuest] = useState<GuestProfile | null>(null)
  const [filters, setFilters] = useState({
    hasBooking: false,
    vip: false,
    abandoned: false
  })

  useEffect(() => {
    fetchGuests()
  }, [])

  const fetchGuests = async () => {
    try {
      const response = await fetch('/api/guest-profiles', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setGuests(data.profiles)
      }
    } catch (error) {
      console.error('Failed to fetch guests:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchGuests = async () => {
    if (!searchTerm) {
      fetchGuests()
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm.includes('@')) {
        params.append('email', searchTerm)
      } else if (searchTerm.match(/^\+?[\d\s-()]+$/)) {
        params.append('phone', searchTerm)
      }

      const response = await fetch(`/api/guest-profiles?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setGuests(data.profiles)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportGuests = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Language', 'Conversations', 'Bookings', 'Lifetime Value', 'Last Visit'],
      ...guests.map(g => [
        g.name || '',
        g.email || '',
        g.phone || '',
        g.languagePreference,
        g.totalConversations,
        g.totalBookings,
        g.lifetimeValue,
        g.lastVisit ? new Date(g.lastVisit).toLocaleDateString() : ''
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'guests.csv'
    a.click()
  }

  const getGuestScore = (guest: GuestProfile) => {
    let score = 0
    if (guest.totalBookings > 0) score += 2
    if (guest.totalConversations > 5) score += 1
    if (parseFloat(guest.lifetimeValue) > 1000) score += 2
    return score
  }

  const filteredGuests = guests.filter(guest => {
    if (filters.hasBooking && guest.totalBookings === 0) return false
    if (filters.vip && getGuestScore(guest) < 4) return false
    if (filters.abandoned && !guest.interactions?.some((i: any) => i.interactionType === 'abandonment')) return false
    return true
  })

  if (loading) {
    return <LoadingState message="Loading guest profiles..." size="lg" />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Guest Profiles</h1>
          <p className="text-gray-600">Track and manage your guest relationships</p>
        </div>
        <Button 
          onClick={exportGuests}
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Integration Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Integration Required for Full Functionality</h3>
              <p className="text-sm text-gray-700 mb-2">
                Guest profiles automatically track conversations and interactions with your AI chatbot. To unlock the full power of this feature:
              </p>
              <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                <li><strong>Booking Data:</strong> Connect your Property Management System (PMS) or booking engine to automatically sync reservation details and booking counts</li>
                <li><strong>Lifetime Value:</strong> Integrate with your payment system to track actual revenue per guest</li>
                <li><strong>VIP Detection:</strong> Automatically identify high-value guests based on real spending patterns</li>
                <li><strong>Abandoned Cart Recovery:</strong> Link with your booking flow to detect and recover incomplete reservations</li>
              </ul>
              <p className="text-sm text-gray-600 mt-2">
                Contact our support team at support@lenilani.com to set up these integrations with your existing systems.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchGuests()}
                className="pl-10 text-gray-900"
              />
            </div>
            <Button onClick={searchGuests}>Search</Button>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button
              variant={filters.hasBooking ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters(f => ({ ...f, hasBooking: !f.hasBooking }))}
            >
              Has Bookings
            </Button>
            <Button
              variant={filters.vip ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters(f => ({ ...f, vip: !f.vip }))}
            >
              VIP Guests
            </Button>
            <Button
              variant={filters.abandoned ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters(f => ({ ...f, abandoned: !f.abandoned }))}
            >
              Abandoned Cart
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Guests</CardTitle>
            <User className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{guests.length}</div>
            <p className="text-xs text-gray-600">Chat interactions tracked</p>
          </CardContent>
        </Card>

        <Card className="opacity-60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">With Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {guests.filter(g => g.totalBookings > 0).length}
            </div>
            <p className="text-xs text-gray-600">Requires PMS integration</p>
          </CardContent>
        </Card>

        <Card className="opacity-60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">VIP Guests</CardTitle>
            <Star className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {guests.filter(g => getGuestScore(g) >= 4).length}
            </div>
            <p className="text-xs text-gray-600">Based on chat activity</p>
          </CardContent>
        </Card>

        <Card className="opacity-60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Avg Lifetime Value</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ${guests.length > 0 
                ? Math.round(guests.reduce((sum, g) => sum + parseFloat(g.lifetimeValue), 0) / guests.length)
                : 0}
            </div>
            <p className="text-xs text-gray-600">Requires payment integration</p>
          </CardContent>
        </Card>
      </div>

      {/* Guest List */}
      <Card>
        <CardHeader>
          <CardTitle>Guest Profiles</CardTitle>
          <CardDescription>Click on a guest to view detailed information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredGuests.map(guest => (
              <div
                key={guest.id}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedGuest(guest)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <div className="font-semibold">
                      {guest.name || guest.email || guest.phone || 'Anonymous'}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {guest.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {guest.email}
                        </span>
                      )}
                      {guest.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {guest.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {guest.languagePreference.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {guest.totalConversations} conversations
                    </div>
                    <div className="text-sm font-semibold">
                      ${guest.lifetimeValue} lifetime
                    </div>
                  </div>
                  {getGuestScore(guest) >= 4 && (
                    <Badge className="bg-yellow-100 text-yellow-800">VIP</Badge>
                  )}
                  {guest.totalBookings > 0 && (
                    <Badge className="bg-green-100 text-green-800">
                      {guest.totalBookings} bookings
                    </Badge>
                  )}
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
            
            {filteredGuests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No guests found matching your criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Guest Detail Modal */}
      {selectedGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedGuest.name || 'Guest Profile'}
                </h2>
                <div className="flex gap-2 mt-2">
                  {selectedGuest.tags.map(tag => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSelectedGuest(null)}
              >
                ✕
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="font-semibold">{selectedGuest.email || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Phone</label>
                <p className="font-semibold">{selectedGuest.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Language</label>
                <p className="font-semibold">{selectedGuest.languagePreference.toUpperCase()}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Last Visit</label>
                <p className="font-semibold">
                  {selectedGuest.lastVisit 
                    ? new Date(selectedGuest.lastVisit).toLocaleDateString()
                    : 'Never'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Total Conversations</label>
                <p className="font-semibold">{selectedGuest.totalConversations}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Total Bookings</label>
                <p className="font-semibold">{selectedGuest.totalBookings}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Lifetime Value</label>
                <p className="font-semibold text-green-600">${selectedGuest.lifetimeValue}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Guest Score</label>
                <p className="font-semibold">
                  {Array(5).fill(0).map((_, i) => (
                    <Star
                      key={i}
                      className={`inline h-4 w-4 ${
                        i < getGuestScore(selectedGuest) 
                          ? 'text-yellow-500 fill-yellow-500' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </p>
              </div>
            </div>
            
            {selectedGuest.preferences && Object.keys(selectedGuest.preferences).length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Preferences</h3>
                <div className="bg-gray-50 p-3 rounded">
                  <pre className="text-sm">{JSON.stringify(selectedGuest.preferences, null, 2)}</pre>
                </div>
              </div>
            )}
            
            {selectedGuest.interactions && selectedGuest.interactions.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Recent Interactions</h3>
                <div className="space-y-2">
                  {selectedGuest.interactions.map((interaction: any) => (
                    <div key={interaction.id} className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between">
                        <span className="font-medium">{interaction.interactionType}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(interaction.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {interaction.content && (
                        <p className="text-sm text-gray-600 mt-1">{interaction.content}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}