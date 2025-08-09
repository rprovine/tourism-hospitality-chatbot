'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Check,
  AlertCircle,
  Shield,
  Loader2
} from 'lucide-react'

interface PaymentMethod {
  id: string
  type: 'card' | 'bank'
  last4: string
  brand?: string
  expMonth?: number
  expYear?: number
  isDefault: boolean
  bankName?: string
}

interface PaymentMethodManagerProps {
  methods: PaymentMethod[]
  onAddMethod: (method: any) => Promise<void>
  onRemoveMethod: (id: string) => Promise<void>
  onSetDefault: (id: string) => Promise<void>
}

export default function PaymentMethodManager({
  methods = [],
  onAddMethod,
  onRemoveMethod,
  onSetDefault
}: PaymentMethodManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: 'card',
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvv: '',
    nameOnCard: '',
    zipCode: ''
  })

  const handleAddPaymentMethod = async () => {
    setLoading(true)
    try {
      // Mask card number for display
      const last4 = formData.cardNumber.slice(-4)
      const brand = detectCardBrand(formData.cardNumber)
      
      await onAddMethod({
        type: 'card',
        last4,
        brand,
        expMonth: parseInt(formData.expMonth),
        expYear: parseInt(formData.expYear),
        isDefault: methods.length === 0
      })
      
      setShowAddForm(false)
      setFormData({
        type: 'card',
        cardNumber: '',
        expMonth: '',
        expYear: '',
        cvv: '',
        nameOnCard: '',
        zipCode: ''
      })
    } catch (error) {
      console.error('Failed to add payment method:', error)
      alert('Failed to add payment method. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const detectCardBrand = (number: string): string => {
    const firstDigit = number[0]
    const firstTwo = number.slice(0, 2)
    
    if (firstDigit === '4') return 'Visa'
    if (['51', '52', '53', '54', '55'].includes(firstTwo)) return 'Mastercard'
    if (['34', '37'].includes(firstTwo)) return 'Amex'
    if (firstTwo === '60') return 'Discover'
    return 'Card'
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    
    if (parts.length) {
      return parts.join(' ')
    } else {
      return value
    }
  }

  const getCardIcon = (brand?: string) => {
    const colors: Record<string, string> = {
      Visa: 'text-blue-600',
      Mastercard: 'text-red-600',
      Amex: 'text-blue-500',
      Discover: 'text-orange-500'
    }
    
    return (
      <CreditCard className={`h-5 w-5 ${colors[brand || ''] || 'text-gray-400'}`} />
    )
  }

  return (
    <div className="space-y-4">
      {/* Existing Payment Methods */}
      {methods.length > 0 ? (
        <div className="space-y-3">
          {methods.map((method) => (
            <Card key={method.id} className={method.isDefault ? 'border-green-500' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getCardIcon(method.brand)}
                    <div>
                      <div className="font-medium">
                        {method.brand} ending in {method.last4}
                      </div>
                      {method.expMonth && method.expYear && (
                        <div className="text-sm text-gray-500">
                          Expires {method.expMonth.toString().padStart(2, '0')}/{method.expYear}
                        </div>
                      )}
                    </div>
                    {method.isDefault && (
                      <Badge className="bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSetDefault(method.id)}
                      >
                        Set as Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onRemoveMethod(method.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">No payment methods</h3>
            <p className="text-sm text-gray-500">Add a payment method to continue your subscription</p>
          </CardContent>
        </Card>
      )}

      {/* Add Payment Method Form */}
      {showAddForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Add Payment Method</CardTitle>
            <CardDescription>
              Add a new credit or debit card
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nameOnCard">Name on Card</Label>
              <Input
                id="nameOnCard"
                value={formData.nameOnCard}
                onChange={(e) => setFormData({ ...formData, nameOnCard: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                value={formData.cardNumber}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  cardNumber: formatCardNumber(e.target.value)
                })}
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                required
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="expMonth">Exp Month</Label>
                <Input
                  id="expMonth"
                  type="text"
                  value={formData.expMonth}
                  onChange={(e) => setFormData({ ...formData, expMonth: e.target.value })}
                  placeholder="MM"
                  maxLength={2}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="expYear">Exp Year</Label>
                <Input
                  id="expYear"
                  type="text"
                  value={formData.expYear}
                  onChange={(e) => setFormData({ ...formData, expYear: e.target.value })}
                  placeholder="YY"
                  maxLength={2}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="text"
                  value={formData.cvv}
                  onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                  placeholder="123"
                  maxLength={4}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="zipCode">Billing ZIP Code</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                placeholder="12345"
                required
              />
            </div>
            
            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Secure Payment</p>
                  <p className="text-blue-700">
                    Your payment information is encrypted and secure. We never store your full card number.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddPaymentMethod}
                disabled={loading || !formData.cardNumber || !formData.expMonth || !formData.expYear || !formData.cvv}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Card
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={() => setShowAddForm(true)}
          className="w-full"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Payment Method
        </Button>
      )}
      
      {/* PCI Compliance Notice */}
      <div className="text-xs text-gray-500 text-center">
        <p>
          <Shield className="h-3 w-3 inline mr-1" />
          PCI DSS Compliant • Your payment information is secure
        </p>
      </div>
    </div>
  )
}