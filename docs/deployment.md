# Deployment Guide

## Prerequisites

- Node.js 20+ installed
- PostgreSQL 15+ running
- Redis 7+ running
- AWS account (for S3, CloudFront)
- Docker and Docker Compose (for containerized deployment)

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd corporate_video_streaming

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

Required environment variables:
- Database credentials
- Redis connection
- JWT secret
- AWS credentials
- API URLs

### 3. Database Setup

```bash
# Start PostgreSQL (if using Docker)
docker-compose up -d postgres

# Run migrations
cd apps/backend
npm run migrate
```

### 4. Start Development Servers

```bash
# Terminal 1: Start backend
npm run dev:backend

# Terminal 2: Start frontend
npm run dev:frontend

# Or run both together
npm run dev
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Documentation: http://localhost:4000/api/docs

## Docker Deployment

### Development with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

### Production Docker Deployment

```bash
# Build production images
docker build -t video-platform-backend:latest -f apps/backend/Dockerfile .
docker build -t video-platform-frontend:latest -f apps/frontend/Dockerfile .

# Run containers
docker run -d \
  --name video-backend \
  -p 4000:4000 \
  -e DATABASE_URL=<url> \
  video-platform-backend:latest

docker run -d \
  --name video-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=<url> \
  video-platform-frontend:latest
```

## AWS Deployment

### 1. S3 Bucket Setup

```bash
# Create S3 bucket for video storage
aws s3 mb s3://corporate-video-streaming

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket corporate-video-streaming \
  --versioning-configuration Status=Enabled

# Configure CORS
aws s3api put-bucket-cors \
  --bucket corporate-video-streaming \
  --cors-configuration file://cors.json
```

### 2. CloudFront CDN Setup

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

### 3. RDS Database Setup

```bash
# Create PostgreSQL RDS instance
aws rds create-db-instance \
  --db-instance-identifier video-platform-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.4 \
  --master-username admin \
  --master-user-password <password> \
  --allocated-storage 100
```

### 4. ElastiCache for Redis

```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id video-platform-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

### 5. ECS/Fargate Deployment

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name video-platform

# Create task definition
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster video-platform \
  --service-name backend \
  --task-definition video-backend \
  --desired-count 2 \
  --launch-type FARGATE
```

## Kubernetes Deployment

### 1. Create Kubernetes Manifests

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: video-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: video-backend
  template:
    metadata:
      labels:
        app: video-backend
    spec:
      containers:
      - name: backend
        image: video-platform-backend:latest
        ports:
        - containerPort: 4000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: video-secrets
              key: database-url
```

### 2. Deploy to Kubernetes

```bash
# Apply configurations
kubectl apply -f k8s/

# Check deployment status
kubectl get pods
kubectl get services

# Scale deployment
kubectl scale deployment video-backend --replicas=5

# Update deployment
kubectl set image deployment/video-backend \
  backend=video-platform-backend:v1.1.0
```

## Vercel Deployment (Frontend)

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Deploy to Vercel

```bash
cd apps/frontend
vercel

# Production deployment
vercel --prod
```

### 3. Configure Environment Variables

```bash
# Add environment variables in Vercel dashboard
NEXT_PUBLIC_API_URL=https://api.yourcompany.com
NEXT_PUBLIC_WS_URL=wss://api.yourcompany.com
```

## Database Migrations

### Running Migrations

```bash
cd apps/backend
npm run migrate
```

### Creating New Migrations

```bash
# Generate migration
npm run migration:generate -- -n MigrationName

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

## Monitoring Setup

### 1. Sentry for Error Tracking

```bash
# Install Sentry
npm install @sentry/node @sentry/nextjs

# Configure in code
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 2. Datadog APM

```bash
# Install Datadog agent
DD_API_KEY=<key> DD_SITE="datadoghq.com" bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script.sh)"

# Install Node.js tracer
npm install dd-trace
```

### 3. CloudWatch Logging

```bash
# Configure CloudWatch logs
aws logs create-log-group --log-group-name /video-platform/backend
aws logs create-log-stream --log-group-name /video-platform/backend --log-stream-name app
```

## SSL/TLS Configuration

### Let's Encrypt with Nginx

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourcompany.com -d www.yourcompany.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Backup Strategy

### Database Backups

```bash
# Automated daily backups
aws rds create-db-snapshot \
  --db-instance-identifier video-platform-db \
  --db-snapshot-identifier backup-$(date +%Y%m%d)

# Restore from backup
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier video-platform-db-restored \
  --db-snapshot-identifier backup-20240101
```

### S3 Backups

```bash
# Enable S3 versioning (already done in setup)
# Configure lifecycle policies for old versions
aws s3api put-bucket-lifecycle-configuration \
  --bucket corporate-video-streaming \
  --lifecycle-configuration file://lifecycle.json
```

## Performance Optimization

### CDN Cache Configuration

```javascript
// CloudFront cache behaviors
{
  "PathPattern": "*.m3u8",
  "MinTTL": 0,
  "DefaultTTL": 5,
  "MaxTTL": 30
}
```

### Database Optimization

```sql
-- Create indexes for frequently queried fields
CREATE INDEX idx_videos_org_status ON videos(org_id, status);
CREATE INDEX idx_analytics_video_user ON video_analytics(video_id, user_id);
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);
```

## Troubleshooting

### Common Issues

1. **Video upload fails**
   - Check S3 bucket permissions
   - Verify presigned URL expiration
   - Check file size limits

2. **Database connection errors**
   - Verify DATABASE_URL is correct
   - Check database is running
   - Verify network connectivity

3. **WebSocket connection fails**
   - Check CORS configuration
   - Verify WS_URL is correct
   - Check firewall rules

### Logs

```bash
# View application logs
docker-compose logs -f backend

# View database logs
docker-compose logs -f postgres

# View Kubernetes logs
kubectl logs -f deployment/video-backend
```

## Security Checklist

- [ ] Change default passwords
- [ ] Enable SSL/TLS
- [ ] Configure firewall rules
- [ ] Set up rate limiting
- [ ] Enable audit logging
- [ ] Configure backup strategy
- [ ] Set up monitoring and alerts
- [ ] Review IAM permissions
- [ ] Enable MFA for admin accounts
- [ ] Implement DDoS protection
