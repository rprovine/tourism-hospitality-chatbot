// Mock business data for demonstrating tier capabilities
// IMPORTANT: In production, this would be replaced with YOUR actual business data

export const mockBusinessData = {
  starter: {
    name: 'Aloha Inn Budget Stay',
    type: 'budget_hotel',
    rooms: 45,
    avgRate: 149,
    checkIn: '3:00 PM',
    checkOut: '11:00 AM',
    contact: '(808) 555-0100'
  },
  
  professional: {
    name: 'Maui Sunset Resort',
    type: 'resort',
    rooms: 150,
    avgRate: 289,
    restaurants: 2,
    pools: 2,
    currentOccupancy: 78
  },
  
  premium: {
    name: 'The Ritz-Carlton Kapalua',
    type: 'luxury_resort',
    rooms: 463,
    avgRate: 850,
    restaurants: 8,
    golfCourses: 2,
    currentVIPGuests: 12
  },
  
  enterprise: {
    name: 'Hawaiian Paradise Hotel Group',
    type: 'hotel_chain',
    properties: [
      'Hawaiian Paradise Waikiki',
      'Hawaiian Paradise Maui',
      'Hawaiian Paradise Kauai',
      'Hawaiian Paradise Kona',
      'Hawaiian Paradise Lanai',
      'Hawaiian Paradise Molokai',
      'Hawaiian Paradise Hilo'
    ],
    totalRooms: 2800,
    avgRate: 425,
    totalEmployees: 3500,
    loyaltyMembers: 125000
  }
}

// Simulated real-time availability
export const mockRealTimeData = {
  starter: {
    availableRooms: 12,
    occupancy: 73
  },
  
  professional: {
    availableRooms: 32,
    occupancy: 78,
    todayCheckIns: 23,
    todayCheckOuts: 18
  },
  
  premium: {
    availableRooms: 48,
    availableSuites: 3,
    occupancy: 89,
    vipArrivals: 3
  },
  
  enterprise: {
    availableRooms: 412,
    systemOccupancy: 85,
    groupArrivals: 450,
    revenueToday: 1250000
  }
}

// Knowledge base samples - in production, this would be your business-specific FAQs
export const mockKnowledgeBase = {
  starter: {
    faqs: 5,
    languages: ['English']
  },
  
  professional: {
    faqs: 50,
    languages: ['English', 'Japanese'],
    bookingEnabled: true
  },
  
  premium: {
    faqs: 200,
    languages: ['English', 'Japanese', 'Chinese', 'Spanish', 'Korean'],
    personalizedResponses: true,
    conciergeService: true
  },
  
  enterprise: {
    faqs: 'Unlimited',
    languages: ['English', 'Japanese', 'Chinese', 'Spanish', 'Korean', 'French', 'German', 'Portuguese', 'Russian', 'Arabic'],
    multiProperty: true,
    analyticsEnabled: true,
    loyaltyIntegration: true
  }
}