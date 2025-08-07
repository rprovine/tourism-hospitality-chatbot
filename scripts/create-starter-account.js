const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createStarterAccount() {
  try {
    // Check if account already exists and delete it
    const existing = await prisma.business.findUnique({
      where: { email: 'starter@lenilani.com' }
    })
    
    if (existing) {
      // Delete related records first
      await prisma.subscription.deleteMany({
        where: { businessId: existing.id }
      })
      await prisma.business.delete({
        where: { id: existing.id }
      })
      console.log('🗑️  Deleted existing starter account')
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('starter123', 10)
    
    // Create the business
    const business = await prisma.business.create({
      data: {
        name: 'Aloha Guest House',
        type: 'vacation_rental',
        email: 'starter@lenilani.com',
        password: hashedPassword,
        tier: 'starter',
        subscriptionStatus: 'active',
        primaryColor: '#0891b2',
        welcomeMessage: 'Aloha! Welcome to Aloha Guest House. How can I help you today?',
        businessInfo: {
          phone: '808-555-0100',
          address: '456 Sunset Lane, Kailua, HI 96734',
          website: 'https://alohaguesthouse.com'
        }
      }
    })
    
    // Create subscription
    const startDate = new Date()
    const endDate = new Date('2030-12-31') // Far future date for active subscription
    
    await prisma.subscription.create({
      data: {
        business: {
          connect: { id: business.id }
        },
        tier: 'starter',
        status: 'active',
        startDate: startDate,
        endDate: endDate,
        paymentMethod: 'hubspot',
        paymentStatus: 'paid'
      }
    })
    
    console.log('✅ Starter account created successfully!')
    console.log('Email: starter@lenilani.com')
    console.log('Password: starter123')
    console.log('Tier: Starter ($299/month)')
    
  } catch (error) {
    console.error('Error creating starter account:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createStarterAccount()