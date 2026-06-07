# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- pnpm package manager
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- Git configured
- AWS S3 credentials (for storage)

## Environment Setup

### 1. Create `.env.local` file

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/social_chat

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# S3 Storage
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1

# Server
PORT=3000
NODE_ENV=production
API_URL=https://your-api-domain.com
```

## Building APK (Android)

### Option 1: Using EAS Build (Recommended)

```bash
# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build APK
eas build --platform android --type apk

# Download APK
# The APK will be available at the provided URL
```

### Option 2: Local Build

```bash
# Install dependencies
pnpm install

# Build APK locally
expo build:android -t apk

# This requires Android SDK and build tools installed
```

## Building IPA (iOS)

```bash
# Build IPA
eas build --platform ios

# Download IPA
# The IPA will be available at the provided URL
```

## Web Deployment

### Deploy to Cloud Run

```bash
# Build the app
pnpm run build

# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
EOF

# Build Docker image
docker build -t social-chat-app .

# Push to Google Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/social-chat-app

# Deploy to Cloud Run
gcloud run deploy social-chat-app \
  --image gcr.io/PROJECT_ID/social-chat-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts
```

## Database Migration

### Run Migrations

```bash
# Generate migrations
pnpm run db:push

# Migrate database
pnpm run db:migrate
```

### Seed Database (Optional)

```bash
# Create seed script in scripts/seed.ts
pnpm run db:seed
```

## Post-Deployment Checklist

- [ ] Verify environment variables are set
- [ ] Run database migrations
- [ ] Test authentication flow
- [ ] Verify S3 storage connectivity
- [ ] Test messaging system
- [ ] Test calls functionality
- [ ] Monitor error logs
- [ ] Set up monitoring and alerts
- [ ] Configure CDN (if applicable)
- [ ] Enable HTTPS/SSL
- [ ] Set up backup strategy
- [ ] Configure rate limiting
- [ ] Test admin dashboard
- [ ] Verify push notifications
- [ ] Test cross-platform compatibility

## Monitoring & Logging

### Set Up Monitoring

```bash
# View logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=social-chat-app" --limit 50

# Set up alerts
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="Social Chat App Errors"
```

### Error Tracking

- Integrate Sentry for error tracking
- Set up log aggregation (Stackdriver, DataDog)
- Configure performance monitoring

## Scaling

### Horizontal Scaling

```bash
# Increase Cloud Run instances
gcloud run services update social-chat-app \
  --max-instances 100 \
  --min-instances 5
```

### Database Scaling

- Use read replicas for high traffic
- Implement connection pooling
- Optimize queries and add indexes
- Consider sharding for very large datasets

## Backup & Recovery

### Database Backup

```bash
# Backup PostgreSQL
pg_dump -h localhost -U user -d social_chat > backup.sql

# Restore from backup
psql -h localhost -U user -d social_chat < backup.sql
```

### S3 Backup

```bash
# Enable S3 versioning
aws s3api put-bucket-versioning \
  --bucket your-bucket \
  --versioning-configuration Status=Enabled

# Enable S3 replication for disaster recovery
```

## Security Hardening

### SSL/TLS

```bash
# Use Let's Encrypt for free SSL
certbot certonly --standalone -d your-domain.com
```

### Firewall Rules

```bash
# Restrict access to database
gcloud compute firewall-rules create restrict-db \
  --allow=tcp:5432 \
  --source-ranges=CLOUD_RUN_IP
```

### API Rate Limiting

- Implement rate limiting per user
- Set up DDoS protection
- Use API keys for third-party access

## Troubleshooting

### Common Issues

**APK Build Fails**
- Clear cache: `expo build:android --clear`
- Check Java version: `java -version`
- Verify Android SDK: `echo $ANDROID_HOME`

**Database Connection Error**
- Verify DATABASE_URL format
- Check network connectivity
- Ensure database is running

**S3 Upload Fails**
- Verify AWS credentials
- Check S3 bucket permissions
- Ensure bucket exists in correct region

**Socket.io Connection Issues**
- Check firewall rules
- Verify WebSocket support
- Enable CORS for your domain

## Performance Optimization

### Frontend

- Enable code splitting
- Implement lazy loading
- Optimize images
- Minify CSS/JS
- Use CDN for static assets

### Backend

- Add database indexes
- Implement caching (Redis)
- Use connection pooling
- Optimize queries
- Enable gzip compression

### Monitoring

```bash
# Monitor performance
gcloud monitoring dashboards create \
  --config-from-file=dashboard.yaml
```

## Rollback Procedure

```bash
# If deployment fails, rollback to previous version
gcloud run deploy social-chat-app \
  --image gcr.io/PROJECT_ID/social-chat-app:PREVIOUS_TAG \
  --platform managed \
  --region us-central1
```

## Support

For deployment issues, check:
- Expo documentation: https://docs.expo.dev
- Cloud Run documentation: https://cloud.google.com/run/docs
- PostgreSQL documentation: https://www.postgresql.org/docs
- Socket.io documentation: https://socket.io/docs
