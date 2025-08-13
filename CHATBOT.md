# 🤖 Chatbot Integration & Architecture Documentation

## Overview

The Hawaii Business Intelligence System features a sophisticated AI-powered chatbot that intelligently combines multiple data sources to provide comprehensive, natural responses to guest inquiries. The system uses a unified AI-first approach that ensures consistent, high-quality interactions across all service tiers.

## Architecture

### Data Flow

```
User Message
    ↓
Chat Route (API)
    ↓
┌─────────────────────────────────────┐
│  Data Collection & Enrichment       │
├─────────────────────────────────────┤
│  1. Business Profile                │
│     - Contact info, hours, policies │
│     - Amenities, services           │
│     - Custom settings               │
│                                     │
│  2. Knowledge Base Search           │
│     - FAQ entries                   │
│     - Custom Q&A pairs              │
│     - Relevance scoring             │
│                                     │
│  3. Conversation History            │
│     - Previous messages             │
│     - Context retention             │
└─────────────────────────────────────┘
    ↓
AI Processing (Claude/OpenAI)
    ↓
Natural Language Response
    ↓
User
```

## Key Features

### 1. Unified AI Integration

All responses flow through AI for natural, comprehensive answers:

- **Business Profile Integration**: All business information (amenities, policies, contact details) is passed to the AI
- **Knowledge Base Integration**: Relevant Q&A pairs are searched and included in AI context
- **Intelligent Combination**: AI naturally combines all data sources into conversational responses

### 2. Multi-Tier Support

Different tiers receive enhanced capabilities while maintaining consistent data integration:

- **Starter**: Basic AI responses with full business data
- **Professional**: Enhanced AI with booking capabilities and multi-language support
- **Premium**: Luxury concierge service with personalization
- **Enterprise**: Multi-property coordination with advanced analytics

### 3. Quick Actions

Pre-configured buttons for common queries:
- View Amenities
- Check Availability  
- Get Directions
- Book a Room (Professional+)
- Restaurant Info (Professional+)
- Special Offers (Professional+)
- VIP Services (Premium+)
- Concierge (Premium+)

## API Endpoints

### Main Chat Endpoint
`POST /api/chat/route`

Handles authenticated dashboard chat interactions.

**Request Body:**
```json
{
  "message": "What amenities do you offer?",
  "sessionId": "session-123",
  "businessId": "business-456",
  "tier": "professional",
  "conversationId": "conv-789"
}
```

**Response:**
```json
{
  "conversationId": "conv-789",
  "message": "We offer a wonderful range of amenities...",
  "tier": "professional"
}
```

### Widget Chat Endpoint
`POST /api/widget/chat`

Handles public widget chat interactions with CORS support.

**Request Body:**
```json
{
  "message": "Do you have parking?",
  "sessionId": "session-123",
  "businessId": "business-456",
  "conversationId": null
}
```

**Response:**
```json
{
  "message": "Yes, we offer complimentary self-parking...",
  "conversationId": "conv-new-123",
  "tier": "starter"
}
```

## Configuration

### Business Profile Setup

Configure comprehensive business information in Settings:

```javascript
{
  // Contact Information
  "phone": "(808) 555-0100",
  "email": "info@resort.com",
  "website": "https://resort.com",
  
  // Location
  "address": "123 Beach Road",
  "city": "Honolulu",
  "state": "HI",
  "zip": "96815",
  
  // Hours & Policies
  "checkInTime": "3:00 PM",
  "checkOutTime": "11:00 AM",
  "frontDeskHours": "24/7",
  "cancellationPolicy": "Free cancellation up to 48 hours",
  
  // Amenities (ALL will be listed when asked)
  "parking": "Free self-parking and valet available",
  "wifi": "Complimentary high-speed WiFi throughout",
  "breakfast": "Continental breakfast 6:30-10:30 AM",
  "pool": "Infinity pool open 7 AM - 10 PM",
  "gym": "24/7 fitness center with ocean views",
  "restaurant": "3 restaurants including fine dining",
  
  // Policies
  "petPolicy": "Pets welcome with $50/night fee",
  "smokingPolicy": "Non-smoking property"
}
```

