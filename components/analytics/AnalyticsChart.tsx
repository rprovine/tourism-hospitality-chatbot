/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts'

type ChartType = 'conversations' | 'trends' | 'satisfaction' | 'languages' | 'funnel'

interface AnalyticsChartProps {
  type: ChartType
}

export default function AnalyticsChart({ type }: AnalyticsChartProps) {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    // Simulate data loading
    switch (type) {
      case 'conversations':
        setData([
          { day: 'Mon', count: 120 },
          { day: 'Tue', count: 145 },
          { day: 'Wed', count: 138 },
          { day: 'Thu', count: 165 },
          { day: 'Fri', count: 189 },
          { day: 'Sat', count: 210 },
          { day: 'Sun', count: 195 }
        ])
        break
      case 'trends':
        setData([
          { month: 'Jan', conversations: 2100, bookings: 180 },
          { month: 'Feb', conversations: 2350, bookings: 210 },
          { month: 'Mar', conversations: 2800, bookings: 245 },
          { month: 'Apr', conversations: 3200, bookings: 290 },
          { month: 'May', conversations: 3500, bookings: 320 },
          { month: 'Jun', conversations: 3800, bookings: 350 }
        ])
        break
      case 'satisfaction':
        setData([
          { rating: '5 stars', count: 450, percentage: 55 },
          { rating: '4 stars', count: 250, percentage: 30 },
          { rating: '3 stars', count: 80, percentage: 10 },
          { rating: '2 stars', count: 30, percentage: 4 },
          { rating: '1 star', count: 10, percentage: 1 }
        ])
        break
      case 'languages':
        setData([
          { language: 'English', value: 65, color: '#0891b2' },
          { language: 'Japanese', value: 15, color: '#06b6d4' },
          { language: 'Spanish', value: 8, color: '#0e7490' },
          { language: 'Chinese', value: 7, color: '#155e75' },
          { language: 'Korean', value: 5, color: '#164e63' }
        ])
        break
      case 'funnel':
        setData([
          { name: 'Inquiries', value: 1000, fill: '#0891b2' },
          { name: 'Engaged', value: 750, fill: '#06b6d4' },
          { name: 'Intent', value: 400, fill: '#0e7490' },
          { name: 'Booking Started', value: 250, fill: '#155e75' },
          { name: 'Completed', value: 180, fill: '#164e63' }
        ])
        break
    }
  }, [type])

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading chart data...</div>
      </div>
    )
  }

  switch (type) {
    case 'conversations':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#0891b2" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )

    case 'trends':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="conversations" 
              stroke="#0891b2" 
              strokeWidth={2}
              dot={{ fill: '#0891b2' }}
            />
            <Line 
              type="monotone" 
              dataKey="bookings" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      )

    case 'satisfaction':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="rating" type="category" />
            <Tooltip />
            <Bar dataKey="count" fill="#0891b2" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )

    case 'languages':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.language}: ${entry.value}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      )

    case 'funnel':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <FunnelChart>
            <Tooltip />
            <Funnel
              dataKey="value"
              data={data}
              isAnimationActive
            >
              <LabelList position="center" fill="#fff" stroke="none" />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      )

    default:
      return null
  }
}