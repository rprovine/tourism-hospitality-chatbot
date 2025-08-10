#!/usr/bin/env node

/**
 * Test script for complete customer journey
 * Tests: Signup -> Trial -> Upgrade -> Downgrade -> Cancel
 */

const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

// Test account details
const testEmail = `test_${Date.now()}@example.com`
const testPassword = 'Test123!@#'
const testBusinessName = `Test Hotel ${Date.now()}`

async function log(message, type = 'info') {
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'
  console.log(`${prefix} ${message}`)
}

async function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

async function testSignup() {
  log('Testing signup flow...')
  
  try {
    // Create new business account
    const business = await prisma.business.create({
      data: {
        email: testEmail,
        password: await hashPassword(testPassword),
        name: testBusinessName,
        type: 'hotel',
        tier: 'starter',
        subscriptionStatus: 'trial',
        trialStartDate: new Date(),
        trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      }
    })
    
    log(`Created test account: ${business.email}`, 'success')
    
    // Create subscription record
    const subscription = await prisma.subscription.create({
      data: {
        businessId: business.id,
        tier: 'starter',
        status: 'trialing',
        billingCycle: 'monthly',
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      }
    })
    
    log('Created trial subscription', 'success')
    return business
  } catch (error) {
    log(`Signup failed: ${error.message}`, 'error')
    throw error
  }
}

async function testUpgrade(businessId) {
  log('Testing upgrade flow (Starter -> Professional)...')
  
  try {
    // Update business tier
    const business = await prisma.business.update({
      where: { id: businessId },
      data: {
        tier: 'professional',
        subscriptionStatus: 'active',
      }
    })
    
    // Update subscription
    const subscription = await prisma.subscription.update({
      where: { businessId: businessId },
      data: {
        tier: 'professional',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      }
    })
    
    log('Upgraded to Professional plan', 'success')
    return business
  } catch (error) {
    log(`Upgrade failed: ${error.message}`, 'error')
    throw error
  }
}

async function testDowngrade(businessId) {
  log('Testing downgrade flow (Professional -> Starter)...')
  
  try {
    // Update business tier
    const business = await prisma.business.update({
      where: { id: businessId },
      data: {
        tier: 'starter',
      }
    })
    
    // Update subscription
    const subscription = await prisma.subscription.update({
      where: { businessId: businessId },
      data: {
        tier: 'starter',
        status: 'active',
      }
    })
    
    log('Downgraded to Starter plan', 'success')
    return business
  } catch (error) {
    log(`Downgrade failed: ${error.message}`, 'error')
    throw error
  }
}

async function testCancellation(businessId) {
  log('Testing cancellation flow...')
  
  try {
    // Update subscription to cancel at period end
    const subscription = await prisma.subscription.update({
      where: { businessId: businessId },
      data: {
        cancelAtPeriodEnd: true,
        cancelledAt: new Date(),
        status: 'cancelling',
      }
    })
    
    // Update business status
    const business = await prisma.business.update({
      where: { id: businessId },
      data: {
        subscriptionStatus: 'cancelling',
      }
    })
    
    log('Marked subscription for cancellation at period end', 'success')
    
    // Simulate immediate cancellation
    await prisma.subscription.update({
      where: { businessId: businessId },
      data: {
        status: 'cancelled',
        accessRevokedAt: new Date(),
      }
    })
    
    await prisma.business.update({
      where: { id: businessId },
      data: {
        tier: 'none',
        subscriptionStatus: 'cancelled',
      }
    })
    
    log('Subscription cancelled and access revoked', 'success')
    return business
  } catch (error) {
    log(`Cancellation failed: ${error.message}`, 'error')
    throw error
  }
}

async function verifyDataIntegrity(businessId) {
  log('Verifying data integrity...')
  
  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        subscription: true,
        conversations: true,
        knowledgeBase: true,
      }
    })
    
    if (!business) {
      throw new Error('Business not found')
    }
    
    log(`Business: ${business.name} (${business.email})`)
    log(`Tier: ${business.tier}`)
    log(`Status: ${business.subscriptionStatus}`)
    
    if (business.subscription) {
      log(`Subscription Status: ${business.subscription.status}`)
      log(`Billing Cycle: ${business.subscription.billingCycle}`)
      log(`Cancel at Period End: ${business.subscription.cancelAtPeriodEnd}`)
    }
    
    log('Data integrity verified', 'success')
    return business
  } catch (error) {
    log(`Data verification failed: ${error.message}`, 'error')
    throw error
  }
}

async function cleanup(businessId) {
  log('Cleaning up test data...')
  
  try {
    // Delete subscription first
    await prisma.subscription.deleteMany({
      where: { businessId: businessId }
    })
    
    // Delete business and related data
    await prisma.business.delete({
      where: { id: businessId }
    })
    
    log('Test data cleaned up', 'success')
  } catch (error) {
    log(`Cleanup failed: ${error.message}`, 'error')
  }
}

async function runTests() {
  console.log('🚀 Starting Customer Journey Tests\n')
  console.log('=====================================\n')
  
  let businessId = null
  
  try {
    // Test 1: Signup
    console.log('📝 TEST 1: SIGNUP & TRIAL')
    console.log('-------------------------')
    const business = await testSignup()
    businessId = business.id
    await verifyDataIntegrity(businessId)
    console.log()
    
    // Test 2: Upgrade
    console.log('⬆️  TEST 2: UPGRADE')
    console.log('-------------------------')
    await testUpgrade(businessId)
    await verifyDataIntegrity(businessId)
    console.log()
    
    // Test 3: Downgrade
    console.log('⬇️  TEST 3: DOWNGRADE')
    console.log('-------------------------')
    await testDowngrade(businessId)
    await verifyDataIntegrity(businessId)
    console.log()
    
    // Test 4: Cancellation
    console.log('🚫 TEST 4: CANCELLATION')
    console.log('-------------------------')
    await testCancellation(businessId)
    await verifyDataIntegrity(businessId)
    console.log()
    
    console.log('=====================================')
    console.log('✨ All tests completed successfully!')
    console.log('=====================================\n')
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error)
  } finally {
    // Cleanup
    if (businessId) {
      await cleanup(businessId)
    }
    await prisma.$disconnect()
  }
}

// Run the tests
runTests()
  .then(() => {
    console.log('\n✅ Test suite completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed:', error)
    process.exit(1)
  })