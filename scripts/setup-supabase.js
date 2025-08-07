#!/usr/bin/env node

/**
 * Supabase Setup Script
 * Run this after setting DATABASE_URL to initialize your Supabase database
 */

const { execSync } = require('child_process')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function main() {
  console.log('🚀 Supabase + Vercel Setup Script')
  console.log('==================================\n')

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL not found!')
    console.log('\n📝 Please add your Supabase connection string to .env.local:')
    console.log('DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"\n')
    
    const url = await question('Paste your Supabase DATABASE_URL here: ')
    if (url) {
      require('fs').writeFileSync('.env.local', `DATABASE_URL="${url}"\n`, { flag: 'a' })
      process.env.DATABASE_URL = url
      console.log('✅ DATABASE_URL saved to .env.local\n')
    } else {
      console.log('❌ No URL provided. Exiting...')
      process.exit(1)
    }
  }

  try {
    console.log('📦 Step 1: Installing dependencies...')
    execSync('npm install', { stdio: 'inherit' })

    console.log('\n🔄 Step 2: Generating Prisma Client...')
    execSync('npx prisma generate', { stdio: 'inherit' })

    console.log('\n📊 Step 3: Pushing schema to Supabase...')
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' })

    console.log('\n✅ Database setup complete!')

    // Ask about creating demo account
    const createDemo = await question('\n📝 Would you like to create a demo account? (y/n): ')
    
    if (createDemo.toLowerCase() === 'y') {
      console.log('\n👤 Creating demo account...')
      
      const { PrismaClient } = require('@prisma/client')
      const bcrypt = require('bcrypt')
      const prisma = new PrismaClient()

      try {
        const hashedPassword = await bcrypt.hash('demo123', 10)
        
        const business = await prisma.business.create({
          data: {
            email: 'demo@lenilani.com',
            password: hashedPassword,
            name: 'Demo Resort Hawaii',
            type: 'hotel',
            tier: 'professional',
            welcomeMessage: 'Aloha! Welcome to Demo Resort Hawaii. How can I assist you today?',
            businessInfo: {
              phone: '808-555-0100',
              address: '123 Beach Road, Honolulu, HI',
              hours: 'Check-in: 3PM, Check-out: 11AM'
            }
          }
        })

        // Create subscription
        const startDate = new Date()
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 1)

        await prisma.subscription.create({
          data: {
            businessId: business.id,
            tier: 'professional',
            status: 'active',
            billingCycle: 'monthly',
            startDate: startDate,
            endDate: endDate
          }
        })

        // Add sample knowledge base
        const sampleQAs = [
          { 
            question: 'What time is check-in?', 
            answer: 'Check-in time is at 3:00 PM. Early check-in may be available upon request.',
            category: 'general'
          },
          { 
            question: 'Do you have free WiFi?', 
            answer: 'Yes, we offer complimentary high-speed WiFi throughout the resort.',
            category: 'amenities'
          },
          { 
            question: 'Is parking available?', 
            answer: 'Yes, we offer both valet ($45/night) and self-parking ($35/night) options.',
            category: 'amenities'
          },
          { 
            question: 'How far are you from the beach?', 
            answer: 'We are beachfront! Our resort has direct access to a private beach area.',
            category: 'location'
          },
          { 
            question: 'Do you have a pool?', 
            answer: 'Yes, we have three pools including an infinity pool, adults-only pool, and family pool with waterslide.',
            category: 'amenities'
          }
        ]

        for (const qa of sampleQAs) {
          await prisma.knowledgeBase.create({
            data: {
              businessId: business.id,
              question: qa.question,
              answer: qa.answer,
              category: qa.category,
              keywords: qa.question.toLowerCase().replace(/[?.,]/g, ''),
              language: 'en',
              priority: 1
            }
          })
        }

        console.log('\n✅ Demo account created!')
        console.log('📧 Email: demo@lenilani.com')
        console.log('🔐 Password: demo123')
        console.log('🎯 Tier: Professional\n')

      } catch (error) {
        console.error('Error creating demo account:', error)
      } finally {
        await prisma.$disconnect()
      }
    }

    console.log('\n🎉 Setup Complete!')
    console.log('================\n')
    console.log('Next steps:')
    console.log('1. Go to vercel.com and import your GitHub repo')
    console.log('2. Add these environment variables in Vercel:')
    console.log('   - DATABASE_URL (your Supabase connection string)')
    console.log('   - JWT_SECRET (generate a 32+ character string)')
    console.log('   - ANTHROPIC_API_KEY (your Claude API key)')
    console.log('   - NEXT_PUBLIC_APP_URL (your Vercel URL)')
    console.log('3. Deploy!\n')

  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }

  rl.close()
}

main().catch(console.error)