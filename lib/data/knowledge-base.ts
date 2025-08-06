export const starterKnowledgeBase = {
  hotel: {
    'check-in': {
      keywords: ['check in', 'checkin', 'arrival', 'check-in time'],
      response: 'Check-in time is 3:00 PM and check-out is 11:00 AM. Early check-in may be available upon request.'
    },
    'amenities': {
      keywords: ['amenities', 'facilities', 'pool', 'gym', 'wifi', 'internet'],
      response: 'We offer complimentary WiFi, outdoor pool, fitness center, and on-site restaurant. Room service is available from 6 AM to 10 PM.'
    },
    'parking': {
      keywords: ['parking', 'car', 'valet'],
      response: 'We offer both self-parking ($25/day) and valet parking ($35/day). Electric vehicle charging stations are available.'
    },
    'location': {
      keywords: ['location', 'address', 'directions', 'how to get'],
      response: 'We are located in the heart of Waikiki, just 2 blocks from the beach and walking distance to shopping and dining.'
    },
    'breakfast': {
      keywords: ['breakfast', 'food', 'dining', 'restaurant'],
      response: 'Continental breakfast is served from 6:30 AM to 10:30 AM in our Ocean View Restaurant. Room service is also available.'
    }
  },
  tour: {
    'availability': {
      keywords: ['available', 'book', 'reserve', 'schedule'],
      response: 'Tours run daily. Morning tours depart at 8:00 AM and afternoon tours at 1:00 PM. Advance booking is recommended.'
    },
    'duration': {
      keywords: ['how long', 'duration', 'time', 'hours'],
      response: 'Our standard tour lasts approximately 4 hours, including transportation and photo stops.'
    },
    'pickup': {
      keywords: ['pickup', 'pick up', 'hotel', 'transport'],
      response: 'We offer complimentary pickup from most Waikiki hotels. Pickup begins 30 minutes before tour departure.'
    },
    'what to bring': {
      keywords: ['bring', 'need', 'required', 'wear'],
      response: 'Please bring sunscreen, comfortable walking shoes, camera, and water. We provide snacks and additional water.'
    },
    'cancellation': {
      keywords: ['cancel', 'refund', 'reschedule'],
      response: 'Free cancellation up to 24 hours before tour. Full refund for weather-related cancellations.'
    }
  },
  rental: {
    'check-in': {
      keywords: ['check in', 'arrival', 'key', 'access'],
      response: 'Self check-in available after 3:00 PM. Access code will be sent 24 hours before arrival.'
    },
    'house rules': {
      keywords: ['rules', 'policy', 'pets', 'smoking', 'parties'],
      response: 'No smoking, no parties, no pets. Quiet hours 10 PM - 8 AM. Maximum occupancy must be observed.'
    },
    'amenities': {
      keywords: ['amenities', 'kitchen', 'laundry', 'wifi'],
      response: 'Full kitchen, washer/dryer, high-speed WiFi, beach gear, and dedicated parking spot included.'
    },
    'beach': {
      keywords: ['beach', 'ocean', 'distance', 'walk'],
      response: 'The property is a 5-minute walk to the beach. Beach chairs, umbrella, and cooler provided.'
    },
    'checkout': {
      keywords: ['checkout', 'check out', 'departure', 'leaving'],
      response: 'Check-out is at 10:00 AM. Please start dishwasher, take out trash, and lock all doors upon departure.'
    }
  }
}

export const professionalKnowledgeBase = {
  ...starterKnowledgeBase,
  advanced: {
    'booking': {
      keywords: ['book', 'reserve', 'availability', 'rate'],
      response: 'I can help you check availability and make a booking. What dates are you interested in?',
      action: 'booking_flow'
    },
    'recommendations': {
      keywords: ['recommend', 'suggest', 'what to do', 'activities'],
      response: 'Based on your preferences, I can recommend activities, restaurants, and attractions. What are you interested in?',
      action: 'recommendation_engine'
    },
    'weather': {
      keywords: ['weather', 'forecast', 'rain', 'temperature'],
      response: 'Let me check the current weather forecast for you.',
      action: 'weather_api'
    },
    'transportation': {
      keywords: ['uber', 'taxi', 'bus', 'rental car', 'transport'],
      response: 'I can help arrange transportation. Options include rental cars, rideshare, public transit, or our shuttle service.',
      action: 'transport_options'
    },
    'concierge': {
      keywords: ['restaurant', 'reservation', 'tickets', 'show'],
      response: 'Our concierge can assist with restaurant reservations, show tickets, and activity bookings. What would you like help with?',
      action: 'concierge_service'
    }
  }
}

export const multilingualResponses = {
  japanese: {
    greeting: 'こんにちは！ご質問がございましたらお手伝いいたします。',
    thank_you: 'ありがとうございました。他にご質問はございますか？'
  },
  spanish: {
    greeting: '¡Hola! ¿En qué puedo ayudarte hoy?',
    thank_you: 'Gracias. ¿Hay algo más en lo que pueda ayudarte?'
  },
  chinese: {
    greeting: '您好！我可以为您提供什么帮助？',
    thank_you: '谢谢。还有什么可以帮助您的吗？'
  },
  korean: {
    greeting: '안녕하세요! 무엇을 도와드릴까요?',
    thank_you: '감사합니다. 다른 도움이 필요하신가요?'
  }
}