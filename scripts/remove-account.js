#!/usr/bin/env node

/**
 * Script to remove a specific account and all related data
 * Usage: node scripts/remove-account.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function removeAccount(email) {
  console.log(`🗑️  Removing account: ${email}`)
  
  try {
    // Find the business account
    const business = await prisma.business.findUnique({
      where: { email },
      include: {
        subscription: true,
        conversations: {
          select: { id: true }
        },
        knowledgeBase: {
          select: { id: true }
        },
        guestProfiles: {
          select: { id: true }
        }
      }
    })

    if (!business) {
      console.log(`❌ No account found with email: ${email}`)
      return
    }

    console.log(`Found business: ${business.name} (ID: ${business.id})`)
    console.log(`- Tier: ${business.tier}`)
    console.log(`- Subscription: ${business.subscription ? 'Yes' : 'No'}`)
    console.log(`- Conversations: ${business.conversations.length}`)
    console.log(`- Knowledge Base Items: ${business.knowledgeBase.length}`)
    console.log(`- Guest Profiles: ${business.guestProfiles.length}`)

    console.log('\n⚠️  This will permanently delete:')
    console.log('- The business account')
    console.log('- Subscription data')
    console.log('- All conversations and messages')
    console.log('- All knowledge base items')
    console.log('- All guest profiles')
    console.log('- All related data')
    
    console.log('\n🔄 Starting deletion...')

    // Delete in order of dependencies

    // 1. Delete subscription if exists
    if (business.subscription) {
      await prisma.subscription.delete({
        where: { id: business.subscription.id }
      })
      console.log('✅ Subscription deleted')
    }

    // 2. Delete all conversations (this will cascade delete messages)
    if (business.conversations.length > 0) {
      await prisma.conversation.deleteMany({
        where: { businessId: business.id }
      })
      console.log(`✅ ${business.conversations.length} conversations deleted`)
    }

    // 3. Delete all knowledge base items
    if (business.knowledgeBase.length > 0) {
      await prisma.knowledgeBase.deleteMany({
        where: { businessId: business.id }
      })
      console.log(`✅ ${business.knowledgeBase.length} knowledge base items deleted`)
    }

    // 4. Delete all guest profiles
    if (business.guestProfiles.length > 0) {
      await prisma.guestProfile.deleteMany({
        where: { businessId: business.id }
      })
      console.log(`✅ ${business.guestProfiles.length} guest profiles deleted`)
    }

    // 5. Delete channel sessions
    await prisma.channelSession.deleteMany({
      where: { businessId: business.id }
    })
    console.log('✅ Channel sessions deleted')

    // 6. Delete message queue items
    await prisma.messageQueue.deleteMany({
      where: { businessId: business.id }
    })
    console.log('✅ Message queue items deleted')

    // 7. Delete learning patterns
    await prisma.learningPattern.deleteMany({
      where: { businessId: business.id }
    })
    console.log('✅ Learning patterns deleted')

    // 8. Delete AI insights
    await prisma.aIInsight.deleteMany({
      where: { businessId: business.id }
    })
    console.log('✅ AI insights deleted')

    // 9. Finally, delete the business account
    await prisma.business.delete({
      where: { id: business.id }
    })
    console.log('✅ Business account deleted')

    console.log(`\n✨ Successfully removed account: ${email}`)
    console.log('The email is now free to use for a new signup.')

  } catch (error) {
    console.error('❌ Error removing account:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
const emailToRemove = 'rprovine@gmail.com'

removeAccount(emailToRemove)
  .then(() => {
    console.log('\n✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })