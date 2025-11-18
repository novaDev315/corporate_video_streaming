# Architecture Overview

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend Layer                       │
│         (Next.js 14 + React + TypeScript + Tailwind)        │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/WSS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       API Gateway Layer                      │
│                  (NestJS + Express + Socket.IO)             │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Auth       │    │   Video      │    │   Stream     │
│   Service    │    │   Service    │    │   Service    │
└──────────────┘    └──────────────┘    └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  PostgreSQL  │    │    Redis     │    │   AWS S3     │
│  (Metadata)  │    │  (Sessions)  │    │   (Videos)   │
└──────────────┘    └──────────────┘    └──────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui (Radix UI)
- **State Management**: Zustand
- **Video Player**: Video.js
- **Real-time**: Socket.IO Client

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: NestJS 10+
- **Language**: TypeScript 5.0+
- **API**: REST + WebSocket
- **Database ORM**: TypeORM
- **Validation**: class-validator
- **Authentication**: JWT + Passport

### Database & Storage
- **Primary Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Queue**: BullMQ
- **File Storage**: AWS S3
- **CDN**: CloudFront

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Video Processing**: FFmpeg
- **Streaming**: HLS/DASH protocol
- **Transcription**: AWS Transcribe

## Data Flow

### Video Upload Flow

1. User selects video file in frontend
2. Frontend requests presigned S3 URL from backend
3. Backend generates presigned URL and returns to frontend
4. Frontend uploads video directly to S3
5. Frontend notifies backend of upload completion
6. Backend adds transcoding job to BullMQ queue
7. Worker processes video with FFmpeg
8. Transcoded files uploaded back to S3
9. Database updated with video URLs
10. User notified of completion

### Live Streaming Flow

1. Presenter creates live stream in dashboard
2. Backend generates unique stream key
3. Presenter uses stream key with OBS/streaming software
4. RTMP stream ingested by media server
5. Stream transcoded to HLS
6. HLS stream distributed via CDN
7. Viewers connect via WebSocket for real-time updates
8. Chat/Q&A messages broadcast via Socket.IO
9. Stream automatically recorded for VOD
10. Recording processed and added to video library

### Analytics Tracking Flow

1. Video player tracks watch events (play, pause, time update)
2. Events batched and sent to backend periodically
3. Backend stores analytics data in PostgreSQL
4. Aggregation queries run for dashboard metrics
5. Analytics API serves data to frontend dashboard

## Security Architecture

### Authentication & Authorization

- **JWT-based authentication** with refresh tokens
- **Role-based access control** (RBAC)
- **SSO integration** via SAML/OIDC
- **Multi-factor authentication** (optional)

### Data Security

- **Encryption at rest**: S3 server-side encryption
- **Encryption in transit**: TLS 1.3
- **Signed URLs**: Time-limited access to videos
- **Database encryption**: PostgreSQL encryption
- **Password hashing**: bcrypt with salt

### Network Security

- **CORS configuration**: Restricted origins
- **Rate limiting**: API throttling
- **DDoS protection**: CloudFront shield
- **WAF**: Web Application Firewall

## Scalability

### Horizontal Scaling

- **API servers**: Multiple NestJS instances behind load balancer
- **Workers**: Scale transcoding workers independently
- **Database**: Read replicas for analytics queries
- **CDN**: Global edge locations for video delivery

### Performance Optimization

- **Video CDN**: CloudFront for low-latency delivery
- **Database indexing**: Optimized queries
- **Redis caching**: Session and metadata caching
- **Lazy loading**: Frontend code splitting
- **Image optimization**: Next.js Image component

## Monitoring & Observability

### Metrics
- **Application metrics**: Request rates, errors, latency
- **Infrastructure metrics**: CPU, memory, disk usage
- **Business metrics**: Video views, user engagement
- **Video quality metrics**: Buffering ratio, start time

### Logging
- **Structured logging**: JSON format
- **Log aggregation**: Centralized log storage
- **Log levels**: Error, warn, info, debug
- **Correlation IDs**: Request tracing

### Alerting
- **Error rate alerts**: High error rates
- **Performance alerts**: Slow response times
- **Infrastructure alerts**: Resource exhaustion
- **Business alerts**: Low engagement, failures

## Deployment Strategy

### Development
- Local development with Docker Compose
- Hot reload for both frontend and backend
- Seed data for testing

### Staging
- Kubernetes cluster
- Automated deployments from feature branches
- Integration testing environment

### Production
- Kubernetes with auto-scaling
- Blue-green deployments
- Database migrations with rollback
- CDN cache warming

## Future Enhancements

### Phase 2
- Native mobile apps (iOS/Android)
- Advanced video editing tools
- LMS integrations
- Multi-language support

### Phase 3
- DRM and watermarking
- Multi-region deployment
- White-label capabilities
- AI-powered recommendations
