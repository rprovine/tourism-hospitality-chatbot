import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function fixAllDemoAccounts() {
  console.log('🔧 Fixing All Demo Account Tiers\n')
  console.log('='.repeat(60))
  
  const demoAccounts = [
    {
      email: 'starter@demo.com',
      name: 'Starter Beach Hotel',
      tier: 'starter',
      type: 'hotel',
      password: 'demo123'
    },
    {
      email: 'professional@demo.com',
      name: 'Professional Resort & Spa',
      tier: 'professional',
      type: 'resort',
      password: 'demo123'
    },
    {
      email: 'premium@demo.com',
      name: 'Premium Luxury Villas',
      tier: 'premium',
      type: 'vacation_rental',
      password: 'demo123'
    },
    {
      email: 'enterprise@demo.com',
      name: 'Enterprise Hotel Chain',
      tier: 'enterprise',
      type: 'hotel',
      password: 'demo123'
    }
  ]
  
  for (const account of demoAccounts) {
    console.log(`\n📝 Processing: ${account.email}`)
    console.log('-'.repeat(40))
    
    try {
      // Check if account exists
      const existing = await prisma.business.findUnique({
        where: { email: account.email }
      })
      
      if (existing) {
        // Update existing account
        const updated = await prisma.business.update({
          where: { email: account.email },
          data: {
            name: account.name,
            tier: account.tier,
            type: account.type,
            subscriptionStatus: 'active',
            password: await bcrypt.hash(account.password, 10),
            // Reset trial dates for demo accounts
            trialStartDate: new Date(),
            trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
            // Add some default settings
            primaryColor: '#0891b2',
            welcomeMessage: `Welcome to ${account.name}! How can I help you today?`,
            businessInfo: {
              description: `Demo account for ${account.tier} tier`,
              features: getTierFeatures(account.tier),
              demoAccount: true
            }
          }
        })
        console.log(`✅ Updated: ${updated.name}`)
        console.log(`   Tier: ${updated.tier}`)
        console.log(`   Status: ${updated.subscriptionStatus}`)
      } else {
        // Create new account
        const created = await prisma.business.create({
          data: {
            email: account.email,
            name: account.name,
            password: await bcrypt.hash(account.password, 10),
            type: account.type,
            tier: account.tier,
            subscriptionStatus: 'active',
            trialStartDate: new Date(),
            trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            primaryColor: '#0891b2',
            welcomeMessage: `Welcome to ${account.name}! How can I help you today?`,
            businessInfo: {
              description: `Demo account for ${account.tier} tier`,
              features: getTierFeatures(account.tier),
              demoAccount: true
            }
          }
        })
        console.log(`✅ Created: ${created.name}`)
        console.log(`   Tier: ${created.tier}`)
        console.log(`   Status: ${created.subscriptionStatus}`)
      }
      
      // Create or update subscription for non-starter tiers
      if (account.tier !== 'starter') {
        const existingSub = await prisma.subscription.findUnique({
          where: { businessId: existing?.id || '' }
        }).catch(() => null)
        
        if (existingSub) {
          await prisma.subscription.update({
            where: { id: existingSub.id },
            data: {
              tier: account.tier,
              status: 'active',
              startDate: new Date(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              paymentStatus: 'paid',
              cancelAtPeriodEnd: false
            }
          })
          console.log(`   ✅ Subscription updated`)
        } else if (existing) {
          await prisma.subscription.create({
            data: {
              businessId: existing.id,
              tier: account.tier,
              status: 'active',
              startDate: new Date(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              paymentMethod: 'demo',
              paymentStatus: 'paid',
              metadata: {
                demo: true,
                createdBy: 'demo-setup-script'
              }
            }
          })
          console.log(`   ✅ Subscription created`)
        }
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${account.email}:`, error)
    }
  }
  
  // Verify all accounts
  console.log('\n' + '='.repeat(60))
  console.log('📊 VERIFICATION')
  console.log('='.repeat(60))
  
  const allDemo = await prisma.business.findMany({
    where: {
      email: {
        endsWith: '@demo.com'
      }
    },
    include: {
      subscription: true
    },
    orderBy: {
      tier: 'asc'
    }
  })
  
  console.log('\nDemo Accounts Status:')
  allDemo.forEach(acc => {
    console.log(`\n${acc.email}:`)
    console.log(`  Name: ${acc.name}`)
    console.log(`  Tier: ${acc.tier} ✅`)
    console.log(`  Status: ${acc.subscriptionStatus}`)
    console.log(`  Subscription: ${acc.subscription ? 'Active' : 'None'}`)
    console.log(`  Password: demo123`)
  })
  
  console.log('\n' + '='.repeat(60))
  console.log('✅ All demo accounts are ready for testing!')
  console.log('\nYou can now log in with:')
  console.log('  - starter@demo.com / demo123')
  console.log('  - professional@demo.com / demo123')
  console.log('  - premium@demo.com / demo123')
  console.log('  - enterprise@demo.com / demo123')
  console.log('='.repeat(60))
  
  await prisma.$disconnect()
}

function getTierFeatures(tier: string): string[] {
  const features: Record<string, string[]> = {
    starter: [
      '100 conversations/month',
      'Basic analytics',
      'Email support',
      'Web chat widget'
    ],
    professional: [
      '1,000 conversations/month',
      'CRM integration',
      'Booking system integration',
      'Priority support',
      'API access'
    ],
    premium: [
      'Unlimited conversations',
      'All integrations',
      'Advanced analytics',
      'Revenue optimization',
      'VIP guest tracking',
      'Custom AI training'
    ],
    enterprise: [
      'Everything in Premium',
      'Multi-property support',
      'Custom integrations',
      'Dedicated success manager',
      'SLA guarantee',
      'White-label options'
    ]
  }
  
  return features[tier] || []
}

// Run the fix
fixAllDemoAccounts().catch(console.error)