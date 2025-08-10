# 🚀 Deployment Guide - LeniLani AI Platform

## Last Updated: January 2025

### Recent Changes (January 2025)
- ✅ **Business Profile & Chatbot Integration**
  - Complete business profile management in settings
  - Chatbot automatically pulls from business profile data
  - Smart response system for common questions (check-in times, parking, WiFi)
  - Real-time preview showing how information will be used
  - Context-aware fallback responses with actual business contact info
- ✅ **Enhanced Navigation & User Experience**
  - Getting Started guide with direct links to relevant settings sections
  - URL hash routing for deep linking to specific settings tabs
  - Improved task-oriented checklist with time estimates
  - Best practices and pro tips for each subscription tier
- ✅ **Enhanced Subscription Management System**
  - Multi-step cancellation flow with retention offers (25-50% discounts)
  - Comprehensive upgrade/downgrade preview with 7+ feature categories
  - Unified upgrade experience across subscription and billing sections
  - Payment method management with default card selection
  - Complete billing history with downloadable invoices
  - Data export in JSON format before cancellation
  - 30-day grace period for downgrades with data protection
- ✅ **Improved Trial/Guarantee Structure**
  - Starter/Professional: 14-day free trial (no payment required)
  - Premium/Enterprise: 30-day money-back guarantee (manual refund)
  - Clear messaging in checkout flow based on selected plan
- ✅ **Better User Experience**
  - Exit/back navigation in checkout flow
  - Help section with contact information
  - Prorated billing calculations displayed
  - Data loss warnings for downgrades
  - Mobile-responsive design with hamburger menu
  - Fixed visual issues in AI config tabs
- ✅ **Integration Improvements**
  - PMS webhook for real-time booking data
  - Guest Intelligence included in Professional+ tiers
  - Revenue Optimization included in Professional+ tiers
  - HubSpot CRM contact deduplication
