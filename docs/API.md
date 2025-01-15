# STEAMS Education Platform - API Documentation

## 🔐 Authentication API

### Sign In
```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Response
```json
{
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "STUDENT"
  },
  "token": "jwt_token_here"
}
```

### Sign Out
```http
POST /api/auth/signout
Authorization: Bearer <token>
```

### Get Session
```http
GET /api/auth/session
Authorization: Bearer <token>
```

## 📚 Lessons API

### Get All Lessons
```http
GET /api/lessons
Authorization: Bearer <token>
```

#### Response
```json
{
  "lessons": [
    {
      "id": "lesson_123",
      "title": "Introduction to Physics",
      "description": "Learn basic physics concepts",
      "type": "INTERACTIVE",
      "difficulty": "BEGINNER",
      "duration": 30,
      "topics": ["physics", "mechanics"]
    }
  ]
}
```

### Get Lesson by ID
```http
GET /api/lessons/{id}
Authorization: Bearer <token>
```

### Update Progress
```http
POST /api/lessons/{id}/progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "completed": true,
  "score": 95,
  "timeSpent": 1800
}
```

## 💬 Messages API

### Get Messages
```http
GET /api/messages
Authorization: Bearer <token>
Query Parameters:
  - limit: number (default: 20)
  - offset: number (default: 0)
  - unreadOnly: boolean (default: false)
```

### Send Message
```http
POST /api/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientId": "user_456",
  "content": "Hello! Need help with the physics lesson?",
  "attachments": []
}
```

### Get Unread Count
```http
GET /api/messages/unread
Authorization: Bearer <token>
```

## 📊 Analytics API

### Get User Analytics
```http
GET /api/analytics/user
Authorization: Bearer <token>
Query Parameters:
  - startDate: string (ISO date)
  - endDate: string (ISO date)
  - metrics: string[] (comma-separated)
```

### Export Analytics
```http
POST /api/analytics/export
Authorization: Bearer <token>
Content-Type: application/json

{
  "format": "pdf",
  "startDate": "2025-01-01",
  "endDate": "2025-01-15",
  "metrics": ["timeSpent", "completion", "subjects"]
}
```

## 🔔 Notifications API

### Subscribe
```http
POST /api/notifications/subscribe
Authorization: Bearer <token>
Content-Type: application/json

{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "base64_encoded_key",
    "auth": "base64_encoded_auth"
  }
}
```

### Unsubscribe
```http
POST /api/notifications/unsubscribe
Authorization: Bearer <token>
Content-Type: application/json

{
  "endpoint": "https://fcm.googleapis.com/fcm/send/..."
}
```

### Send Notification
```http
POST /api/notifications/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_123",
  "type": "achievement",
  "data": {
    "achievementName": "Quick Learner",
    "description": "Completed 5 lessons in one day"
  }
}
```

## 🎨 Interactive Exercises API

### Get Exercise
```http
GET /api/exercises/{type}/{id}
Authorization: Bearer <token>
```

### Submit Exercise
```http
POST /api/exercises/{type}/{id}/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": [...],
  "timeSpent": 300,
  "attempts": 1
}
```

### Get Exercise History
```http
GET /api/exercises/history
Authorization: Bearer <token>
Query Parameters:
  - type: string
  - startDate: string (ISO date)
  - endDate: string (ISO date)
```

## ⚙️ Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "specific_field",
      "reason": "validation_failed"
    }
  }
}
```

### Common Error Codes
- `AUTH_REQUIRED`: Authentication required
- `INVALID_CREDENTIALS`: Invalid email or password
- `NOT_FOUND`: Resource not found
- `FORBIDDEN`: Permission denied
- `VALIDATION_ERROR`: Invalid input data
- `RATE_LIMITED`: Too many requests

## 🔄 WebSocket Events

### Connection
```javascript
socket.on('connect', () => {
  console.log('Connected to WebSocket');
});
```

### Real-time Events
```javascript
// New message received
socket.on('message', (message) => {
  console.log('New message:', message);
});

// Progress update
socket.on('progress', (progress) => {
  console.log('Progress update:', progress);
});

// Notification
socket.on('notification', (notification) => {
  console.log('New notification:', notification);
});
```

## 🚀 Rate Limiting

- Authentication endpoints: 5 requests per minute
- General API endpoints: 60 requests per minute
- Analytics endpoints: 30 requests per minute
- Export endpoints: 5 requests per hour

## 📝 Pagination

### Request
```http
GET /api/resources
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20)
  - sortBy: string
  - sortOrder: "asc" | "desc"
```

### Response
```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 195,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```
