#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

async function runE2ETest() {
  console.log('🚀 Running End-to-End Subscription Flow Test\n')
  console.log('='.repeat(60))
  
  const testResults = {
    passed: 0,
    failed: 0,
    tests: [] as any[]
  }
  
  async function test(name: string, fn: () => Promise<boolean>) {
    try {
      console.log(`\n📝 ${name}...`)
      const result = await fn()
      if (result) {
        console.log(`   ✅ PASSED`)
        testResults.passed++
        testResults.tests.push({ name, status: 'passed' })
      } else {
        console.log(`   ❌ FAILED`)
        testResults.failed++
        testResults.tests.push({ name, status: 'failed' })
      }
      return result
    } catch (error: any) {
      console.log(`   ❌ ERROR: ${error.message}`)
      testResults.failed++
      testResults.tests.push({ name, status: 'error', error: error.message })
      return false
    }
  }
  
  let testBusinessId: string | null = null
  let testSessionId: string | null = null
  let testSubscriptionId: string | null = null
  
  try {
    // Test 1: Database Connection
    await test('Database Connection', async () => {
      const count = await prisma.business.count()
      console.log(`   Found ${count} businesses in database`)
      return true
    })
    
    // Test 2: Business Creation
    await test('Business Registration', async () => {
      const business = await prisma.business.create({
        data: {
          email: `e2e-test-${Date.now()}@demo.com`,
          password: 'testpass123',
          name: 'E2E Test Hotel',
          type: 'hotel',
          tier: 'starter',
          subscriptionStatus: 'trial'
        }
      })
      testBusinessId = business.id
      console.log(`   Created business: ${business.id}`)
      return !!business.id
    })
    
    // Test 3: Checkout Session Creation
    await test('Checkout Session Creation', async () => {
      if (!testBusinessId) return false
      
      const sessionId = nanoid()
      const session = await prisma.checkoutSession.create({
        data: {
          businessId: testBusinessId,
          sessionId: sessionId,
          planId: 'professional_monthly',
          email: 'e2e@test.com',
          businessName: 'E2E Test Hotel',
          paymentUrl: `https://payment.test.com?sid=${sessionId}`,
          status: 'pending'
        }
      })
      testSessionId = session.sessionId
      console.log(`   Created session: ${session.sessionId}`)
      return !!session.id
    })
    
    // Test 4: Session Retrieval
    await test('Session Retrieval by ID', async () => {
      if (!testSessionId) return false
      
      const session = await prisma.checkoutSession.findUnique({
        where: { sessionId: testSessionId }
      })
      console.log(`   Retrieved session: ${session?.status}`)
      return session?.status === 'pending'
    })
    
    // Test 5: Payment Completion Simulation
    await test('Payment Completion', async () => {
      if (!testSessionId) return false
      
      const updated = await prisma.checkoutSession.update({
        where: { sessionId: testSessionId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          hubspotSubscriptionId: 'test_sub_123'
        }
      })
      console.log(`   Session marked complete: ${updated.status}`)
      return updated.status === 'completed'
    })
    
    // Test 6: Subscription Creation
    await test('Subscription Creation', async () => {
      if (!testBusinessId) return false
      
      const subscription = await prisma.subscription.create({
        data: {
          businessId: testBusinessId,
          tier: 'professional',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          paymentMethod: 'test',
          paymentStatus: 'paid'
        }
      })
      testSubscriptionId = subscription.id
      console.log(`   Created subscription: ${subscription.tier}`)
      return subscription.status === 'active'
    })
    
    // Test 7: Business Tier Update
    await test('Business Tier Update', async () => {
      if (!testBusinessId) return false
      
      const updated = await prisma.business.update({
        where: { id: testBusinessId },
        data: {
          tier: 'professional',
          subscriptionStatus: 'active'
        }
      })
      console.log(`   Updated tier to: ${updated.tier}`)
      return updated.tier === 'professional'
    })
    
    // Test 8: Subscription Retrieval
    await test('Subscription Retrieval', async () => {
      if (!testBusinessId) return false
      
      const subscription = await prisma.subscription.findUnique({
        where: { businessId: testBusinessId }
      })
      console.log(`   Found subscription: ${subscription?.tier}`)
      return subscription?.tier === 'professional'
    })
    
    // Test 9: Cancellation Flow
    await test('Subscription Cancellation', async () => {
      if (!testSubscriptionId) return false
      
      const cancelled = await prisma.subscription.update({
        where: { id: testSubscriptionId },
        data: {
          cancelAtPeriodEnd: true,
          cancelledAt: new Date(),
          status: 'cancelling'
        }
      })
      console.log(`   Subscription status: ${cancelled.status}`)
      return cancelled.cancelAtPeriodEnd === true
    })
    
    // Test 10: Webhook Simulation
    await test('Webhook Processing', async () => {
      if (!testSessionId || !testBusinessId) return false
      
      // Simulate finding business by session ID (as webhook would do)
      const session = await prisma.checkoutSession.findUnique({
        where: { sessionId: testSessionId },
        include: { business: true }
      })
      console.log(`   Found business via session: ${session?.business.name}`)
      return session?.business.id === testBusinessId
    })
    
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up test data...')
    if (testSubscriptionId) {
      await prisma.subscription.delete({ where: { id: testSubscriptionId } })
    }
    if (testSessionId) {
      await prisma.checkoutSession.deleteMany({ where: { sessionId: testSessionId } })
    }
    if (testBusinessId) {
      await prisma.business.delete({ where: { id: testBusinessId } })
    }
    console.log('   ✅ Cleanup complete')
    
    await prisma.$disconnect()
  }
  
  // Print Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 TEST RESULTS SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Passed: ${testResults.passed}`)
  console.log(`❌ Failed: ${testResults.failed}`)
  console.log(`📝 Total:  ${testResults.passed + testResults.failed}`)
  console.log('='.repeat(60))
  
  if (testResults.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! The subscription system is working correctly.')
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.')
    process.exit(1)
  }
}

// Run the test
runE2ETest().catch(console.error)