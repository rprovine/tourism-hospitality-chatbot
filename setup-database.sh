#!/bin/bash

echo "🚀 Tourism & Hospitality Chatbot - Database Setup"
echo "================================================="
echo ""
echo "⚠️  IMPORTANT: Before proceeding, please ensure:"
echo "1. You've updated the DATABASE_URL in .env.local with your Supabase password"
echo "2. You've added your ANTHROPIC_API_KEY to .env.local"
echo ""
read -p "Have you updated these values? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Please update .env.local with your credentials first, then run this script again."
    exit 1
fi

echo ""
echo "📦 Step 1: Installing dependencies..."
npm install

echo ""
echo "🔧 Step 2: Generating Prisma Client..."
npx prisma generate

echo ""
echo "📊 Step 3: Pushing schema to Supabase..."
npx prisma db push --accept-data-loss

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Optional: Create a demo account? (y/n): "
read -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
    node scripts/setup-supabase.js
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps for Vercel deployment:"
echo "1. Push your code to GitHub"
echo "2. Import repository on vercel.com"
echo "3. Add these environment variables in Vercel:"
echo "   - DATABASE_URL (your Supabase connection string)"
echo "   - JWT_SECRET (copy from .env.local)"
echo "   - ANTHROPIC_API_KEY (your Claude API key)"
echo "   - NEXT_PUBLIC_APP_URL (your Vercel URL)"
echo ""
echo "To start locally: npm run dev"