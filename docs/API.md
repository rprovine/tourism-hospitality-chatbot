# API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register Business

```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "hotel@example.com",
  "password": "securepassword123",
  "businessName": "Sunset Beach Resort",
  "businessType": "hotel", // hotel | tour_operator | vacation_rental
  "tier": "starter" // starter | professional
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "business": {
    "id": "clxyz123...",
    "email": "hotel@example.com",
    "name": "Sunset Beach Resort",
    "type": "hotel",
    "tier": "starter",
    "primaryColor": "#0891b2",
    "welcomeMessage": "Aloha! Welcome to Sunset Beach Resort. How can I help you today?"
  }
}
```

#### Login

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "hotel@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "business": {
    "id": "clxyz123...",
    "email": "hotel@example.com",
    "name": "Sunset Beach Resort",
    "subscription": {
      "tier": "starter",
      "status": "active",
      "currentPeriodEnd": "2024-02-01T00:00:00Z"
    }
  }
}
```

#### Get Profile

```http
GET /auth/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "clxyz123...",
  "email": "hotel@example.com",
  "name": "Sunset Beach Resort",
  "type": "hotel",
  "tier": "starter",
  "primaryColor": "#0891b2",
  "welcomeMessage": "Aloha! Welcome to Sunset Beach Resort. How can I help you today?",
  "subscription": {
    "status": "active",
    "currentPeriodEnd": "2024-02-01T00:00:00Z"
  }
}
```

#### Update Profile

```http
PATCH /auth/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Sunset Beach Resort & Spa",
  "primaryColor": "#0284c7",
  "welcomeMessage": "Aloha! Welcome to our paradise. How may I assist you?",
  "businessInfo": {
    "address": "123 Beach Road, Honolulu, HI",
    "phone": "(808) 555-0123",
    "hours": "24/7"
  }
}
```

### Chat

#### Send Message

```http
POST /chat
```

**Request Body:**
```json
{
  "message": "What time is check-in?",
  "sessionId": "session_1234567890",
  "tier": "starter",
  "conversationId": "clxyz789..." // Optional, for continuing conversation
}
```

**Response:**
```json
{
  "conversationId": "clxyz789...",
  "message": "Check-in time is 3:00 PM and check-out is 11:00 AM. Early check-in may be available upon request.",
  "tier": "starter"
}
```

### Conversations

#### Get Conversations

```http
GET /conversations?businessId=<id>
```

**Query Parameters:**
- `businessId` - Filter by business
- `sessionId` - Filter by session
- `conversationId` - Get specific conversation

**Response:**
```json
[
  {
    "id": "clxyz789...",
    "businessId": "clxyz123...",
    "sessionId": "session_1234567890",
    "messages": [
      {
        "role": "user",
        "content": "What time is check-in?",
        "createdAt": "2024-01-15T10:30:00Z"
      },
      {
        "role": "assistant",
        "content": "Check-in time is 3:00 PM...",
        "createdAt": "2024-01-15T10:30:02Z"
      }
    ],
    "satisfaction": 5,
    "resolved": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

#### Update Conversation

```http
PATCH /conversations
```

**Request Body:**
```json
{
  "conversationId": "clxyz789...",
  "satisfaction": 5,
  "resolved": true
}
```

### Analytics

#### Get Analytics

```http
GET /analytics?businessId=<id>&startDate=2024-01-01&endDate=2024-01-31
```

**Query Parameters:**
- `businessId` (required) - Business ID
- `startDate` - Start date (ISO 8601)
- `endDate` - End date (ISO 8601)

**Response:**
```json
{
  "analytics": [
    {
      "date": "2024-01-15T00:00:00Z",
      "totalConversations": 45,
      "uniqueUsers": 38,
      "avgSatisfaction": 4.7,
      "avgResponseTime": 1.2
    }
  ],
  "summary": {
    "totalConversations": 1350,
    "totalMessages": 5400,
    "avgMessagesPerConversation": 4,
    "avgSatisfaction": 4.6,
    "resolutionRate": 92.5,
    "topQuestions": [
      {
        "question": "what time is check-in?",
        "count": 234
      },
      {
        "question": "do you have parking?",
        "count": 189
      }
    ]
  },
  "dateRange": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  }
}
```

#### Generate Daily Analytics

```http
POST /analytics
```

**Request Body:**
```json
{
  "businessId": "clxyz123...",
  "date": "2024-01-15" // Optional, defaults to today
}
```

## Error Responses

All endpoints return standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

**Error Response Format:**
```json
{
  "error": "Error message",
  "details": {} // Optional, validation errors
}
```

## Rate Limiting

- **Starter Plan**: 1,000 conversations/month
- **Professional Plan**: Unlimited

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1704067200
```

## Webhooks (Coming Soon)

Webhook events will be sent to configured endpoints:

- `conversation.created`
- `conversation.completed`
- `subscription.updated`
- `satisfaction.received`