- ✅ **Comprehensive Testing**
  - 96.4% pass rate across all tier features
  - Customer journey fully tested (signup → cancel)
  - Mobile responsiveness verified
  - All tier restrictions properly enforced

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Deployment Options](#deployment-options)
  - [Vercel (Recommended)](#vercel-recommended)
  - [AWS EC2](#aws-ec2)
  - [Google Cloud Run](#google-cloud-run)
  - [Azure App Service](#azure-app-service)
  - [Self-Hosted](#self-hosted)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)

## Prerequisites

Before deploying, ensure you have:
- [ ] PostgreSQL database (production-ready)
- [ ] Claude API key from Anthropic (sk-ant-...)
- [ ] OpenAI API key (sk-...)
- [ ] HubSpot account for payments (optional)
- [ ] Twilio account for SMS (optional)
- [ ] WhatsApp Business API access (optional)
- [ ] Domain name configured
- [ ] SSL certificate
- [ ] SMTP credentials for email (optional)

## Environment Setup

### Required Environment Variables

Create a `.env.production` file with:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/lenilani_prod"

# Authentication
JWT_SECRET="<generate-secure-64-char-string>"
ADMIN_PASSWORD="<strong-admin-password>"

# AI Services
ANTHROPIC_API_KEY="sk-ant-api-xxx"  # For Claude models
OPENAI_API_KEY="sk-xxx"  # For GPT models

# Payment Processing
HUBSPOT_ACCESS_TOKEN="pat-xxx"
HUBSPOT_PORTAL_ID="xxx"
HUBSPOT_STARTER_LINK="https://app.hubspot.com/payments/xxx/starter"
HUBSPOT_PROFESSIONAL_LINK="https://app.hubspot.com/payments/xxx/professional"
HUBSPOT_PREMIUM_LINK="https://app.hubspot.com/payments/xxx/premium"

# Communication (Optional)
TWILIO_ACCOUNT_SID="ACxxx"
TWILIO_AUTH_TOKEN="xxx"
TWILIO_PHONE_NUMBER="+1234567890"
WHATSAPP_ACCESS_TOKEN="EAAxxx"
WHATSAPP_PHONE_NUMBER_ID="xxx"
WHATSAPP_BUSINESS_ACCOUNT_ID="xxx"

# Email (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Application
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NODE_ENV="production"

# Security
CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
RATE_LIMIT_ENABLED="true"
```

### Generate Secure Secrets

```bash
# Generate JWT Secret
openssl rand -base64 64

# Generate Admin Password
openssl rand -base64 32
```

## Deployment Options

### Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Connect to Vercel**
```bash
vercel login
```

3. **Configure Project**
```bash
vercel
```

4. **Set Environment Variables**
```bash
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
# Add all other environment variables
```

5. **Deploy**
```bash
vercel --prod
```

6. **Configure Domain**
```bash
vercel domains add yourdomain.com
```

### AWS EC2

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t3.medium or larger
   - 20GB+ storage

2. **SSH into Instance**
```bash
ssh -i your-key.pem ubuntu@your-instance-ip
```

3. **Install Dependencies**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install nginx
sudo apt install nginx -y

# Install PM2
sudo npm install -g pm2
```

4. **Clone Repository**
```bash
git clone https://github.com/rprovine/tourism-hospitality-chatbot.git
cd tourism-hospitality-chatbot
```

5. **Setup Application**
```bash
# Install dependencies
npm install

# Build application
npm run build

# Setup database
npx prisma generate
npx prisma db push

# Start with PM2
pm2 start npm --name "lenilani" -- start
pm2 save
pm2 startup
```

6. **Configure Nginx**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

7. **Setup SSL with Certbot**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Google Cloud Run

1. **Install Google Cloud SDK**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

2. **Create Dockerfile**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
```

3. **Build and Deploy**
```bash
# Build container
gcloud builds submit --tag gcr.io/PROJECT-ID/lenilani

# Deploy to Cloud Run
gcloud run deploy lenilani \
  --image gcr.io/PROJECT-ID/lenilani \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production"
```

### Azure App Service

1. **Install Azure CLI**
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
az login
```

2. **Create Resources**
```bash
# Create resource group
az group create --name lenilani-rg --location eastus

# Create App Service plan
az appservice plan create \
  --name lenilani-plan \
  --resource-group lenilani-rg \
  --sku B2 \
  --is-linux

# Create web app
az webapp create \
  --resource-group lenilani-rg \
  --plan lenilani-plan \
  --name lenilani-app \
  --runtime "NODE|18-lts"
```

3. **Deploy Application**
```bash
# Configure deployment
az webapp deployment source config-local-git \
  --name lenilani-app \
  --resource-group lenilani-rg

# Push to Azure
git remote add azure <deployment-url>
git push azure main
```

### Self-Hosted

1. **System Requirements**
   - Ubuntu 20.04+ or CentOS 8+
   - 4GB+ RAM
   - 2+ CPU cores
   - 20GB+ storage

2. **Install Docker**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

3. **Docker Compose Setup**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - postgres
    
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: lenilani
      POSTGRES_USER: lenilani
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app

volumes:
  postgres_data:
```

4. **Start Services**
```bash
docker-compose up -d
```

## Post-Deployment

### 1. Database Migration
```bash
npx prisma migrate deploy
```

### 2. Seed Initial Data
```bash
npx prisma db seed
```

### 3. Create Admin User
```bash
npm run create-admin
```

### 4. Configure Webhooks
- WhatsApp: `https://yourdomain.com/api/channels/whatsapp/webhook`
- Twilio SMS: `https://yourdomain.com/api/channels/sms/webhook`
- HubSpot: `https://yourdomain.com/api/payments/webhook`
- PMS Integration: `https://yourdomain.com/api/webhooks/pms`

### 5. Test Deployment
```bash
# Health check
curl https://yourdomain.com/api/health

# Test chat endpoint
curl -X POST https://yourdomain.com/api/v1/chat \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "sessionId": "test-123", "language": "en"}'

# Run customer journey tests
node scripts/test-customer-journey.js

# Run tier feature tests
node scripts/test-tier-features.js

# Verify tier restrictions
curl https://yourdomain.com/api/subscription/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Monitoring

### Setup Monitoring Tools

1. **Application Monitoring**
   - New Relic
   - DataDog
   - Sentry for error tracking

2. **Database Monitoring**
   - pgAdmin
   - PostgreSQL logs
   - Query performance insights

3. **Uptime Monitoring**
   - UptimeRobot
   - Pingdom
   - StatusCake

### Key Metrics to Monitor
- Response time (<2s target)
- Error rate (<1%)
- API usage by tier (real tracking)
- Conversation limits per tier
- Database connections
- Memory usage
- CPU utilization
- Customer satisfaction scores
- Conversation completion rates
- Knowledge base hit rate
- **Subscription Metrics**
  - Churn rate by tier
  - Retention offer acceptance rate (target >30%)
  - Upgrade/downgrade conversion rates
  - Cancellation reasons distribution
  - Trial-to-paid conversion (target >15%)
  - Money-back guarantee requests
- **Guest Intelligence Metrics**
  - Profile growth rate
  - VIP guest identification
  - Preference capture rate
- **Revenue Optimization Metrics**
  - Dynamic pricing effectiveness
  - Upsell conversion rate
  - Abandonment recovery rate

### Alerts to Configure
- High error rate (>5%)
- Slow response time (>5s)
- Database connection issues
- Rate limit violations
- Payment failures
- AI API failures

## Security Checklist

- [ ] SSL certificate installed
- [ ] Environment variables secured
- [ ] Database backups configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers enabled
- [ ] Admin access restricted
- [ ] API keys rotated regularly
- [ ] Audit logging enabled
- [ ] DDoS protection configured

## Backup Strategy

### Database Backups
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
rm backup_$DATE.sql
```

### Application Backups
- Git repository (primary)
- Docker images
- Configuration files
- Environment variables (encrypted)

## Scaling Considerations

### Horizontal Scaling
- Load balancer (nginx, HAProxy)
- Multiple app instances
- Redis for session storage
- CDN for static assets

### Vertical Scaling
- Increase server resources
- Database optimization
- Connection pooling
- Query optimization

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql $DATABASE_URL
```

2. **High Memory Usage**
```bash
# Check Node.js memory
pm2 monit

# Increase memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

3. **Slow Response Times**
```bash
# Check database queries
npx prisma studio

# Enable query logging
export DEBUG="prisma:query"
```

## New API Endpoints (January 2025)

### Subscription Management
- `GET /api/subscription` - Get current subscription details
- `POST /api/subscription/cancel` - Cancel subscription with reason
- `GET /api/export/data` - Export all business data (JSON)
- `GET /api/billing/history` - Get billing history with invoices
- `GET /api/billing/invoice/{id}` - Download specific invoice
- `POST /api/payments/checkout` - Create checkout session

### Customer Retention
- Retention offers automatically triggered during cancellation
- Tier-based discounts: Starter (50%), Professional (30%), Premium (25%)
- Multi-step cancellation with reason tracking

### Data Management
- `POST /api/widget/lead` - Lead capture from chat
- `POST /api/webhooks/pms` - PMS booking data webhook
- `GET /api/ai/usage` - Real API usage tracking

### Integration Webhooks
```bash
# PMS Integration Example
curl -X POST https://yourdomain.com/api/webhooks/pms \
  -H "Content-Type: application/json" \
  -d '{
    "event": "booking.created",
    "bookingId": "BK123",
    "guestEmail": "guest@email.com",
    "guestName": "John Doe",
    "checkIn": "2025-02-01",
    "checkOut": "2025-02-05",
    "amount": 500,
    "roomType": "Ocean View Suite"
  }'
```

## Support

For deployment assistance:
- Documentation: [docs.lenilani.ai](https://docs.lenilani.ai)
- Email: support@lenilani.com (updated from .ai)
- Enterprise: enterprise@lenilani.com

---

**Remember**: Always test in staging before deploying to production!