### Knowledge Base Management

Add Q&A pairs through the Knowledge Base interface:

```javascript
{
  "question": "What's included in the resort fee?",
  "answer": "The $35 daily resort fee includes WiFi, beach chairs, snorkel gear, and gym access.",
  "category": "fees",
  "keywords": "resort fee, included, amenities"
}
```

### AI Provider Configuration

Configure AI settings in Settings > AI Configuration:

```javascript
{
  "provider": "claude", // or "chatgpt"
  "customPrompt": "Always mention our award-winning spa",
  "temperature": 0.7,
  "maxTokens": 500,
  "claudeSettings": {
    "modelPreference": "sonnet" // haiku, sonnet, or opus
  },
  "chatgptSettings": {
    "modelPreference": "gpt-4" // gpt-3.5-turbo or gpt-4
  }
}
```

## Best Practices

### 1. Business Profile Completeness

Ensure ALL business information is filled out:
- Complete amenities list
- Accurate contact information
- Clear policies
- Current hours of operation

### 2. Knowledge Base Quality

Create high-quality Q&A entries:
- Answer frequently asked questions
- Use clear, concise language
- Include relevant keywords
- Update regularly

### 3. Custom Instructions

Use custom prompts to maintain brand voice:
```
"Always greet with 'Aloha' and mention our signature Mai Tai happy hour from 4-6 PM"
```

### 4. Testing Recommendations

Test these common scenarios:
1. "What amenities do you offer?" - Should list ALL configured amenities
2. "What's your cancellation policy?" - Should use exact policy from settings
3. "How can I contact you?" - Should provide all contact methods
4. Multi-turn conversations - Should maintain context

## Response Quality Examples

### Good Response (AI-Integrated)
```
User: "What amenities do you offer?"

AI: "Aloha! We're delighted to offer a comprehensive range of amenities for your comfort:

• **Parking**: Free self-parking and valet service available
• **WiFi**: Complimentary high-speed internet throughout the property  
• **Breakfast**: Continental breakfast served 6:30-10:30 AM in our Ocean View restaurant
• **Pool**: Stunning infinity pool with ocean views, open 7 AM - 10 PM
• **Fitness**: 24/7 state-of-the-art gym with personal trainers available
• **Dining**: Three restaurants including our award-winning fine dining venue

We also provide beach chairs, umbrellas, and snorkel gear at no extra charge. 
Is there a particular amenity you'd like to know more about?"
```

### Poor Response (Without Integration)
```
User: "What amenities do you offer?"

Bot: "We have various amenities. Please call for details."
```

## Troubleshooting

### Issue: Chatbot not using business data

**Solution**: Ensure business profile is saved in Settings and contains data

### Issue: Knowledge base not being referenced

**Solution**: Verify Q&A entries are active and have relevant keywords

### Issue: Generic or unhelpful responses

**Solution**: Check that AI API keys are configured and valid

### Issue: Amenities not listed completely

**Solution**: Ensure all amenities are configured in business profile

## Performance Optimization

### Caching Strategy
- Business profile cached for 5 minutes
- Knowledge base indexed for fast searching
- Previous messages limited to last 10 for context

### Response Time Targets
- < 100ms for cache hits
- < 500ms for knowledge base search
- < 2s for complete AI response

## Security Considerations

### Data Protection
- All conversations encrypted in transit and at rest
- PII automatically redacted from logs
- Conversation history retained per privacy policy

### Rate Limiting
- 60 requests per minute per session
- 1000 conversations per month (tier-based)
- Automatic throttling for suspected abuse

## Future Enhancements

### Planned Features
1. Voice input/output capability
2. Proactive engagement based on page views
3. Integration with booking systems
4. Advanced sentiment analysis
5. Multi-property knowledge sharing
6. A/B testing for responses
7. Custom training on property-specific data

## Support

For technical support or questions about chatbot integration:
- Email: support@lenilani.com
- Documentation: https://docs.lenilani.com
- API Status: https://status.lenilani.com