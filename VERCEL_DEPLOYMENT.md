# 🚀 Vercel + Supabase Deployment Guide

## Your Setup Information

- **Supabase Connection String**: `postgresql://postgres:[YOUR-PASSWORD]@db.hoybtqhautslrjxrlffs.supabase.co:5432/postgres`
- **Database**: Supabase (PostgreSQL)
- **Platform**: Vercel

## 📋 Pre-Deployment Checklist

### 1. Update Local Environment Variables
Edit `.env.local` and replace placeholders:
```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.hoybtqhautslrjxrlffs.supabase.co:5432/postgres"
ANTHROPIC_API_KEY="your-actual-anthropic-api-key"
```

### 2. Run Database Setup
```bash
./setup-database.sh
```
This will:
- Install dependencies
- Generate Prisma client
- Push schema to Supabase
- Optionally create a demo account

## 🔧 Vercel Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Import to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository

### Step 3: Configure Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `postgresql://postgres:[YOUR-PASSWORD]@db.hoybtqhautslrjxrlffs.supabase.co:5432/postgres` | Your Supabase connection |
| `JWT_SECRET` | (copy from .env.local) | For authentication |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Your Claude API key |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Your Vercel URL (after first deploy) |

### Optional Email Variables (if using email):
| Variable | Value |
|----------|-------|
| `SENDGRID_API_KEY` | Your SendGrid key |
| `EMAIL_FROM` | `noreply@yourdomain.com` |
| `EMAIL_FROM_NAME` | `LeniLani AI` |

### Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Note your deployment URL

### Step 5: Update NEXT_PUBLIC_APP_URL
After first deployment:
1. Go back to Environment Variables
2. Update `NEXT_PUBLIC_APP_URL` with your actual Vercel URL
3. Redeploy for changes to take effect

## 🧪 Test Your Deployment

### 1. Check Database Connection
Visit: `https://your-app.vercel.app/api/health`

### 2. Create Test Account
1. Go to `https://your-app.vercel.app/register`
2. Sign up with a test account
3. Verify you can log in

### 3. Test Chatbot
1. Log in to admin panel
2. Add knowledge base entries
3. Test the chat widget

## 🐛 Troubleshooting

### "Database connection failed"
- Verify DATABASE_URL has correct password
- Check Supabase is accepting connections
- Ensure connection string includes `?pgbouncer=true` if needed

### "Prisma Client error"
Run locally:
```bash
npx prisma generate
git add .
git commit -m "Update Prisma client"
git push
```

### "API routes not working"
- Check ANTHROPIC_API_KEY is valid
- Verify JWT_SECRET is set
- Check Vercel Function logs

### "Build failed"
Check build logs for specific errors. Common issues:
- Missing environment variables
- TypeScript errors
- Module resolution issues

## 📊 Production Optimizations

### Enable Vercel Analytics
```bash
npm install @vercel/analytics
```

Update `app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react'

// In your layout, add before closing </body>:
<Analytics />
```

### Database Connection Pooling
Update DATABASE_URL in Vercel:
```
postgresql://postgres:[PASSWORD]@db.hoybtqhautslrjxrlffs.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
```

### Custom Domain
1. Go to Vercel Dashboard → Settings → Domains
2. Add your domain
3. Update DNS records as instructed

## 🔐 Security Reminders

- [ ] Never commit .env.local to Git
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Keep API keys secure
- [ ] Enable Vercel's DDoS protection
- [ ] Set up monitoring alerts

## 📞 Need Help?

- **Vercel Issues**: Check [Vercel docs](https://vercel.com/docs)
- **Supabase Issues**: Check [Supabase docs](https://supabase.com/docs)
- **Prisma Issues**: Check [Prisma docs](https://www.prisma.io/docs)

## 🎉 Success Checklist

- [ ] App deployed successfully
- [ ] Can register/login
- [ ] Database connected
- [ ] Chat widget working
- [ ] Knowledge base functional
- [ ] Email notifications working (if configured)

---

**Your Deployment URL**: `https://[your-project-name].vercel.app`

Remember to update this after deployment!