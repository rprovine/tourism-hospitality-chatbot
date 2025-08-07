#!/usr/bin/env node

/**
 * Create Test Accounts in Production (Supabase)
 * Run this locally to create accounts in your production database
 */

require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const bcryptjs = require('bcryptjs')

// Use the production database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function createProductionAccounts() {
  console.log('🚀 Creating Test Accounts in Production Database')
  console.log('================================================\n')
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env.local')
    console.error('Please ensure .env.local contains your Supabase connection string')
    process.exit(1)
  }

  console.log('📊 Connecting to database...')
  
  try {
    // Test connection
    await prisma.$connect()
    console.log('✅ Connected to database\n')
  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message)
    console.error('Please check your DATABASE_URL in .env.local')
    process.exit(1)
  }

  const testAccounts = [
    {
      email: 'starter@demo.com',
      password: 'demo123',
      name: 'Starter Hotel Demo',
      type: 'hotel',
      tier: 'starter',
      welcomeMessage: 'Aloha! Welcome to Starter Hotel. How can I help you today?',
      businessInfo: {
        phone: '808-555-0101',
        address: '100 Starter Beach Road, Honolulu, HI',
        hours: 'Check-in: 3PM, Check-out: 11AM'
      }
    },
    {
      email: 'professional@demo.com',
      password: 'demo123',
      name: 'Professional Resort Demo',
      type: 'hotel',
      tier: 'professional',
      welcomeMessage: 'Aloha! Welcome to Professional Resort. How may I assist you with your stay?',
      businessInfo: {
        phone: '808-555-0102',
        address: '200 Professional Bay Drive, Maui, HI',
        hours: 'Check-in: 3PM, Check-out: 11AM'
      }
    },
    {
      email: 'premium@demo.com',
      password: 'demo123',
      name: 'Premium Paradise Resort',
      type: 'hotel',
      tier: 'premium',
      welcomeMessage: 'Aloha and welcome to Premium Paradise Resort! Our AI concierge is here to make your stay exceptional.',
      businessInfo: {
        phone: '808-555-0103',
        address: '300 Premium Paradise Lane, Kauai, HI',
        hours: '24/7 Concierge Service'
      }
    }
  ]

  const createdAccounts = []
  let errors = []

  for (const account of testAccounts) {
    try {
      console.log(`\n📝 Processing ${account.tier} account...`)
      
      // Check if account already exists
      const existing = await prisma.business.findUnique({
        where: { email: account.email }
      })

      if (existing) {
        console.log(`⚠️  Account ${account.email} already exists - updating password...`)
        
        // Update the password to ensure it's correct
        const hashedPassword = await bcryptjs.hash(account.password, 10)
        
        await prisma.business.update({
          where: { email: account.email },
          data: { 
            password: hashedPassword,
            tier: account.tier,
            subscriptionStatus: 'active'
          }
        })
        
        console.log(`✅ Updated ${account.email}`)
        createdAccounts.push({
          email: account.email,
          password: account.password,
          tier: account.tier,
          status: 'updated'
        })
        continue
      }

      // Hash password
      console.log('  Hashing password...')
      const hashedPassword = await bcryptjs.hash(account.password, 10)

      // Create business account
      console.log('  Creating business account...')
      const business = await prisma.business.create({
        data: {
          email: account.email,
          password: hashedPassword,
          name: account.name,
          type: account.type,
          tier: account.tier,
          welcomeMessage: account.welcomeMessage,
          businessInfo: account.businessInfo,
          subscriptionStatus: 'active'
        }
      })

      // Create subscription
      console.log('  Creating subscription...')
      const startDate = new Date()
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 1)

      await prisma.subscription.create({
        data: {
          businessId: business.id,
          tier: account.tier,
          status: 'active',
          billingCycle: 'monthly',
          startDate: startDate,
          endDate: endDate,
          paymentMethod: 'demo',
          paymentStatus: 'paid'
        }
      })

      // Add minimal knowledge base entries
      console.log('  Adding knowledge base entries...')
      const basicQAs = [
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
          answer: 'Yes, we offer both valet and self-parking options.',
          category: 'amenities'
        }
      ]

      for (const qa of basicQAs) {
        await prisma.knowledgeBase.create({
          data: {
            businessId: business.id,
            question: qa.question,
            answer: qa.answer,
            category: qa.category,
            keywords: qa.question.toLowerCase().replace(/[?.,]/g, ''),
            language: 'en',
            priority: 1,
            isActive: true
          }
        })
      }

      createdAccounts.push({
        email: account.email,
        password: account.password,
        tier: account.tier,
        status: 'created'
      })

      console.log(`✅ Created ${account.tier} account: ${account.email}`)
    } catch (error) {
      console.error(`❌ Error with ${account.email}:`, error.message)
      errors.push({ email: account.email, error: error.message })
    }
  }

  console.log('\n=====================================')
  console.log('📊 Summary:')
  console.log('=====================================\n')
  
  if (createdAccounts.length > 0) {
    console.log('✅ Successfully processed accounts:\n')
    createdAccounts.forEach(acc => {
      console.log(`${acc.tier.toUpperCase()} (${acc.status}):`)
      console.log(`  Email: ${acc.email}`)
      console.log(`  Password: ${acc.password}`)
      console.log('')
    })
  }

  if (errors.length > 0) {
    console.log('\n❌ Errors encountered:')
    errors.forEach(err => {
      console.log(`  ${err.email}: ${err.error}`)
    })
  }

  console.log('\n🎯 You can now login at your Vercel URL!')
  console.log('=====================================\n')
}

createProductionAccounts()
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })