'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  Clock,
  MapPin,
  Phone,
  Mail,
  Wifi,
  Car,
  Coffee,
  Utensils,
  Users,
  CreditCard,
  Calendar,
  Info,
  CheckCircle2,
  Copy,
  Save,
  Sparkles
} from 'lucide-react'

interface QAPair {
  question: string
  answer: string
  category: string
  keywords: string
  priority: number
}

export default function StarterSetupWizard({ onComplete }: { onComplete?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [businessInfo, setBusinessInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    checkIn: '3:00 PM',
    checkOut: '11:00 AM',
    parking: 'Free parking available',
    wifi: 'Free WiFi throughout property',
    breakfast: '7:00 AM - 10:00 AM'
  })
  
  const [qaPairs, setQaPairs] = useState<QAPair[]>([])
  const [embedCode, setEmbedCode] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const steps = [
    { title: 'Business Info', description: 'Basic contact and location details' },
    { title: 'Essential Q&As', description: 'Answer your most common questions' },
    { title: 'Quick Actions', description: 'Configure the 3 quick buttons' },
    { title: 'Install Widget', description: 'Add to your website' }
  ]

  const generateQAPairs = (): QAPair[] => {
    const { name, phone, email, address, checkIn, checkOut, parking, wifi, breakfast } = businessInfo
    
    return [
      // Contact & Location
      {
        question: "What's your phone number?",
        answer: `You can reach us at ${phone}. We're available 24/7 for assistance.`,
        category: 'contact',
        keywords: 'phone,number,call,contact,reach',
        priority: 10
      },
      {
        question: "What's your email address?",
        answer: `Our email is ${email}. We typically respond within 2-4 hours.`,
        category: 'contact',
        keywords: 'email,contact,message,write',
        priority: 10
      },
      {
        question: "Where are you located?",
        answer: `We're located at ${address}. Look for the ${name} sign out front!`,
        category: 'location',
        keywords: 'location,address,where,directions,find',
        priority: 10
      },
      {
        question: "How do I get to your hotel?",
        answer: `We're at ${address}. From the airport, take H1 West and exit at our street. The drive is about 20 minutes. Call ${phone} if you need help with directions.`,
        category: 'location',
        keywords: 'directions,get,how,airport,drive',
        priority: 9
      },
      
      // Check-in/Check-out
      {
        question: "What time is check-in?",
        answer: `Check-in begins at ${checkIn}. Early check-in may be available - please call ${phone} to inquire.`,
        category: 'policies',
        keywords: 'check-in,checkin,time,arrival,arrive',
        priority: 10
      },
      {
        question: "What time is check-out?",
        answer: `Check-out is at ${checkOut}. Late check-out may be available for a small fee - please ask at the front desk.`,
        category: 'policies',
        keywords: 'check-out,checkout,time,departure,leave',
        priority: 10
      },
      
      // Amenities
      {
        question: "Do you have parking?",
        answer: parking || 'Yes, we offer free self-parking for all guests.',
        category: 'amenities',
        keywords: 'parking,park,car,vehicle,garage',
        priority: 9
      },
      {
        question: "Do you have WiFi?",
        answer: wifi || 'Yes, we offer complimentary high-speed WiFi throughout the property.',
        category: 'amenities',
        keywords: 'wifi,internet,wi-fi,wireless,network',
        priority: 10
      },
      {
        question: "What amenities do you offer?",
        answer: `We offer: ${wifi}, ${parking}, pool (7am-9pm), fitness center (24/7), and business center. Call ${phone} for more details.`,
        category: 'amenities',
        keywords: 'amenities,facilities,offer,have,services',
        priority: 8
      },
      {
        question: "Do you serve breakfast?",
        answer: `Yes! Breakfast is served ${breakfast} in our dining room. Continental and full breakfast options available.`,
        category: 'dining',
        keywords: 'breakfast,morning,food,eat,dining',
        priority: 8
      },
      
      // Booking
      {
        question: "How do I make a reservation?",
        answer: `To make a reservation, please call us at ${phone}. Our staff will help you find the perfect room for your stay.`,
        category: 'booking',
        keywords: 'book,reservation,reserve,booking,availability',
        priority: 10
      },
      {
        question: "Do you have rooms available?",
        answer: `Please call ${phone} to check current availability and rates. We'd be happy to help you find the perfect room!`,
        category: 'booking',
        keywords: 'available,availability,rooms,tonight,vacancy',
        priority: 10
      },
      {
        question: "What are your rates?",
        answer: `Our rates vary by season and room type. Please call ${phone} for current pricing and any special offers we may have.`,
        category: 'booking',
        keywords: 'rates,price,cost,pricing,expensive,cheap',
        priority: 9
      },
      
      // Policies
      {
        question: "What's your cancellation policy?",
        answer: `Cancellations must be made 48 hours before arrival to avoid charges. Please call ${phone} if you need to modify your reservation.`,
        category: 'policies',
        keywords: 'cancel,cancellation,refund,policy,change',
        priority: 8
      },
      {
        question: "Do you allow pets?",
        answer: `We welcome service animals. For pet policies, please call ${phone} as policies may vary.`,
        category: 'policies',
        keywords: 'pet,pets,dog,dogs,cat,animal',
        priority: 7
      },
      
      // Quick Action Responses
      {
        question: "Check Availability",
        answer: `To check room availability, please call ${phone}. Our team is standing by to help you find the perfect room for your dates.`,
        category: 'quick_action',
        keywords: 'check,availability,available,rooms',
        priority: 10
      },
      {
        question: "View Amenities",
        answer: `Our amenities include:\n• ${wifi}\n• ${parking}\n• Pool (7am-9pm)\n• Fitness Center (24/7)\n• ${breakfast}\n• Business Center\n\nCall ${phone} for more information!`,
        category: 'quick_action',
        keywords: 'view,amenities,facilities,services',
        priority: 10
      },
      {
        question: "Get Directions",
        answer: `${name} is located at:\n${address}\n\nFrom the airport (20 min):\n• Take H1 West\n• Exit at our street\n• We're 2 miles on the right\n\nNeed help? Call ${phone}`,
        category: 'quick_action',
        keywords: 'get,directions,location,address,how',
        priority: 10
      }
    ]
  }

  const handleNext = () => {
    if (currentStep === 1) {
      // Generate Q&A pairs from business info
      const generatedPairs = generateQAPairs()
      setQaPairs(generatedPairs)
    }
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      const token = localStorage.getItem('token')
      
      // Save Q&A pairs to knowledge base
      for (const qa of qaPairs) {
        await fetch('/api/knowledge-base', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...qa,
            language: 'en',
            isActive: true
          })
        })
      }
      
      // Generate embed code
      const businessData = localStorage.getItem('business')
      const business = businessData ? JSON.parse(businessData) : { id: 'demo' }
      
      const code = `<!-- LeniLani AI Chat Widget -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://app.lenilani.ai/widget.js';
    script.setAttribute('data-business-id', '${business.id}');
    script.async = true;
    document.head.appendChild(script);
  })();
</script>`
      
      setEmbedCode(code)
      handleNext()
      
      if (onComplete) {
        onComplete()
      }
    } catch (error) {
      console.error('Error saving setup:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const progressPercentage = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Quick Setup Wizard</h2>
          <Badge variant="outline" className="text-lg">
            Step {currentStep + 1} of {steps.length}
          </Badge>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex justify-between mt-2">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index <= currentStep ? 'bg-cyan-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {index < currentStep ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
              </div>
              <span className="text-xs mt-1 text-gray-600">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 0: Business Info */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This information will be used to automatically generate your initial Q&A responses
                </AlertDescription>
              </Alert>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Business Name</label>
                  <Input
                    value={businessInfo.name}
                    onChange={(e) => setBusinessInfo({...businessInfo, name: e.target.value})}
                    placeholder="Aloha Resort Hawaii"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      value={businessInfo.phone}
                      onChange={(e) => setBusinessInfo({...businessInfo, phone: e.target.value})}
                      placeholder="(808) 555-0100"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      value={businessInfo.email}
                      onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})}
                      placeholder="info@aloharesort.com"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      value={businessInfo.address}
                      onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})}
                      placeholder="123 Beach Road, Honolulu, HI"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Check-in Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      value={businessInfo.checkIn}
                      onChange={(e) => setBusinessInfo({...businessInfo, checkIn: e.target.value})}
                      placeholder="3:00 PM"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Check-out Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      value={businessInfo.checkOut}
                      onChange={(e) => setBusinessInfo({...businessInfo, checkOut: e.target.value})}
                      placeholder="11:00 AM"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Parking Info</label>
                  <div className="relative">
                    <Car className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      value={businessInfo.parking}
                      onChange={(e) => setBusinessInfo({...businessInfo, parking: e.target.value})}
                      placeholder="Free parking available"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">WiFi Info</label>
                  <div className="relative">
                    <Wifi className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      value={businessInfo.wifi}
                      onChange={(e) => setBusinessInfo({...businessInfo, wifi: e.target.value})}
                      placeholder="Free WiFi throughout property"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-2 block">Breakfast Hours</label>
                  <div className="relative">
                    <Coffee className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      value={businessInfo.breakfast}
                      onChange={(e) => setBusinessInfo({...businessInfo, breakfast: e.target.value})}
                      placeholder="7:00 AM - 10:00 AM"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Essential Q&As */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <Sparkles className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  We've automatically generated {qaPairs.length || 18} essential Q&A pairs based on your business info!
                </AlertDescription>
              </Alert>
              
              <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                {(qaPairs.length > 0 ? qaPairs : generateQAPairs()).slice(0, 10).map((qa, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">Q: {qa.question}</p>
                        <p className="text-sm text-gray-600 mt-1">A: {qa.answer}</p>
                      </div>
                      <Badge variant="outline" className="ml-2">{qa.category}</Badge>
                    </div>
                  </div>
                ))}
              </div>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Showing first 10 of 18 Q&As. All will be added to your knowledge base.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Step 2: Quick Actions */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <Alert>
                <MessageSquare className="h-4 w-4" />
                <AlertDescription>
                  These quick action buttons appear when users first open the chat
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                {['Check Availability', 'View Amenities', 'Get Directions'].map((action, index) => {
                  const qa = qaPairs.find(q => q.question === action) || generateQAPairs().find(q => q.question === action)
                  const icons = [Calendar, Utensils, MapPin]
                  const Icon = icons[index]
                  
                  return (
                    <div key={action} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                          <Icon className="h-5 w-5 text-cyan-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{action}</h4>
                          <p className="text-xs text-gray-500">Quick action button #{index + 1}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-sm text-gray-700 whitespace-pre-line">{qa?.answer}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 3: Install Widget */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Setup complete! Your chatbot is ready to use.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">1. Copy this code:</h4>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{embedCode || getEmbedCode()}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2 bg-white hover:bg-gray-100"
                      onClick={() => navigator.clipboard.writeText(embedCode || getEmbedCode())}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">2. Paste before &lt;/body&gt; tag on your website</h4>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      The chat widget will appear in the bottom-right corner of your website
                    </AlertDescription>
                  </Alert>
                </div>
                
                <div className="grid md:grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Instructions
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Test Widget
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        {currentStep < steps.length - 1 ? (
          <Button
            onClick={currentStep === 2 ? handleSave : handleNext}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Save className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : currentStep === 2 ? (
              <>
                Save & Continue
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        ) : (
          <Button onClick={() => window.location.href = '/dashboard'}>
            Go to Dashboard
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}

function getEmbedCode() {
  const businessData = localStorage.getItem('business')
  const business = businessData ? JSON.parse(businessData) : { id: 'demo' }
  
  return `<!-- LeniLani AI Chat Widget -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://app.lenilani.ai/widget.js';
    script.setAttribute('data-business-id', '${business.id}');
    script.async = true;
    document.head.appendChild(script);
  })();
</script>`
}