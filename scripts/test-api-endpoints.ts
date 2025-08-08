import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const API_BASE = 'http://localhost:3000/api'

async function testAPIEndpoints() {
  console.log('🧪 Testing API Endpoints...\n')
  
  try {
    // 1. Create test business for auth
    console.log('1️⃣  Setting up test business...')
    const testEmail = `api-test-${Date.now()}@example.com`
    const business = await prisma.business.create({
      data: {
        email: testEmail,
        password: 'test123',
        name: 'API Test Hotel',
        type: 'hotel',
        tier: 'starter',
        subscriptionStatus: 'trial'
      }
    })
    
    // Generate JWT token
    const token = jwt.sign(
      { businessId: business.id, email: testEmail },
      JWT_SECRET,
      { expiresIn: '1h' }
    )
    console.log(`✅ Created business and token`)
    
    // 2. Test checkout endpoint (without auth)
    console.log('\n2️⃣  Testing checkout API (new customer)...')
    const checkoutResponse = await fetch(`${API_BASE}/payments/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId: 'professional_monthly',
        email: `new-${Date.now()}@example.com`,
        businessName: 'New Hotel',
        contactName: 'Jane Doe'
      })
    })
    
    if (checkoutResponse.ok) {
      const checkoutData = await checkoutResponse.json()
      console.log(`✅ Checkout created:`)
      console.log(`   - Session ID: ${checkoutData.sessionId}`)
      console.log(`   - URL: ${checkoutData.checkoutUrl?.substring(0, 50)}...`)
    } else {
      console.log(`⚠️  Checkout failed: ${checkoutResponse.status}`)
    }
    
    // 3. Test checkout with auth
    console.log('\n3️⃣  Testing checkout API (existing customer)...')
    const authCheckoutResponse = await fetch(`${API_BASE}/payments/checkout`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        planId: 'premium_monthly',
        email: testEmail,
        businessName: business.name
      })
    })
    
    if (authCheckoutResponse.ok) {
      const authCheckoutData = await authCheckoutResponse.json()
      console.log(`✅ Authenticated checkout created:`)
      console.log(`   - Session ID: ${authCheckoutData.sessionId}`)
      
      // Save session ID for later tests
      const sessionId = authCheckoutData.sessionId
      
      // 4. Test session fetch
      console.log('\n4️⃣  Testing session fetch API...')
      const sessionResponse = await fetch(`${API_BASE}/checkout/session?id=${sessionId}`)
      
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json()
        console.log(`✅ Session fetched:`)
        console.log(`   - Business: ${sessionData.businessName}`)
        console.log(`   - Plan: ${sessionData.planId}`)
        console.log(`   - Status: ${sessionData.status}`)
      } else {
        console.log(`⚠️  Session fetch failed: ${sessionResponse.status}`)
      }
    } else {
      console.log(`⚠️  Authenticated checkout failed: ${authCheckoutResponse.status}`)
    }
    
    // 5. Create a subscription for testing
    console.log('\n5️⃣  Creating test subscription...')
    const subscription = await prisma.subscription.create({
      data: {
        businessId: business.id,
        tier: 'professional',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentMethod: 'test',
        paymentStatus: 'paid'
      }
    })
    console.log(`✅ Subscription created`)
    
    // 6. Test subscription fetch
    console.log('\n6️⃣  Testing subscription fetch API...')
    const subResponse = await fetch(`${API_BASE}/subscription`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (subResponse.ok) {
      const subData = await subResponse.json()
      console.log(`✅ Subscription fetched:`)
      console.log(`   - Tier: ${subData.tier}`)
      console.log(`   - Status: ${subData.status}`)
      console.log(`   - End Date: ${new Date(subData.endDate).toLocaleDateString()}`)
    } else {
      console.log(`⚠️  Subscription fetch failed: ${subResponse.status}`)
    }
    
    // 7. Test subscription cancellation
    console.log('\n7️⃣  Testing subscription cancellation API...')
    const cancelResponse = await fetch(`${API_BASE}/subscription/cancel`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ immediate: false })
    })
    
    if (cancelResponse.ok) {
      const cancelData = await cancelResponse.json()
      console.log(`✅ Subscription cancelled:`)
      console.log(`   - ${cancelData.message}`)
    } else {
      console.log(`⚠️  Cancellation failed: ${cancelResponse.status}`)
    }
    
    // Clean up
    console.log('\n🧹 Cleaning up test data...')
    await prisma.subscription.deleteMany({ where: { businessId: business.id } })
    await prisma.checkoutSession.deleteMany({ where: { businessId: business.id } })
    await prisma.business.delete({ where: { id: business.id } })
    console.log('✅ Test data cleaned up')
    
    console.log('\n✨ API endpoint tests completed!')
    
  } catch (error) {
    console.error('\n❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Check if server is running
fetch('http://localhost:3000/api/health')
  .then(() => {
    console.log('✅ Server is running on port 3000')
    testAPIEndpoints()
  })
  .catch(() => {
    console.log('❌ Server is not running. Please start it with: npm run dev')
    process.exit(1)
  })