# 🚀 Vercel Deployment Guide

## ⚠️ Important: Database Setup Required

This app uses SQLite locally but **requires PostgreSQL for Vercel deployment**.

## Step-by-Step Deployment

### 1. Database Setup (Choose One)

#### Option A: Vercel Postgres (Recommended)
```bash
# In Vercel Dashboard:
1. Go to your project
2. Click "Storage" tab
3. Create Database → Postgres
4. Copy the DATABASE_URL
```

#### Option B: Supabase (Free)
```bash
1. Go to supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy the connection string
```

#### Option C: Neon (Free)
```bash
1. Go to neon.tech
2. Create database
3. Copy the connection string
```

### 2. Update Prisma Schema

```bash
# Replace schema.prisma with PostgreSQL version
cp prisma/schema.postgresql.prisma prisma/schema.prisma
```

### 3. Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

```env
# Required
DATABASE_URL="postgresql://..." # Your PostgreSQL URL
JWT_SECRET="minimum-32-character-random-string-here"
ANTHROPIC_API_KEY="sk-ant-..."

# Email (Choose one)
SENDGRID_API_KEY="SG...."
# OR
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your@email.com"
SMTP_PASS="app-password"

# Application
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_FROM_NAME="LeniLani AI"

# Optional
HUBSPOT_API_KEY="..."
HUBSPOT_PORTAL_ID="..."
```

### 4. Deploy to Vercel

#### Via GitHub (Recommended)
```bash
1. Push code to GitHub
2. Go to vercel.com
3. Import GitHub repository
4. Add environment variables
5. Deploy
```

#### Via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts and add env vars
```

### 5. Post-Deployment Setup

```bash
# Initialize database schema
vercel env pull .env.local
npx prisma db push --accept-data-loss
npx prisma generate

# Create admin account (optional)
node scripts/create-admin.js
```

## 🔧 Troubleshooting

### "Database connection failed"
- Check DATABASE_URL is set correctly
- Ensure PostgreSQL, not SQLite URL
- Check database is accessible

### "Prisma Client error"
```bash
# Rebuild Prisma Client
npx prisma generate
vercel --prod --force
```

### "Build failed"
- Check all required env vars are set
- Check logs in Vercel dashboard
- Ensure package.json has correct build script

### "API routes not working"
- Check environment variables
- Verify API keys are valid
- Check Vercel Functions logs

## 📊 Database Migration

### From SQLite to PostgreSQL

1. Export SQLite data:
```bash
# Local machine
npx prisma db pull
npx prisma studio # Export data manually
```

2. Update schema:
```bash
cp prisma/schema.postgresql.prisma prisma/schema.prisma
```

3. Push to PostgreSQL:
```bash
npx prisma db push
```

4. Import data:
```bash
# Use Prisma Studio or custom script
npx prisma studio
```

## 🚦 Performance Optimization

### Edge Functions (Optional)
```javascript
// next.config.js
module.exports = {
  experimental: {
    runtime: 'edge',
  },
}
```

### Image Optimization
```javascript
// Use next/image for all images
import Image from 'next/image'
```

### Database Connection Pooling
```env
# Add to DATABASE_URL
DATABASE_URL="...?pgbouncer=true&connection_limit=1"
```

## 📈 Monitoring

### Vercel Analytics
```bash
npm install @vercel/analytics
```

```javascript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Error Tracking (Sentry)
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

## 🔐 Security Checklist

- [ ] All env vars set in Vercel (not in code)
- [ ] JWT_SECRET is strong (32+ chars)
- [ ] Database URL uses SSL
- [ ] API keys are production keys
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Error messages don't leak info

## 🎯 Production Checklist

- [ ] Database migrated to PostgreSQL
- [ ] All environment variables set
- [ ] Email service configured
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Analytics enabled
- [ ] Error tracking enabled
- [ ] Backup strategy in place
- [ ] Monitoring alerts configured

## 📞 Support

If you encounter issues:
1. Check Vercel Function logs
2. Review environment variables
3. Check database connection
4. Contact support@lenilani.com

---

Last Updated: December 2024