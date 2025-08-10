#!/usr/bin/env node

/**
 * Create Test Accounts for Each Tier
 * Run this script to create demo accounts for testing
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestAccounts() {
  console.log('🚀 Creating Test Accounts for All Tiers')
  console.log('=====================================\n')

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

  for (const account of testAccounts) {
    try {
      // Check if account already exists
      const existing = await prisma.business.findUnique({
        where: { email: account.email }
      })

      if (existing) {
        console.log(`⚠️  Account ${account.email} already exists - skipping`)
        continue
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(account.password, 10)

      // Create business account
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

      // Add sample knowledge base entries based on tier
      const knowledgeBaseItems = []
      
      // Starter gets 5 basic Q&As
      if (account.tier === 'starter') {
        knowledgeBaseItems.push(
          { question: 'What time is check-in?', answer: 'Check-in time is at 3:00 PM.', category: 'general' },
          { question: 'What time is check-out?', answer: 'Check-out time is at 11:00 AM.', category: 'general' },
          { question: 'Do you have free WiFi?', answer: 'Yes, we offer complimentary WiFi throughout the property.', category: 'amenities' },
          { question: 'Is parking available?', answer: 'Yes, we have free self-parking available for guests.', category: 'amenities' },
          { question: 'Do you have a pool?', answer: 'Yes, we have an outdoor pool open from 7 AM to 10 PM.', category: 'amenities' }
        )
      }

      // Professional gets 10 Q&As with 2 languages
      if (account.tier === 'professional') {
        knowledgeBaseItems.push(
          // English
          { question: 'What time is check-in?', answer: 'Check-in begins at 3:00 PM. Early check-in may be available upon request.', category: 'general', language: 'en' },
          { question: 'What restaurants are on-site?', answer: 'We have three restaurants: Ocean View (fine dining), Poolside Grill (casual), and Sunrise Café (breakfast).', category: 'dining', language: 'en' },
          { question: 'Do you offer airport shuttle?', answer: 'Yes, we provide complimentary airport shuttle service every 30 minutes.', category: 'transportation', language: 'en' },
          { question: 'What activities are available?', answer: 'We offer snorkeling, surfing lessons, sunset cruises, and cultural activities.', category: 'activities', language: 'en' },
          { question: 'Is there a spa?', answer: 'Yes, our full-service spa offers massages, facials, and wellness treatments.', category: 'amenities', language: 'en' },
          // Japanese
          { question: 'チェックインは何時ですか？', answer: 'チェックインは午後3時からです。', category: 'general', language: 'ja' },
          { question: 'WiFiはありますか？', answer: 'はい、無料WiFiを全館でご利用いただけます。', category: 'amenities', language: 'ja' },
          { question: 'プールはありますか？', answer: 'はい、屋外プールがございます。', category: 'amenities', language: 'ja' },
          { question: '駐車場はありますか？', answer: 'はい、無料駐車場がございます。', category: 'amenities', language: 'ja' },
          { question: 'レストランはありますか？', answer: 'はい、3つのレストランがございます。', category: 'dining', language: 'ja' }
        )
      }

      // Premium gets 15 Q&As with multiple languages
      if (account.tier === 'premium') {
        knowledgeBaseItems.push(
          // English - Comprehensive
          { question: 'What are your check-in and check-out times?', answer: 'Standard check-in is at 3:00 PM and check-out is at 11:00 AM. However, as a premium resort, we offer flexible arrangements based on availability. Our 24/7 concierge can assist with early check-in or late check-out requests.', category: 'general', language: 'en', priority: 10 },
          { question: 'Tell me about your dining options', answer: 'We feature five distinctive dining venues: Michelin-starred Ocean Restaurant, Japanese Kaiseki at Sakura, Italian fine dining at La Bella Vista, Beach BBQ Grill, and 24-hour in-room dining. All restaurants offer custom menus for dietary restrictions.', category: 'dining', language: 'en', priority: 10 },
          { question: 'What exclusive amenities do you offer?', answer: 'Our premium amenities include: Private beach access, infinity pools, world-class spa, championship golf course, tennis courts, water sports center, kids club, business center, and personal butler service for suite guests.', category: 'amenities', language: 'en', priority: 10 },
          { question: 'Do you offer airport transportation?', answer: 'Yes, we provide complimentary luxury vehicle airport transfers for all guests. Our concierge will coordinate your pickup and can also arrange helicopter transfers or private jet services.', category: 'transportation', language: 'en', priority: 10 },
          { question: 'What types of rooms are available?', answer: 'We offer Ocean View Rooms, Garden Suites, Beachfront Villas, Presidential Suites, and exclusive Private Residences with full kitchens and private pools.', category: 'rooms', language: 'en' },
          // Japanese
          { question: 'チェックインとチェックアウトの時間は？', answer: 'チェックインは午後3時、チェックアウトは午前11時です。24時間対応のコンシェルジュがお手伝いいたします。', category: 'general', language: 'ja', priority: 10 },
          { question: 'どのようなレストランがありますか？', answer: '5つの高級レストランがございます：オーシャンレストラン、日本料理「さくら」、イタリアン「ラ・ベラ・ビスタ」、ビーチBBQ、24時間ルームサービス。', category: 'dining', language: 'ja' },
          { question: 'スパはありますか？', answer: 'はい、世界クラスのスパがございます。マッサージ、フェイシャル、ボディトリートメントをご提供しています。', category: 'amenities', language: 'ja' },
          // Chinese
          { question: '入住和退房时间是什么时候？', answer: '入住时间为下午3点，退房时间为上午11点。我们提供24小时礼宾服务。', category: 'general', language: 'zh', priority: 8 },
          { question: '有什么餐厅？', answer: '我们有五家特色餐厅，包括米其林星级餐厅和24小时客房服务。', category: 'dining', language: 'zh' },
          // Spanish
          { question: '¿Cuáles son los horarios de check-in y check-out?', answer: 'El check-in es a las 3:00 PM y el check-out a las 11:00 AM. Nuestro conserje 24/7 puede ayudar con solicitudes especiales.', category: 'general', language: 'es' },
          { question: '¿Qué restaurantes tienen?', answer: 'Tenemos cinco restaurantes gourmet, incluyendo cocina internacional y servicio a la habitación 24 horas.', category: 'dining', language: 'es' },
          // Korean
          { question: '체크인과 체크아웃 시간은 언제인가요?', answer: '체크인은 오후 3시, 체크아웃은 오전 11시입니다. 24시간 컨시어지 서비스를 제공합니다.', category: 'general', language: 'ko' },
          { question: '어떤 레스토랑이 있나요?', answer: '5개의 고급 레스토랑과 24시간 룸서비스를 제공합니다.', category: 'dining', language: 'ko' },
          { question: '스파가 있나요?', answer: '네, 세계적 수준의 스파에서 마사지와 웰니스 트리트먼트를 제공합니다.', category: 'amenities', language: 'ko' }
        )
      }

      // Add knowledge base items
      for (const item of knowledgeBaseItems) {
        await prisma.knowledgeBase.create({
          data: {
            businessId: business.id,
            question: item.question,
            answer: item.answer,
            category: item.category,
            keywords: item.question.toLowerCase().replace(/[?.,]/g, ''),
            language: item.language || 'en',
            priority: item.priority || 1,
            isActive: true
          }
        })
      }

      createdAccounts.push({
        email: account.email,
        password: account.password,
        tier: account.tier
      })

      console.log(`✅ Created ${account.tier} account: ${account.email}`)
    } catch (error) {
      console.error(`❌ Error creating ${account.email}:`, error.message)
    }
  }

  console.log('\n✅ Test Accounts Created Successfully!')
  console.log('=====================================\n')
  
  if (createdAccounts.length > 0) {
    console.log('📋 Login Credentials:\n')
    createdAccounts.forEach(acc => {
      console.log(`${acc.tier.toUpperCase()} TIER:`)
      console.log(`  Email: ${acc.email}`)
      console.log(`  Password: ${acc.password}`)
      console.log(`  Features: ${
        acc.tier === 'starter' ? '500 conversations/month, Basic analytics, 50 Q&As' :
        acc.tier === 'professional' ? '2,500 conversations/month, 2 languages, API access' :
        '7,500 conversations/month, 5 languages, Custom AI training'
      }`)
      console.log('')
    })
  }

  console.log('🎯 You can now login and test each tier!')
  console.log('📍 Login at: http://localhost:3000/login or your Vercel URL\n')
}

createTestAccounts()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })