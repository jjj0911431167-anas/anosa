# API Documentation

## Base URL

```
Production: https://api.socialchat.app
Development: http://localhost:3000
```

## Authentication

All API requests require a JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Response Format

All responses follow this format:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

---

## Authentication Endpoints

### Register with Phone Number

**POST** `/api/auth/register`

Request:
```json
{
  "phoneNumber": "+966501234567",
  "name": "أحمد محمد",
  "countryCode": "SA"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "phoneNumber": "+966501234567",
    "otpSent": true,
    "expiresIn": 600
  }
}
```

### Verify OTP

**POST** `/api/auth/verify-otp`

Request:
```json
{
  "phoneNumber": "+966501234567",
  "otp": "123456"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "phoneNumber": "+966501234567",
      "name": "أحمد محمد"
    }
  }
}
```

### Login

**POST** `/api/auth/login`

Request:
```json
{
  "phoneNumber": "+966501234567",
  "password": "your-password"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "phoneNumber": "+966501234567",
      "name": "أحمد محمد"
    }
  }
}
```

### Logout

**POST** `/api/auth/logout`

Response:
```json
{
  "success": true
}
```

---

## User Endpoints

### Get Current User

**GET** `/api/users/me`

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "phoneNumber": "+966501234567",
    "name": "أحمد محمد",
    "bio": "مهندس برمجيات",
    "profilePictureUrl": "https://...",
    "isOnline": true,
    "lastSeen": "2026-06-03T12:00:00Z",
    "createdAt": "2026-06-01T10:00:00Z"
  }
}
```

### Get User Profile

**GET** `/api/users/:userId`

Response:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "phoneNumber": "+966502345678",
    "name": "فاطمة علي",
    "bio": "مصممة جرافيك",
    "profilePictureUrl": "https://...",
    "isOnline": false,
    "lastSeen": "2026-06-03T11:30:00Z"
  }
}
```

### Update Profile

**PUT** `/api/users/me`

Request:
```json
{
  "name": "أحمد محمد محسن",
  "bio": "مهندس برمجيات متقدم",
  "profilePictureUrl": "https://..."
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "أحمد محمد محسن",
    "bio": "مهندس برمجيات متقدم",
    "profilePictureUrl": "https://..."
  }
}
```

### Block User

**POST** `/api/users/:userId/block`

Response:
```json
{
  "success": true,
  "data": {
    "blockedUserId": 2,
    "blockedAt": "2026-06-03T12:00:00Z"
  }
}
```

### Unblock User

**POST** `/api/users/:userId/unblock`

Response:
```json
{
  "success": true
}
```

---

## Messaging Endpoints

### Get Chats

**GET** `/api/chats?limit=20&offset=0`

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "participantId": 2,
      "participantName": "فاطمة علي",
      "lastMessage": "مرحبا، كيف حالك؟",
      "lastMessageTime": "2026-06-03T12:00:00Z",
      "unreadCount": 3,
      "isOnline": true
    }
  ],
  "total": 15
}
```

### Get Messages

**GET** `/api/chats/:chatId/messages?limit=20&offset=0`

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "text": "مرحبا",
      "senderId": 2,
      "senderName": "فاطمة علي",
      "status": "read",
      "createdAt": "2026-06-03T12:00:00Z",
      "mediaUrl": null,
      "mediaType": null
    }
  ],
  "total": 50
}
```

### Send Message

**POST** `/api/messages`

Request:
```json
{
  "chatId": 1,
  "text": "مرحبا، كيف حالك؟",
  "mediaUrl": null,
  "mediaType": null
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 100,
    "text": "مرحبا، كيف حالك؟",
    "senderId": 1,
    "status": "sent",
    "createdAt": "2026-06-03T12:05:00Z"
  }
}
```

### Edit Message

**PUT** `/api/messages/:messageId`

Request:
```json
{
  "text": "مرحبا، كيف حالك؟ (معدل)"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 100,
    "text": "مرحبا، كيف حالك؟ (معدل)",
    "editedAt": "2026-06-03T12:06:00Z"
  }
}
```

### Delete Message

**DELETE** `/api/messages/:messageId`

Response:
```json
{
  "success": true
}
```

### Mark as Read

**POST** `/api/messages/:messageId/read`

Response:
```json
{
  "success": true
}
```

---

## Calls Endpoints

### Get Call History

