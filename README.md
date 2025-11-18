# Corporate Video Streaming Platform

Enterprise-grade video streaming platform for internal corporate communication, training, and events.

## Features

- **Live Streaming**: 1080p HD streaming with 10,000+ concurrent viewer support
- **Video On Demand**: Upload, transcode, and manage video content
- **Access Control**: SSO integration with role-based access control
- **Analytics**: Comprehensive engagement tracking and reporting
- **AI Transcription**: Automatic speech-to-text with multi-language support
- **Interactive Features**: Real-time chat, Q&A, polls, and quizzes
- **Mobile Responsive**: Works seamlessly across all devices

## Tech Stack

### Frontend
- Next.js 14+ (App Router)
- TypeScript 5.0+
- Tailwind CSS
- Shadcn/ui
- Video.js

### Backend
- Node.js 20 LTS
- NestJS 10+
- PostgreSQL 15+
- Redis 7+
- BullMQ

### Infrastructure
- AWS S3 for video storage
- CloudFront/Cloudflare CDN
- FFmpeg for video processing
- WebRTC for live streaming

## Project Structure

```
├── apps/
│   ├── backend/         # NestJS API server
│   └── frontend/        # Next.js application
├── packages/
│   ├── shared/          # Shared types and utilities
│   └── database/        # Database schemas and migrations
├── docs/                # Documentation
└── docker/              # Docker configurations
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- FFmpeg

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npm run migrate

# Start development servers
npm run dev
```

The frontend will be available at `http://localhost:3000` and the backend API at `http://localhost:4000`.

## Development

```bash
# Run both frontend and backend
npm run dev

# Run only backend
npm run dev:backend

# Run only frontend
npm run dev:frontend

# Build for production
npm run build

# Run tests
npm run test

# Lint code
npm run lint
```

## Environment Variables

See `.env.example` for required environment variables.

## Documentation

- [Product Requirements Document](./docs/PRD.md)
- [API Documentation](./docs/api.md)
- [Architecture Overview](./docs/architecture.md)
- [Deployment Guide](./docs/deployment.md)

## License

Proprietary - All rights reserved
