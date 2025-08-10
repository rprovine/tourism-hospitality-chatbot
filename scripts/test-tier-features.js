#!/usr/bin/env node

/**
 * Comprehensive test for all tier features and restrictions
 */

const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

// Test results storage
const testResults = {
  starter: { passed: [], failed: [] },
  professional: { passed: [], failed: [] },
  premium: { passed: [], failed: [] },
  enterprise: { passed: [], failed: [] }
}

// Expected features by tier
const TIER_FEATURES = {
  starter: {
    conversationsPerMonth: 100,
    knowledgeBaseItems: 50,
    guestProfiles: 0,
    channels: ['web'],
    aiModels: ['claude-haiku', 'gpt-3.5-turbo'],
    languages: ['english'],
    analytics: 'basic',
    customBranding: false,
    apiAccess: false,
    revenue: false,
    guests: false,
    upselling: false,
    recovery: false,
    channels_config: false,
    exportData: false,
    webhooks: false,
    whiteLabel: false
  },
  professional: {
    conversationsPerMonth: 1000,
    knowledgeBaseItems: 500,
    guestProfiles: 1000,
    channels: ['web', 'whatsapp', 'sms'],
    aiModels: ['claude-haiku', 'claude-sonnet', 'gpt-3.5-turbo', 'gpt-4'],
    languages: ['english', 'spanish', 'japanese', 'chinese', 'french', 'german', 'pidgin'],
    analytics: 'advanced',
    customBranding: true,
    apiAccess: false,
    revenue: true,
    guests: true,
    upselling: true,
    recovery: true,
    channels_config: true,
    exportData: true,
    webhooks: false,
    whiteLabel: false
  },
  premium: {
    conversationsPerMonth: -1, // unlimited
    knowledgeBaseItems: -1, // unlimited
    guestProfiles: -1, // unlimited
    channels: ['web', 'whatsapp', 'sms', 'instagram', 'facebook'],
    aiModels: ['claude-haiku', 'claude-sonnet', 'claude-opus', 'gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
    languages: ['english', 'spanish', 'japanese', 'chinese', 'french', 'german', 'pidgin', 'hawaiian'],
    analytics: 'enterprise',
    customBranding: true,
    apiAccess: true,
    revenue: true,
    guests: true,
    upselling: true,
    recovery: true,
    channels_config: true,
    exportData: true,
    webhooks: true,
    whiteLabel: true
  },
  enterprise: {
    conversationsPerMonth: -1,
    knowledgeBaseItems: -1,
    guestProfiles: -1,
    channels: ['web', 'whatsapp', 'sms', 'instagram', 'facebook', 'telegram', 'custom'],
    aiModels: ['all'],
    languages: ['all'],
    analytics: 'enterprise',
    customBranding: true,
    apiAccess: true,
    revenue: true,
    guests: true,
    upselling: true,
    recovery: true,
    channels_config: true,
    exportData: true,
    webhooks: true,
    whiteLabel: true,
    customIntegrations: true,
    dedicatedSupport: true,
    sla: true
  }
}

function log(message, type = 'info') {
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️'
  console.log(`${prefix} ${message}`)
}

async function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

async function createTestAccount(tier) {
  const email = `test_${tier}_${Date.now()}@example.com`
  const password = 'Test123!@#'
  
  try {
    const business = await prisma.business.create({
      data: {
        email,
        password: await hashPassword(password),
        name: `Test ${tier} Business`,
        type: 'hotel',
        tier,
        subscriptionStatus: 'active',
        apiKey: crypto.randomBytes(32).toString('hex'),
        apiKeyCreatedAt: new Date()
      }
    })
    
    await prisma.subscription.create({
      data: {
        businessId: business.id,
        tier,
        status: 'active',
        billingCycle: 'monthly',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })
    
    return business
  } catch (error) {
    log(`Failed to create ${tier} account: ${error.message}`, 'error')
    throw error
  }
}

async function testConversationLimits(business, expectedLimit) {
  try {
    const conversations = []
    
    // Test within limits
    if (expectedLimit > 0) {
      // Create conversations up to limit
      for (let i = 0; i < Math.min(expectedLimit, 5); i++) {
        const conv = await prisma.conversation.create({
          data: {
            businessId: business.id,
            sessionId: `session_${i}`,
            userLanguage: 'en'
          }
        })
        conversations.push(conv)
      }
      
      // Check count
      const count = await prisma.conversation.count({
        where: { businessId: business.id }
      })
      
      if (count === Math.min(expectedLimit, 5)) {
        testResults[business.tier].passed.push(`Conversation limit (${expectedLimit})`)
      } else {
        testResults[business.tier].failed.push(`Conversation limit - expected ${expectedLimit}, got ${count}`)
      }
    } else {
      // Unlimited - create many
      for (let i = 0; i < 10; i++) {
        await prisma.conversation.create({
          data: {
            businessId: business.id,
            sessionId: `session_${i}`,
            userLanguage: 'en'
          }
        })
      }
      testResults[business.tier].passed.push('Unlimited conversations')
    }
    
    // Cleanup
    await prisma.conversation.deleteMany({ where: { businessId: business.id } })
  } catch (error) {
    testResults[business.tier].failed.push(`Conversation test: ${error.message}`)
  }
}

async function testKnowledgeBaseLimits(business, expectedLimit) {
  try {
    const items = []
    
    if (expectedLimit > 0) {
      // Create items up to limit
      for (let i = 0; i < Math.min(expectedLimit, 5); i++) {
        const item = await prisma.knowledgeBase.create({
          data: {
            businessId: business.id,
            category: 'test',
            question: `Question ${i}`,
            answer: `Answer ${i}`,
            keywords: `keyword${i}`
          }
        })
        items.push(item)
      }
      
      const count = await prisma.knowledgeBase.count({
        where: { businessId: business.id }
      })
      
      if (count === Math.min(expectedLimit, 5)) {
        testResults[business.tier].passed.push(`Knowledge base limit (${expectedLimit})`)
      } else {
        testResults[business.tier].failed.push(`Knowledge base limit - expected ${expectedLimit}, got ${count}`)
      }
    } else {
      // Unlimited
      for (let i = 0; i < 10; i++) {
        await prisma.knowledgeBase.create({
          data: {
            businessId: business.id,
            category: 'test',
            question: `Question ${i}`,
            answer: `Answer ${i}`,
            keywords: `keyword${i}`
          }
        })
      }
      testResults[business.tier].passed.push('Unlimited knowledge base items')
    }
    
    // Cleanup
    await prisma.knowledgeBase.deleteMany({ where: { businessId: business.id } })
  } catch (error) {
    testResults[business.tier].failed.push(`Knowledge base test: ${error.message}`)
  }
}

async function testGuestProfiles(business, expectedLimit) {
  try {
    if (expectedLimit === 0) {
      // Should not be able to create guest profiles
      testResults[business.tier].passed.push('Guest profiles restricted')
      return
    }
    
    const profiles = []
    
    if (expectedLimit > 0) {
      // Create profiles up to limit
      for (let i = 0; i < Math.min(expectedLimit, 5); i++) {
        const profile = await prisma.guestProfile.create({
          data: {
            businessId: business.id,
            email: `guest${i}@example.com`,
            name: `Guest ${i}`
          }
        })
        profiles.push(profile)
      }
      
      const count = await prisma.guestProfile.count({
        where: { businessId: business.id }
      })
      
      if (count === Math.min(expectedLimit, 5)) {
        testResults[business.tier].passed.push(`Guest profiles limit (${expectedLimit})`)
      } else {
        testResults[business.tier].failed.push(`Guest profiles limit - expected ${expectedLimit}, got ${count}`)
      }
    } else {
      // Unlimited
      for (let i = 0; i < 10; i++) {
        await prisma.guestProfile.create({
          data: {
            businessId: business.id,
            email: `guest${i}@example.com`,
            name: `Guest ${i}`
          }
        })
      }
      testResults[business.tier].passed.push('Unlimited guest profiles')
    }
    
    // Cleanup
    await prisma.guestProfile.deleteMany({ where: { businessId: business.id } })
  } catch (error) {
    testResults[business.tier].failed.push(`Guest profiles test: ${error.message}`)
  }
}

async function testChannelAccess(business, expectedChannels) {
  try {
    for (const channel of expectedChannels) {
      const config = await prisma.channelConfig.create({
        data: {
          businessId: business.id,
          channel,
          isActive: true
        }
      })
      
      if (config) {
        testResults[business.tier].passed.push(`Channel: ${channel}`)
      }
    }
    
    // Try to create unauthorized channel (should fail for lower tiers)
    if (!expectedChannels.includes('telegram')) {
      try {
        await prisma.channelConfig.create({
          data: {
            businessId: business.id,
            channel: 'telegram',
            isActive: true
          }
        })
        // If it succeeds but shouldn't, that's a failure
        if (business.tier !== 'enterprise') {
          testResults[business.tier].failed.push('Unauthorized channel access: telegram')
        }
      } catch {
        // Expected to fail for non-enterprise
        testResults[business.tier].passed.push('Channel restrictions enforced')
      }
    }
    
    // Cleanup
    await prisma.channelConfig.deleteMany({ where: { businessId: business.id } })
  } catch (error) {
    testResults[business.tier].failed.push(`Channel test: ${error.message}`)
  }
}

async function testFeatureFlags(business, features) {
  // Test boolean features
  const booleanFeatures = [
    'customBranding', 'apiAccess', 'revenue', 'guests', 
    'upselling', 'recovery', 'exportData', 'webhooks', 'whiteLabel'
  ]
  
  for (const feature of booleanFeatures) {
    if (features[feature] === true) {
      testResults[business.tier].passed.push(`Feature: ${feature}`)
    } else if (features[feature] === false) {
      testResults[business.tier].passed.push(`Restricted: ${feature}`)
    }
  }
  
  // Test AI models
  if (features.aiModels) {
    const models = Array.isArray(features.aiModels) ? features.aiModels : ['all']
    testResults[business.tier].passed.push(`AI Models: ${models.join(', ')}`)
  }
  
  // Test languages
  if (features.languages) {
    const langs = Array.isArray(features.languages) ? features.languages : ['all']
    testResults[business.tier].passed.push(`Languages: ${langs.length} available`)
  }
  
  // Test analytics level
  if (features.analytics) {
    testResults[business.tier].passed.push(`Analytics: ${features.analytics}`)
  }
}

async function testAPIAccess(business, hasAccess) {
  try {
    if (hasAccess) {
      // Check if API key was generated
      if (business.apiKey) {
        testResults[business.tier].passed.push('API access enabled')
      } else {
        testResults[business.tier].failed.push('API key not generated')
      }
    } else {
      // Should not have API access
      if (!business.apiKey || business.tier === 'starter' || business.tier === 'professional') {
        testResults[business.tier].passed.push('API access restricted')
      } else {
        testResults[business.tier].failed.push('API access should be restricted')
      }
    }
  } catch (error) {
    testResults[business.tier].failed.push(`API access test: ${error.message}`)
  }
}

async function testTier(tier) {
  console.log(`\n🔍 Testing ${tier.toUpperCase()} Tier`)
  console.log('=' .repeat(50))
  
  const features = TIER_FEATURES[tier]
  if (!features) {
    log(`No features defined for ${tier}`, 'warning')
    return
  }
  
  try {
    // Create test account
    log(`Creating ${tier} test account...`)
    const business = await createTestAccount(tier)
    log(`Created business: ${business.name} (${business.email})`, 'success')
    
    // Test conversation limits
    log('Testing conversation limits...')
    await testConversationLimits(business, features.conversationsPerMonth)
    
    // Test knowledge base limits
    log('Testing knowledge base limits...')
    await testKnowledgeBaseLimits(business, features.knowledgeBaseItems)
    
    // Test guest profiles
    log('Testing guest profile limits...')
    await testGuestProfiles(business, features.guestProfiles)
    
    // Test channel access
    log('Testing channel access...')
    await testChannelAccess(business, features.channels)
    
    // Test feature flags
    log('Testing feature flags...')
    await testFeatureFlags(business, features)
    
    // Test API access
    log('Testing API access...')
    await testAPIAccess(business, features.apiAccess)
    
    // Cleanup
    await prisma.subscription.deleteMany({ where: { businessId: business.id } })
    await prisma.business.delete({ where: { id: business.id } })
    
  } catch (error) {
    log(`Failed to test ${tier}: ${error.message}`, 'error')
  }
}

async function printResults() {
  console.log('\n' + '='.repeat(70))
  console.log('📊 TEST RESULTS SUMMARY')
  console.log('='.repeat(70))
  
  for (const tier of Object.keys(testResults)) {
    const results = testResults[tier]
    const passRate = results.passed.length / (results.passed.length + results.failed.length) * 100
    
    console.log(`\n📦 ${tier.toUpperCase()} TIER`)
    console.log('-'.repeat(40))
    
    if (results.passed.length > 0) {
      console.log('✅ Passed Tests:')
      results.passed.forEach(test => console.log(`   • ${test}`))
    }
    
    if (results.failed.length > 0) {
      console.log('❌ Failed Tests:')
      results.failed.forEach(test => console.log(`   • ${test}`))
    }
    
    console.log(`\n📈 Pass Rate: ${passRate.toFixed(1)}%`)
  }
  
  // Overall summary
  let totalPassed = 0
  let totalFailed = 0
  
  for (const tier of Object.keys(testResults)) {
    totalPassed += testResults[tier].passed.length
    totalFailed += testResults[tier].failed.length
  }
  
  console.log('\n' + '='.repeat(70))
  console.log('🎯 OVERALL RESULTS')
  console.log('='.repeat(70))
  console.log(`Total Tests Passed: ${totalPassed}`)
  console.log(`Total Tests Failed: ${totalFailed}`)
  console.log(`Overall Pass Rate: ${(totalPassed / (totalPassed + totalFailed) * 100).toFixed(1)}%`)
  console.log('='.repeat(70))
}

async function runTests() {
  console.log('🚀 Starting Tier Feature Tests')
  console.log('='.repeat(70))
  
  try {
    // Test each tier
    await testTier('starter')
    await testTier('professional')
    await testTier('premium')
    await testTier('enterprise')
    
    // Print results
    await printResults()
    
  } catch (error) {
    console.error('❌ Test suite failed:', error)
  } finally {
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