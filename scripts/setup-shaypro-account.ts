import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupShayproAccount() {
  console.log('Setting up shaypro2000@gmail.com account with active starter subscription...')
  
  const business = await prisma.business.findUnique({
    where: { email: 'shaypro2000@gmail.com' },
    include: { subscription: true }
  })
  
  if (!business) {
    console.log('Business not found!')
    await prisma.$disconnect()
    return
  }
  
  console.log('Current status:')
  console.log('- Tier:', business.tier)
  console.log('- Status:', business.subscriptionStatus)
  console.log('- Has subscription:', !!business.subscription)
  
  // Create or update subscription
  const startDate = new Date()
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + 1) // 1 month from now
  
  if (business.subscription) {
    // Update existing subscription
    await prisma.subscription.update({
      where: { id: business.subscription.id },
      data: {
        tier: 'starter',
        status: 'active',
        billingCycle: 'monthly',
        startDate: startDate,
        endDate: endDate,
        paymentMethod: 'manual',
        paymentStatus: 'active',
        cancelAtPeriodEnd: false,
        cancelledAt: null,
        cancelReason: null,
        metadata: {
          setupBy: 'admin',
          setupDate: new Date().toISOString()
        }
      }
    })
    console.log('Updated existing subscription')
  } else {
    // Create new subscription
    await prisma.subscription.create({
      data: {
        businessId: business.id,
        tier: 'starter',
        status: 'active',
        billingCycle: 'monthly',
        startDate: startDate,
        endDate: endDate,
        paymentMethod: 'manual',
        paymentStatus: 'active',
        metadata: {
          setupBy: 'admin',
          setupDate: new Date().toISOString()
        }
      }
    })
    console.log('Created new subscription')
  }
  
  // Update business
  await prisma.business.update({
    where: { id: business.id },
    data: {
      tier: 'starter',
      subscriptionStatus: 'active',
      subscriptionTier: 'starter',
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate,
      trialStartDate: null,
      trialEndDate: null
    }
  })
  
  console.log('\nAccount updated successfully!')
  console.log('- Tier: starter')
  console.log('- Status: active')
  console.log('- Start Date:', startDate.toLocaleDateString())
  console.log('- End Date:', endDate.toLocaleDateString())
  
  await prisma.$disconnect()
}

setupShayproAccount().catch(console.error)