**GET** `/api/calls?limit=20&offset=0`

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "participantId": 2,
      "participantName": "فاطمة علي",
      "type": "video",
      "duration": 300,
      "status": "completed",
      "startTime": "2026-06-03T12:00:00Z",
      "endTime": "2026-06-03T12:05:00Z"
    }
  ],
  "total": 25
}
```

### Initiate Call

**POST** `/api/calls/initiate`

Request:
```json
{
  "targetUserId": 2,
  "type": "video"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "callId": "call-123",
    "targetUserId": 2,
    "type": "video",
    "signalingUrl": "wss://signaling.socialchat.app"
  }
}
```

---

## Stories Endpoints

### Get Stories

**GET** `/api/stories?limit=20`

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 2,
      "userName": "فاطمة علي",
      "userAvatar": "https://...",
      "content": "صورة جميلة",
      "type": "image",
      "mediaUrl": "https://...",
      "viewCount": 15,
      "createdAt": "2026-06-03T10:00:00Z",
      "expiresAt": "2026-06-04T10:00:00Z",
      "isViewed": true
    }
  ]
}
```

### Create Story

**POST** `/api/stories`

Request:
```json
{
  "content": "صورة جميلة",
  "type": "image",
  "mediaUrl": "https://...",
  "duration": 5
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 100,
    "userId": 1,
    "type": "image",
    "createdAt": "2026-06-03T12:00:00Z",
    "expiresAt": "2026-06-04T12:00:00Z"
  }
}
```

### Delete Story

**DELETE** `/api/stories/:storyId`

Response:
```json
{
  "success": true
}
```

---

## Groups Endpoints

### Get Groups

**GET** `/api/groups?limit=20&offset=0`

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "مجموعة التطوير",
      "description": "مجموعة لمناقشة مشاريع التطوير",
      "memberCount": 25,
      "createdAt": "2026-05-01T10:00:00Z",
      "isAdmin": true
    }
  ]
}
```

### Create Group

**POST** `/api/groups`

Request:
```json
{
  "name": "مجموعة جديدة",
  "description": "وصف المجموعة",
  "memberIds": [2, 3, 4]
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 10,
    "name": "مجموعة جديدة",
    "description": "وصف المجموعة",
    "createdAt": "2026-06-03T12:00:00Z"
  }
}
```

### Add Member to Group

**POST** `/api/groups/:groupId/members`

Request:
```json
{
  "userId": 5
}
```

Response:
```json
{
  "success": true
}
```

### Remove Member from Group

**DELETE** `/api/groups/:groupId/members/:userId`

Response:
```json
{
  "success": true
}
```

---

## Admin Endpoints

### Get All Users

**GET** `/api/admin/users?limit=20&offset=0&search=`

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "phoneNumber": "+966501234567",
      "name": "أحمد محمد",
      "createdAt": "2026-06-01T10:00:00Z",
      "isActive": true,
      "isBlocked": false
    }
  ],
  "total": 1000
}
```

### Get System Statistics

**GET** `/api/admin/stats`

Response:
```json
{
  "success": true,
  "data": {
    "totalUsers": 5000,
    "activeUsers": 1200,
    "blockedUsers": 50,
    "totalMessages": 250000,
    "totalCalls": 10000,
    "totalStories": 5000,
    "apiVersion": "1.0.0",
    "dbStatus": "connected"
  }
}
```

### Block User (Admin)

**POST** `/api/admin/users/:userId/block`

Request:
```json
{
  "reason": "Spam"
}
```

Response:
```json
{
  "success": true
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": "Invalid request parameters"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": "Authentication required"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "error": "Access denied"
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Rate Limiting

API requests are rate limited to prevent abuse:

- **Authenticated users**: 1000 requests per hour
- **Unauthenticated users**: 100 requests per hour
- **Admin endpoints**: 10000 requests per hour

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1686048000
```

---

## WebSocket Events (Socket.io)

### Connection

```javascript
socket.connect();
```

### Message Events

```javascript
// Send message
socket.emit('message:send', {
  chatId: 1,
  text: 'Hello',
  timestamp: new Date()
});

// Receive message
socket.on('message:new', (message) => {
  console.log('New message:', message);
});

// Message read
socket.on('message:read', (data) => {
  console.log('Message read:', data);
});
```

### Presence Events

```javascript
// Set typing
socket.emit('user:typing', {
  chatId: 1,
  isTyping: true
});

// Receive typing indicator
socket.on('user:typing', (data) => {
  console.log('User typing:', data);
});

// Set presence
socket.emit('user:presence', {
  status: 'online'
});

// Receive presence update
socket.on('user:online', (user) => {
  console.log('User online:', user);
});
```

### Call Events

```javascript
// Initiate call
socket.emit('call:initiate', {
  targetUserId: 2,
  callType: 'video'
});

// Receive incoming call
socket.on('call:incoming', (data) => {
  console.log('Incoming call:', data);
});

// Answer call
socket.emit('call:answer', { callId: 'call-123' });

// End call
socket.emit('call:end', { callId: 'call-123' });
```

---

## Testing

Use the provided Postman collection or curl commands to test the API:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+966501234567","name":"أحمد"}'

# Send message
curl -X POST http://localhost:3000/api/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"chatId":1,"text":"مرحبا"}'
```

---

For more information, visit the API documentation at https://docs.socialchat.app
