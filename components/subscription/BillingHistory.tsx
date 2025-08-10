'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  FileText, 
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface Invoice {
  id: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'failed' | 'refunded'
  description: string
  invoiceNumber: string
  paymentMethod?: string
  refundAmount?: number
  refundDate?: string
  dueDate?: string
  paidAt?: string
}

interface BillingHistoryProps {
  businessId: string
}

export default function BillingHistory({ businessId }: BillingHistoryProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    fetchBillingHistory()
  }, [])

  const fetchBillingHistory = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/billing/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices || [])
      } else {
        console.error('Failed to fetch billing history')
        setInvoices([])
      }
    } catch (error) {
      console.error('Failed to fetch billing history:', error)
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }


  const handleDownloadInvoice = async (invoiceId: string) => {
    setDownloadingId(invoiceId)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/billing/invoice/${invoiceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${invoiceId}.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        // Mock download
        alert(`Invoice ${invoiceId} download would start here`)
      }
    } catch (error) {
      console.error('Failed to download invoice:', error)
      alert('Failed to download invoice. Please try again.')
    } finally {
      setDownloadingId(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'refunded':
        return <RefreshCw className="h-4 w-4 text-blue-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-blue-100 text-blue-800'
    }
    
    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const totalSpent = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0)
  
  const totalRefunded = invoices
    .filter(inv => inv.status === 'refunded')
    .reduce((sum, inv) => sum + (inv.refundAmount || 0), 0)

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-500">Loading billing history...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
              <ArrowUpRight className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Last 12 months</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Refunded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{formatCurrency(totalRefunded)}</div>
              <ArrowDownRight className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Last 12 months</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Next Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {invoices.find(inv => inv.status === 'pending') 
                  ? formatCurrency(invoices.find(inv => inv.status === 'pending')!.amount)
                  : '-'}
              </div>
              <CreditCard className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {invoices.find(inv => inv.status === 'pending')?.dueDate 
                ? new Date(invoices.find(inv => inv.status === 'pending')!.dueDate!).toLocaleDateString()
                : 'No pending payment'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            All your invoices and payment records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <FileText className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">{invoice.description}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(invoice.date).toLocaleDateString()} • {invoice.invoiceNumber}
                      </div>
                      {invoice.paymentMethod && (
                        <div className="text-xs text-gray-400 mt-1">
                          {invoice.paymentMethod}
                        </div>
                      )}
                      {invoice.status === 'refunded' && invoice.refundDate && (
                        <div className="text-xs text-blue-600 mt-1">
                          Refunded on {new Date(invoice.refundDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(invoice.amount)}
                      </div>
                      {invoice.refundAmount && (
                        <div className="text-sm text-gray-500 line-through">
                          -{formatCurrency(invoice.refundAmount)}
                        </div>
                      )}
                    </div>
                    {getStatusBadge(invoice.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice.id)}
                      disabled={downloadingId === invoice.id}
                    >
                      {downloadingId === invoice.id ? (
                        <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-1">No billing history yet</h3>
              <p className="text-sm text-gray-500">
                {localStorage.getItem('business') && 
                 (JSON.parse(localStorage.getItem('business')!).subscriptionStatus === 'trial' ||
                  JSON.parse(localStorage.getItem('business')!).subscriptionStatus === 'pending')
                  ? 'Your first invoice will appear after your trial ends'
                  : 'Your invoices will appear here once you make a payment'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">Export Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Generate Tax Report
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Download All Invoices
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}