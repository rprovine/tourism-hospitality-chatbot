# Database Connection Fix for Vercel Deployment

## Issue
The database connection works locally but fails on Vercel with the error:
```
Can't reach database server at aws-0-us-west-1.pooler.supabase.com:5432
```

## Solution Steps

### Step 1: Update Vercel Environment Variables

Go to your Vercel project settings:
https://vercel.com/rprovines-projects/tourism-hospitality-chatbot/settings/environment-variables

Update the `DATABASE_URL` with one of these options:

#### Option A: Pooler with pgbouncer flag (Recommended)
```
postgresql://postgres.hoybtqhautslrjxrlffs:Chi3ft%40n5527@aws-0-us-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1
```

#### Option B: Try port 6543 (Supabase pooler port)
```
postgresql://postgres.hoybtqhautslrjxrlffs:Chi3ft%40n5527@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

### Step 2: Redeploy

After updating the environment variable:
1. Go to the Deployments tab
2. Click on the three dots next to the latest deployment
3. Select "Redeploy"

### Step 3: Test the Connection

Visit: https://tourism-hospitality-chatbot.vercel.app/api/test-db

This will show which connection method works.

### Step 4: Verify Login

Once the database is connected, test login:
- Go to: https://tourism-hospitality-chatbot.vercel.app/test.html
- Use the test accounts:
  - premium@demo.com / demo123
  - professional@demo.com / demo123
  - starter@demo.com / demo123

## Alternative: Prisma Data Proxy

If the above doesn't work, you may need to use Prisma Data Proxy:

1. Go to https://cloud.prisma.io/
2. Create a new project
3. Add your Supabase database
4. Get the Data Proxy connection string
5. Update DATABASE_URL in Vercel with the Data Proxy URL

## Debugging

Test endpoints:
- `/api/test-db` - Tests different connection methods
- `/api/health` - Health check with database status
- `/test.html` - Manual API testing page