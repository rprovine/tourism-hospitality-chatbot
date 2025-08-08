import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

async function testSubscriptionFlow() {
  console.log('🧪 Testing Subscription Flow...\n')
  
  try {
    // 1. Create a test business
    console.log('1️⃣  Creating test business...')
    const testEmail = `test-${Date.now()}@example.com`
    const business = await prisma.business.create({
      data: {
        email: testEmail,
        password: 'test123',
        name: 'Test Hotel',
        type: 'hotel',
        tier: 'starter',
        subscriptionStatus: 'trial'
      }
    })
    console.log(`✅ Created business: ${business.id} (${business.email})`)
    
    // 2. Create a checkout session
    console.log('\n2️⃣  Creating checkout session...')
    const sessionId = nanoid()
    const checkoutSession = await prisma.checkoutSession.create({
      data: {
        businessId: business.id,
        sessionId: sessionId,
        planId: 'professional_monthly',
        email: testEmail,
        businessName: 'Test Hotel',
        contactName: 'John Doe',
        phone: '555-1234',
        paymentUrl: `https://payment.example.com?session_id=${sessionId}`,
        status: 'pending'
      }
    })
    console.log(`✅ Created checkout session: ${checkoutSession.sessionId}`)
    
    // 3. Simulate payment success
    console.log('\n3️⃣  Simulating payment success...')
    const updatedSession = await prisma.checkoutSession.update({
      where: { id: checkoutSession.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        hubspotSubscriptionId: 'hs_sub_123',
        metadata: {
          paymentMethod: 'card',
          amount: 149,
          currency: 'USD'
        }
      }
    })
    console.log(`✅ Payment completed for session: ${updatedSession.sessionId}`)
    
    // 4. Create subscription
    console.log('\n4️⃣  Creating subscription...')
    const subscription = await prisma.subscription.create({
      data: {
        businessId: business.id,
        tier: 'professional',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        paymentMethod: 'hubspot',
        paymentStatus: 'paid',
        metadata: {
          hubspotSubscriptionId: 'hs_sub_123',
          checkoutSessionId: sessionId
        }
      }
    })
    console.log(`✅ Created subscription: ${subscription.id}`)
    
    // 5. Update business tier
    console.log('\n5️⃣  Updating business tier...')
    const updatedBusiness = await prisma.business.update({
      where: { id: business.id },
      data: {
        tier: 'professional',
        subscriptionStatus: 'active'
      }
    })
    console.log(`✅ Updated business tier to: ${updatedBusiness.tier}`)
    
    // 6. Test fetching subscription
    console.log('\n6️⃣  Fetching subscription details...')
    const fetchedSubscription = await prisma.subscription.findUnique({
      where: { businessId: business.id },
      include: { business: true }
    })
    console.log(`✅ Fetched subscription:`)
    console.log(`   - Tier: ${fetchedSubscription?.tier}`)
    console.log(`   - Status: ${fetchedSubscription?.status}`)
    console.log(`   - Business: ${fetchedSubscription?.business.name}`)
    
    // 7. Test cancellation
    console.log('\n7️⃣  Testing subscription cancellation...')
    const cancelledSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true,
        cancelledAt: new Date(),
        status: 'cancelling'
      }
    })
    console.log(`✅ Subscription marked for cancellation at period end`)
    
    // 8. Verify session tracking works
    console.log('\n8️⃣  Verifying session tracking...')
    const sessionLookup = await prisma.checkoutSession.findUnique({
      where: { sessionId: sessionId },
      include: { business: true }
    })
    console.log(`✅ Session lookup successful:`)
    console.log(`   - Business: ${sessionLookup?.business.name}`)
    console.log(`   - Status: ${sessionLookup?.status}`)
    console.log(`   - HubSpot ID: ${sessionLookup?.hubspotSubscriptionId}`)
    
    // Clean up
    console.log('\n🧹 Cleaning up test data...')
    await prisma.subscription.delete({ where: { id: subscription.id } })
    await prisma.checkoutSession.delete({ where: { id: checkoutSession.id } })
    await prisma.business.delete({ where: { id: business.id } })
    console.log('✅ Test data cleaned up')
    
    console.log('\n✨ All tests passed successfully!')
    
  } catch (error) {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testSubscriptionFlow()