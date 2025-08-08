import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixStarterAccount() {
  console.log('🔧 Fixing starter@demo.com account...\n')
  console.log('='.repeat(60))
  
  try {
    // First, check current state
    const current = await prisma.business.findUnique({
      where: { email: 'starter@demo.com' },
      include: { subscription: true }
    })
    
    if (!current) {
      console.log('❌ Account not found!')
      return
    }
    
    console.log('Current state:')
    console.log('  Email:', current.email)
    console.log('  Tier:', current.tier)
    console.log('  Name:', current.name)
    console.log('  Subscription Tier:', current.subscriptionTier)
    console.log('  Has subscription record:', current.subscription ? 'YES' : 'NO')
    
    // Remove any subscription for starter tier
    if (current.subscription) {
      console.log('\n🗑️  Removing subscription (starter tier should not have one)...')
      await prisma.subscription.delete({
        where: { id: current.subscription.id }
      })
      console.log('  ✅ Subscription removed')
    }
    
    // Force update to starter tier
    console.log('\n📝 Updating business to starter tier...')
    const updated = await prisma.business.update({
      where: { email: 'starter@demo.com' },
      data: {
        tier: 'starter',
        name: 'Starter Beach Hotel',
        type: 'hotel',
        subscriptionStatus: 'active',
        subscriptionTier: 'starter',
        // Clear any premium/professional settings
        businessInfo: {
          description: 'Demo account for starter tier',
          features: [
            '100 conversations/month',
            'Basic analytics',
            'Email support',
            'Web chat widget'
          ],
          demoAccount: true
        }
      }
    })
    
    console.log('\n✅ Updated state:')
    console.log('  Email:', updated.email)
    console.log('  Tier:', updated.tier)
    console.log('  Name:', updated.name)
    console.log('  Status:', updated.subscriptionStatus)
    console.log('  Subscription Tier:', updated.subscriptionTier)
    
    // Final verification
    const finalCheck = await prisma.business.findUnique({
      where: { email: 'starter@demo.com' },
      include: { subscription: true }
    })
    
    console.log('\n' + '='.repeat(60))
    console.log('📊 FINAL VERIFICATION')
    console.log('='.repeat(60))
    console.log('  ✅ Tier is "starter":', finalCheck?.tier === 'starter')
    console.log('  ✅ No subscription record:', !finalCheck?.subscription)
    console.log('  ✅ Name is correct:', finalCheck?.name === 'Starter Beach Hotel')
    
    // Check all demo accounts
    console.log('\n📋 All Demo Accounts Status:')
    console.log('-'.repeat(40))
    
    const allDemo = await prisma.business.findMany({
      where: {
        email: { endsWith: '@demo.com' }
      },
      select: {
        email: true,
        tier: true,
        subscriptionTier: true
      },
      orderBy: { email: 'asc' }
    })
    
    allDemo.forEach(acc => {
      const tierMatch = acc.tier === acc.subscriptionTier
      const expectedTier = acc.email.split('@')[0] // e.g., 'starter' from 'starter@demo.com'
      const isCorrect = acc.tier === expectedTier
      console.log(`  ${acc.email}: tier=${acc.tier} ${isCorrect ? '✅' : '❌'}`)
    })
    
    console.log('\n' + '='.repeat(60))
    console.log('✅ Starter account has been fixed!')
    console.log('You can now log in with: starter@demo.com / demo123')
    console.log('The account should show as STARTER tier')
    console.log('='.repeat(60))
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the fix
fixStarterAccount()