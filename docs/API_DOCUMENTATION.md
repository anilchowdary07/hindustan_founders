# Founder Network API Documentation

## Overview

This document provides comprehensive documentation for the Founder Network API. The API follows RESTful principles and uses JSON for data exchange.

## Base URL

```
https://api.foundernetwork.com/v1
```

For development:
```
http://localhost:3000/api
```

## Authentication

Most API endpoints require authentication. The API uses JWT (JSON Web Tokens) for authentication.

### Authentication Headers

```
Authorization: Bearer {your_jwt_token}
```

### Obtaining a Token

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "user"
  }
}
```

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests.

### Common Status Codes

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

## Rate Limiting

API requests are rate-limited to prevent abuse. The current limits are:

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1620000000
```

## API Endpoints

### User Management

#### Get Current User

```http
GET /users/me
Authorization: Bearer {token}
```

Response:

```json
{
  "id": "user_123",
  "name": "John Doe",
  "email": "user@example.com",
  "role": "user",
  "profilePicture": "https://example.com/profile.jpg",
  "bio": "Entrepreneur and developer",
  "location": "San Francisco, CA",
  "company": "Tech Startup",
  "position": "Founder & CEO",
  "website": "https://example.com",
  "social": {
    "linkedin": "https://linkedin.com/in/johndoe",
    "twitter": "https://twitter.com/johndoe",
    "github": "https://github.com/johndoe"
  },
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2023-01-01T00:00:00Z"
}
```

#### Update User Profile

```http
PATCH /users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Smith",
  "bio": "Updated bio",
  "location": "New York, NY"
}
```

Response:

```json
{
  "id": "user_123",
  "name": "John Smith",
  "email": "user@example.com",
  "bio": "Updated bio",
  "location": "New York, NY",
  "updatedAt": "2023-01-02T00:00:00Z"
}
```

#### Get User by ID

```http
GET /users/{userId}
Authorization: Bearer {token}
```

Response: Same as Get Current User

### Connections

#### Get User Connections

```http
GET /connections
Authorization: Bearer {token}
```

Query Parameters:
- `status`: Filter by connection status (`pending`, `accepted`, `rejected`)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

Response:

```json
{
  "connections": [
    {
      "id": "conn_123",
      "user": {
        "id": "user_456",
        "name": "Jane Doe",
        "profilePicture": "https://example.com/jane.jpg",
        "position": "CTO",
        "company": "Tech Co"
      },
      "status": "accepted",
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "pages": 3,
    "page": 1,
    "limit": 20
  }
}
```

#### Send Connection Request

```http
POST /connections
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": "user_456",
  "message": "I'd like to connect with you."
}
```

Response:

```json
{
  "id": "conn_789",
  "user": {
    "id": "user_456",
    "name": "Jane Doe"
  },
  "status": "pending",
  "message": "I'd like to connect with you.",
  "createdAt": "2023-01-03T00:00:00Z"
}
```

#### Respond to Connection Request

```http
PATCH /connections/{connectionId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "accepted"
}
```

Response:

```json
{
  "id": "conn_789",
  "status": "accepted",
  "updatedAt": "2023-01-03T00:00:00Z"
}
```

### Messaging

#### Get Conversations

```http
GET /conversations
Authorization: Bearer {token}
```

Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

Response:

```json
{
  "conversations": [
    {
      "id": "conv_123",
      "participants": [
        {
          "id": "user_456",
          "name": "Jane Doe",
          "profilePicture": "https://example.com/jane.jpg"
        }
      ],
      "lastMessage": {
        "id": "msg_789",
        "senderId": "user_456",
        "content": "Hello there!",
        "createdAt": "2023-01-03T00:00:00Z"
      },
      "unreadCount": 2,
      "updatedAt": "2023-01-03T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "pages": 1,
    "page": 1,
    "limit": 20
  }
}
```

#### Get Messages in Conversation

```http
GET /conversations/{conversationId}/messages
Authorization: Bearer {token}
```

Query Parameters:
- `before`: Get messages before this timestamp
- `limit`: Items per page (default: 50)

Response:

```json
{
  "messages": [
    {
      "id": "msg_789",
      "senderId": "user_456",
      "content": "Hello there!",
      "attachments": [],
      "readAt": null,
      "createdAt": "2023-01-03T00:00:00Z"
    },
    {
      "id": "msg_790",
      "senderId": "user_123",
      "content": "Hi Jane, how are you?",
      "attachments": [],
      "readAt": "2023-01-03T00:01:00Z",
      "createdAt": "2023-01-03T00:00:30Z"
    }
  ],
  "hasMore": false
}
```

#### Send Message

```http
POST /conversations/{conversationId}/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Great to connect with you!",
  "attachments": []
}
```

Response:

```json
{
  "id": "msg_791",
  "senderId": "user_123",
  "content": "Great to connect with you!",
  "attachments": [],
  "readAt": null,
  "createdAt": "2023-01-03T00:02:00Z"
}
```

### Jobs

#### Get Jobs

```http
GET /jobs
```

Query Parameters:
- `search`: Search term
- `location`: Filter by location
- `type`: Filter by job type (`full-time`, `part-time`, `contract`, `internship`)
- `remote`: Filter remote jobs (`true`, `false`)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

Response:

```json
{
  "jobs": [
    {
      "id": "job_123",
      "title": "Software Engineer",
      "company": {
        "id": "comp_456",
        "name": "Tech Co",
        "logo": "https://example.com/techco.jpg"
      },
      "location": "San Francisco, CA",
      "type": "full-time",
      "remote": true,
      "salary": {
        "min": 100000,
        "max": 150000,
        "currency": "USD"
      },
      "description": "We're looking for a talented software engineer...",
      "requirements": ["5+ years experience", "React", "Node.js"],
      "postedAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "pages": 8,
    "page": 1,
    "limit": 20
  }
}
```

#### Get Job by ID

```http
GET /jobs/{jobId}
```

Response: Detailed job information

#### Create Job Posting

```http
POST /jobs
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Frontend Developer",
  "company": "comp_456",
  "location": "New York, NY",
  "type": "full-time",
  "remote": true,
  "salary": {
    "min": 90000,
    "max": 120000,
    "currency": "USD"
  },
  "description": "Job description...",
  "requirements": ["3+ years experience", "React", "TypeScript"]
}
```

Response: Created job details

#### Apply for Job

```http
POST /jobs/{jobId}/applications
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "coverLetter": "I'm excited to apply for this position...",
  "resume": [file upload]
}
```

Response:

```json
{
  "id": "app_123",
  "jobId": "job_123",
  "status": "pending",
  "coverLetter": "I'm excited to apply for this position...",
  "resumeUrl": "https://example.com/resumes/user_123.pdf",
  "createdAt": "2023-01-03T00:00:00Z"
}
```

### Events

#### Get Events

```http
GET /events
```

Query Parameters:
- `search`: Search term
- `location`: Filter by location
- `startDate`: Filter by start date (ISO format)
- `endDate`: Filter by end date (ISO format)
- `type`: Filter by event type
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

Response:

```json
{
  "events": [
    {
      "id": "evt_123",
      "title": "Startup Networking Mixer",
      "description": "Join us for an evening of networking...",
      "startDate": "2023-02-15T18:00:00Z",
      "endDate": "2023-02-15T21:00:00Z",
      "location": {
        "name": "Tech Hub",
        "address": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "country": "USA",
        "virtual": false
      },
      "organizer": {
        "id": "user_789",
        "name": "Tech Events Inc."
      },
      "coverImage": "https://example.com/events/mixer.jpg",
      "attendeeCount": 45,
      "capacity": 100
    }
  ],
  "pagination": {
    "total": 25,
    "pages": 2,
    "page": 1,
    "limit": 20
  }
}
```

#### Get Event by ID

```http
GET /events/{eventId}
```

Response: Detailed event information

#### Create Event

```http
POST /events
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "title": "Founder Meetup",
  "description": "Monthly meetup for founders...",
  "startDate": "2023-03-01T18:00:00Z",
  "endDate": "2023-03-01T20:00:00Z",
  "location": {
    "name": "Startup Space",
    "address": "456 Market St",
    "city": "San Francisco",
    "state": "CA",
    "country": "USA",
    "virtual": false
  },
  "capacity": 50,
  "coverImage": [file upload]
}
```

Response: Created event details

#### Register for Event

```http
POST /events/{eventId}/register
Authorization: Bearer {token}
```

Response:

```json
{
  "id": "reg_123",
  "eventId": "evt_123",
  "status": "registered",
  "createdAt": "2023-01-03T00:00:00Z"
}
```

### Analytics

#### Get Profile Analytics

```http
GET /analytics/profile
Authorization: Bearer {token}
```

Query Parameters:
- `timeRange`: Time range (`7days`, `30days`, `90days`, `year`)

Response:

```json
{
  "profileViews": {
    "total": 1248,
    "change": 12.5,
    "data": [
      { "name": "Jan 1", "views": 65 },
      { "name": "Jan 2", "views": 59 }
    ]
  },
  "connections": {
    "total": 32,
    "change": 8.2,
    "data": [
      { "name": "Week 1", "connections": 5 },
      { "name": "Week 2", "connections": 8 }
    ],
    "breakdown": [
      { "name": "Founders", "value": 45 },
      { "name": "Investors", "value": 20 }
    ]
  },
  "engagement": {
    "rate": 18.7,
    "change": -2.3,
    "data": [
      { "name": "Week 1", "rate": 22 },
      { "name": "Week 2", "rate": 21 }
    ],
    "breakdown": [
      { "name": "Posts", "count": 24 },
      { "name": "Comments", "count": 67 }
    ]
  }
}
```

#### Export Analytics

```http
GET /analytics/export
Authorization: Bearer {token}
```

Query Parameters:
- `timeRange`: Time range (`7days`, `30days`, `90days`, `year`)
- `format`: Export format (`csv`, `pdf`)

Response: Binary file download

### Subscription Management

#### Get Current Subscription

```http
GET /subscription
Authorization: Bearer {token}
```

Response:

```json
{
  "id": "sub_123",
  "planId": "plan_premium",
  "tier": "premium",
  "status": "active",
  "currentPeriodStart": "2023-01-01T00:00:00Z",
  "currentPeriodEnd": "2023-02-01T00:00:00Z",
  "cancelAtPeriodEnd": false
}
```

#### Get Available Plans

```http
GET /subscription/plans
```

Response:

```json
[
  {
    "id": "plan_free",
    "name": "Free",
    "tier": "free",
    "price": 0,
    "billingPeriod": "monthly",
    "features": [
      {
        "id": "basic_profile",
        "name": "Basic Profile",
        "description": "Create and maintain a basic professional profile",
        "included": true
      }
    ]
  },
  {
    "id": "plan_premium",
    "name": "Premium",
    "tier": "premium",
    "price": 2499,
    "billingPeriod": "monthly",
    "features": [
      {
        "id": "basic_profile",
        "name": "Basic Profile",
        "description": "Create and maintain a basic professional profile",
        "included": true
      },
      {
        "id": "advanced_search",
        "name": "Advanced Search",
        "description": "Access advanced search filters and saved searches",
        "included": true
      }
    ]
  }
]
```

#### Subscribe to Plan

```http
POST /subscription
Authorization: Bearer {token}
Content-Type: application/json

{
  "planId": "plan_premium"
}
```

Response:

```json
{
  "success": true,
  "subscription": {
    "id": "sub_123",
    "planId": "plan_premium",
    "tier": "premium",
    "status": "active",
    "currentPeriodStart": "2023-01-03T00:00:00Z",
    "currentPeriodEnd": "2023-02-03T00:00:00Z",
    "cancelAtPeriodEnd": false
  }
}
```

#### Cancel Subscription

```http
POST /subscription/cancel
Authorization: Bearer {token}
Content-Type: application/json

{
  "cancelImmediately": false
}
```

Response:

```json
{
  "success": true,
  "subscription": {
    "id": "sub_123",
    "planId": "plan_premium",
    "tier": "premium",
    "status": "active",
    "currentPeriodStart": "2023-01-03T00:00:00Z",
    "currentPeriodEnd": "2023-02-03T00:00:00Z",
    "cancelAtPeriodEnd": true
  }
}
```

## Webhooks

Founder Network provides webhooks for real-time event notifications. To receive webhooks, you need to register a webhook URL in your developer settings.

### Available Events

- `user.updated`: User profile updated
- `connection.created`: New connection request
- `connection.updated`: Connection status changed
- `message.created`: New message received
- `job.applied`: New job application
- `event.registered`: New event registration
- `subscription.created`: New subscription
- `subscription.updated`: Subscription updated
- `subscription.canceled`: Subscription canceled

### Webhook Payload

```json
{
  "id": "evt_123",
  "type": "connection.created",
  "created": "2023-01-03T00:00:00Z",
  "data": {
    "id": "conn_789",
    "userId": "user_456",
    "status": "pending"
  }
}
```

### Webhook Security

Webhooks include a signature in the `X-Signature` header to verify the authenticity of the request. The signature is a HMAC SHA-256 hash of the request body using your webhook secret.

## API Versioning

The API is versioned using the URL path. The current version is `v1`. When breaking changes are introduced, a new version will be released.

## Support

For API support, please contact api-support@foundernetwork.com or visit our developer forum at https://developers.foundernetwork.com.

## Changelog

### v1.0.0 (2023-01-01)

- Initial release of the Founder Network API

### v1.1.0 (2023-03-15)

- Added analytics endpoints
- Added subscription management
- Improved error handling
- Added webhook support