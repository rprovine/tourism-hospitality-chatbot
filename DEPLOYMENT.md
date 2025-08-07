# Deployment Guide

## 🚀 Production Deployment with Vercel

### Prerequisites
- Vercel account (free tier works)
- GitHub repository connected
- Environment variables ready

### Step 1: Deploy to Vercel

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Or use Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure project settings

### Step 2: Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```env
# Required
DATABASE_URL="your-production-database-url"
JWT_SECRET="generate-secure-random-string"
ANTHROPIC_API_KEY="your-claude-api-key"

# HubSpot Integration
HUBSPOT_ACCESS_TOKEN="your-private-app-token"
HUBSPOT_PORTAL_ID="your-portal-id"
HUBSPOT_PAYMENT_LINK_ID="your-payment-link-id"
HUBSPOT_WEBHOOK_SECRET="your-webhook-secret"

# Optional
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

### Step 3: Database Setup

#### Option A: Vercel Postgres (Recommended)
1. Add Vercel Postgres from the Vercel Dashboard
2. Update `DATABASE_URL` with the connection string
3. Update schema.prisma provider to `postgresql`

#### Option B: External Database
1. Use any PostgreSQL provider (Supabase, Neon, Railway)
2. Update connection string
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Step 4: Configure HubSpot

1. **Create Private App in HubSpot**
   - Go to Settings → Integrations → Private Apps
   - Create new app with these scopes:
     - `crm.objects.contacts.read/write`
     - `crm.objects.deals.read/write`
     - `payments`

2. **Set Up Payment Links**
   - Enable HubSpot Payments
   - Create payment links for each tier
   - Note the payment link IDs

3. **Configure Webhooks**
   - Add webhook URL: `https://your-domain.com/api/payments/webhook`
   - Subscribe to payment events

### Step 5: Post-Deployment

1. **Initialize Database**
   ```bash
   npx prisma db push --accept-data-loss
   ```

2. **Test Widget Installation**
   - Login to admin dashboard
   - Go to Widget Installation
   - Test on a staging site first

3. **Configure DNS (if custom domain)**
   - Add CNAME record pointing to Vercel
   - Configure SSL in Vercel Dashboard

## 🐳 Docker Deployment

### Build and Run

```dockerfile
# Dockerfile
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
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build
docker build -t lenilani-chatbot .

# Run
docker run -p 3000:3000 --env-file .env lenilani-chatbot
```

## 🔧 Production Checklist

### Security
- [ ] Change all default passwords
- [ ] Enable rate limiting
- [ ] Set up CORS properly
- [ ] Use HTTPS only
- [ ] Rotate JWT secrets regularly
- [ ] Enable CSP headers

### Performance
- [ ] Enable caching (Redis recommended)
- [ ] Set up CDN for static assets
- [ ] Optimize images
- [ ] Enable compression
- [ ] Use production builds

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Enable application logs
- [ ] Set up alerts for critical issues

### Backup
- [ ] Database backup strategy
- [ ] Conversation history archival
- [ ] Knowledge base exports

## 📊 Scaling Considerations

### High Traffic
- Use Vercel Edge Functions for chat API
- Implement Redis for session management
- Consider WebSocket server for real-time

### Multi-Region
- Deploy to multiple Vercel regions
- Use edge database replication
- Implement geo-routing

### Enterprise
- Set up VPC for database
- Implement SSO/SAML
- Add audit logging
- Configure data retention policies

## 🆘 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Test connection
npx prisma db pull
```

**Build Fails**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**Widget Not Appearing**
- Check CORS settings
- Verify domain whitelist
- Clear browser cache

**Payment Integration Issues**
- Verify HubSpot API credentials
- Check webhook signatures
- Review payment link configuration

## 📞 Support

For deployment assistance:
- GitHub Issues: [github.com/rprovine/tourism-hospitality-chatbot/issues](https://github.com/rprovine/tourism-hospitality-chatbot/issues)
- Documentation: [docs.lenilani.com](https://docs.lenilani.com)
- Email: support@lenilani.com

## 🎉 Launch Checklist

- [ ] All environment variables set
- [ ] Database migrated and seeded
- [ ] Payment integration tested
- [ ] Widget installation verified
- [ ] Admin accounts created
- [ ] Knowledge base populated
- [ ] Analytics tracking enabled
- [ ] Backup system configured
- [ ] Monitoring alerts set up
- [ ] Documentation reviewed

**Congratulations! Your AI chatbot platform is ready for launch! 🚀**