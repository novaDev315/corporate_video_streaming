# API Documentation

## Base URL

```
http://localhost:4000/api/v1
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "orgId": "uuid",
  "role": "viewer"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "token": "jwt_token"
}
```

#### POST /auth/login
Login with email and password

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": { ... },
  "token": "jwt_token"
}
```

### Videos

#### GET /videos
Get all videos for organization

**Query Parameters:**
- `category` (optional): Filter by category
- `search` (optional): Search in title

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Company Town Hall",
    "description": "Q3 2024 Town Hall Meeting",
    "status": "ready",
    "duration": 3600,
    "viewCount": 150,
    "thumbnailUrl": "https://...",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

#### GET /videos/:id
Get video by ID

#### POST /videos
Create new video entry

**Request Body:**
```json
{
  "title": "Video Title",
  "description": "Video description",
  "category": "training",
  "privacy": "private"
}
```

#### PUT /videos/:id
Update video metadata

#### DELETE /videos/:id
Delete video

#### POST /videos/:id/process
Trigger video processing/transcoding

#### POST /videos/:id/track
Track video view analytics

**Request Body:**
```json
{
  "watchTime": 1200,
  "completionPercentage": 75,
  "deviceType": "desktop"
}
```

### Live Streams

#### GET /streams
Get all streams for organization

#### GET /streams/:id
Get stream by ID

#### POST /streams
Create new live stream

**Request Body:**
```json
{
  "title": "Live Event",
  "description": "Company all-hands meeting",
  "scheduledAt": "2024-01-15T10:00:00Z",
  "enableChat": true,
  "enableQA": true
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Live Event",
  "streamKey": "unique-stream-key",
  "rtmpUrl": "rtmp://live.example.com/live/stream-key",
  "hlsUrl": "https://cdn.example.com/stream.m3u8"
}
```

#### PUT /streams/:id/start
Start live stream

#### PUT /streams/:id/end
End live stream

#### DELETE /streams/:id
Delete stream

### Analytics

#### GET /analytics/videos/:videoId
Get analytics for a specific video

**Response:**
```json
{
  "totalViews": 150,
  "uniqueViewers": 120,
  "totalWatchTime": 180000,
  "avgCompletionRate": 72.5,
  "deviceBreakdown": {
    "desktop": 80,
    "mobile": 60,
    "tablet": 10
  }
}
```

#### GET /analytics/organization/:orgId
Get organization-wide analytics

**Query Parameters:**
- `startDate` (optional): Start date for range
- `endDate` (optional): End date for range

#### GET /analytics/users/:userId
Get user watch history and engagement

### Upload

#### POST /upload/presigned-url
Get presigned URL for video upload

**Request Body:**
```json
{
  "fileName": "video.mp4",
  "fileType": "video/mp4"
}
```

**Response:**
```json
{
  "uploadUrl": "https://s3.amazonaws.com/...",
  "s3Key": "uploads/12345-video.mp4",
  "expiresIn": 3600
}
```

#### POST /upload/complete
Mark upload as complete

**Request Body:**
```json
{
  "videoId": "uuid",
  "s3Key": "uploads/12345-video.mp4"
}
```

## WebSocket Events

### Namespace: /streams

#### join-stream
Join a live stream

**Emit:**
```json
{
  "streamId": "uuid"
}
```

#### leave-stream
Leave a live stream

#### send-chat
Send chat message

**Emit:**
```json
{
  "streamId": "uuid",
  "message": "Hello everyone!",
  "user": {
    "id": "uuid",
    "name": "John Doe"
  }
}
```

#### ask-question
Ask a question during live stream

**Emit:**
```json
{
  "streamId": "uuid",
  "question": "When will the new feature be released?",
  "user": {
    "id": "uuid",
    "name": "John Doe"
  }
}
```

#### Listen Events:
- `viewer-count`: Receive viewer count updates
- `chat-message`: Receive chat messages
- `new-question`: Receive new questions

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

Common status codes:
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error
