'use client'

import { useState } from 'react'
import { Calculator, TrendingUp, DollarSign, Users, Clock, ChevronRight } from 'lucide-react'

export default function ROICalculator() {
  const [guestInquiries, setGuestInquiries] = useState(500)
  const [avgHandlingTime, setAvgHandlingTime] = useState(5) // minutes
  const [staffHourlyRate, setStaffHourlyRate] = useState(20)
  const [directBookingRate, setDirectBookingRate] = useState(10) // percentage
  const [avgBookingValue, setAvgBookingValue] = useState(500)
  const [showResults, setShowResults] = useState(false)

  // Calculate ROI
  const calculateROI = () => {
    // Time saved per month (in hours)
    const timeSavedHours = (guestInquiries * avgHandlingTime * 0.85) / 60 // 85% automation rate
    
    // Staff cost savings per month
    const staffSavings = timeSavedHours * staffHourlyRate
    
    // Additional direct bookings (15% increase with AI)
    const currentDirectBookings = guestInquiries * (directBookingRate / 100)
    const additionalBookings = currentDirectBookings * 0.15 // 15% increase
    const additionalRevenue = additionalBookings * avgBookingValue
    
    // Commission savings (assuming 15% OTA commission)
    const commissionSavings = additionalBookings * avgBookingValue * 0.15
    
    // Total monthly value
    const totalMonthlyValue = staffSavings + commissionSavings
    
    // Annual projections
    const annualValue = totalMonthlyValue * 12
    const annualRevenue = additionalRevenue * 12
    
    return {
      timeSavedHours: Math.round(timeSavedHours),
      staffSavings: Math.round(staffSavings),
      additionalBookings: Math.round(additionalBookings),
      additionalRevenue: Math.round(additionalRevenue),
      commissionSavings: Math.round(commissionSavings),
      totalMonthlyValue: Math.round(totalMonthlyValue),
      annualValue: Math.round(annualValue),
      annualRevenue: Math.round(annualRevenue)
    }
  }

  const results = calculateROI()

  // Determine recommended tier based on volume
  const getRecommendedTier = () => {
    if (guestInquiries < 200) return { tier: 'Starter', price: 299 }
    if (guestInquiries < 1000) return { tier: 'Professional', price: 699 }
    if (guestInquiries < 3000) return { tier: 'Premium', price: 2499 }
    return { tier: 'Enterprise', price: null }
  }

  const recommended = getRecommendedTier()
  const roi = recommended.price ? Math.round((results.totalMonthlyValue / recommended.price - 1) * 100) : 0

  return (
    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 my-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Calculator className="h-4 w-4" />
            ROI Calculator
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Calculate Your Return on Investment
          </h2>
          <p className="text-gray-600">
            See how much you can save with our AI-powered chatbot
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Guest Inquiries
              </label>
              <input
                type="number"
                value={guestInquiries}
                onChange={(e) => setGuestInquiries(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avg Time per Inquiry (minutes)
              </label>
              <input
                type="number"
                value={avgHandlingTime}
                onChange={(e) => setAvgHandlingTime(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Staff Hourly Rate ($)
              </label>
              <input
                type="number"
                value={staffHourlyRate}
                onChange={(e) => setStaffHourlyRate(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Direct Booking Rate (%)
              </label>
              <input
                type="number"
                value={directBookingRate}
                onChange={(e) => setDirectBookingRate(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Average Booking Value ($)
              </label>
              <input
                type="number"
                value={avgBookingValue}
                onChange={(e) => setAvgBookingValue(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Projected ROI</h3>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-medium">Time Saved</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {results.timeSavedHours} hrs/mo
              </div>
              <div className="text-sm text-gray-600">Staff hours automated</div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <DollarSign className="h-5 w-5" />
                <span className="text-sm font-medium">Cost Savings</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                ${results.staffSavings}/mo
              </div>
              <div className="text-sm text-gray-600">In staff costs</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-purple-700 mb-2">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-medium">Revenue Increase</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                ${results.commissionSavings}/mo
              </div>
              <div className="text-sm text-gray-600">OTA commission saved</div>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Total Monthly Value</div>
                <div className="text-3xl font-bold text-gray-900">
                  ${results.totalMonthlyValue}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">Annual Value</div>
                <div className="text-3xl font-bold text-green-600">
                  ${results.annualValue}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm opacity-90">Recommended Plan</div>
                  <div className="text-xl font-bold">{recommended.tier}</div>
                </div>
                <div className="text-right">
                  {recommended.price ? (
                    <>
                      <div className="text-sm opacity-90">ROI</div>
                      <div className="text-2xl font-bold">{roi}%</div>
                    </>
                  ) : (
                    <div className="text-sm">Contact for pricing</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <div className="font-medium text-amber-900">Based on industry data:</div>
                  <ul className="text-sm text-amber-700 mt-1 space-y-1">
                    <li>• 85% of inquiries can be automated with AI</li>
                    <li>• 15-30% increase in direct bookings</li>
                    <li>• 50% reduction in response time</li>
                    <li>• 40% improvement in guest satisfaction</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all transform hover:scale-105">
            Start Your Free Trial
            <ChevronRight className="h-5 w-5" />
          </button>
          <p className="text-sm text-gray-600 mt-2">
            14-day free trial • No credit card required
          </p>
        </div>
      </div>
    </div>
  )
}