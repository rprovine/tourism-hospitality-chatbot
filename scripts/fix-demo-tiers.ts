import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

async function fixDemoTiers() {
  const prisma = new PrismaClient()
  
  try {
    // Update starter@demo.com to starter tier
    const starter = await prisma.business.update({
      where: { email: 'starter@demo.com' },
      data: { 
        tier: 'starter',
        name: 'Starter Beach Hotel'
      }
    })
    console.log('Updated starter@demo.com to tier:', starter.tier)
    
    // Ensure other demo accounts have correct tiers
    const professional = await prisma.business.update({
      where: { email: 'professional@demo.com' },
      data: { 
        tier: 'professional',
        name: 'Professional Resort & Spa'
      }
    })
    console.log('Updated professional@demo.com to tier:', professional.tier)
    
    const premium = await prisma.business.update({
      where: { email: 'premium@demo.com' },
      data: { 
        tier: 'premium',
        name: 'Premium Luxury Villas'
      }
    })
    console.log('Updated premium@demo.com to tier:', premium.tier)
    
    // Also ensure passwords are correct for all demo accounts
    const hashedPassword = await bcrypt.hash('demo123', 10)
    await prisma.business.updateMany({
      where: {
        email: {
          in: ['starter@demo.com', 'professional@demo.com', 'premium@demo.com']
        }
      },
      data: {
        password: hashedPassword
      }
    })
    console.log('Updated passwords for all demo accounts')
    
    // Verify the changes
    const allDemoAccounts = await prisma.business.findMany({
      where: {
        email: {
          in: ['starter@demo.com', 'professional@demo.com', 'premium@demo.com']
        }
      },
      select: {
        email: true,
        tier: true,
        name: true
      }
    })
    
    console.log('\nCurrent demo accounts:')
    allDemoAccounts.forEach(account => {
      console.log(`${account.email}: ${account.tier} - ${account.name}`)
    })
    
  } catch (error) {
    console.error('Error updating demo tiers:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixDemoTiers()