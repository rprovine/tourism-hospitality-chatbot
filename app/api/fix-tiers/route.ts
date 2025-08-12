import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Find all businesses with invalid tiers
    const businessesWithInvalidTiers = await prisma.business.findMany({
      where: {
        OR: [
          { tier: { equals: null } },
          { tier: 'none' },
          { tier: '' },
          {
            NOT: {
              tier: {
                in: ['starter', 'professional', 'premium', 'enterprise']
              }
            }
          }
        ]
      }
    })

    console.log(`Found ${businessesWithInvalidTiers.length} businesses with invalid tiers`)

    // Update each business to have a valid tier based on their subscription or default to starter
    const updates = []
    for (const business of businessesWithInvalidTiers) {
      // Check if they have a subscription to determine tier
      const subscription = await prisma.subscription.findFirst({
        where: { businessId: business.id },
        orderBy: { createdAt: 'desc' }
      })

      let newTier = 'starter' // Default tier
      
      if (subscription) {
        // Use subscription tier if available, otherwise map from planId
        if (subscription.tier && ['starter', 'professional', 'premium', 'enterprise'].includes(subscription.tier)) {
          newTier = subscription.tier
        } else if (subscription.planId?.includes('enterprise')) {
          newTier = 'enterprise'
        } else if (subscription.planId?.includes('premium')) {
          newTier = 'premium'
        } else if (subscription.planId?.includes('professional')) {
          newTier = 'professional'
        }
      }

      const updated = await prisma.business.update({
        where: { id: business.id },
        data: { tier: newTier }
      })

      updates.push({
        id: business.id,
        name: business.name,
        oldTier: business.tier,
        newTier: newTier
      })

      console.log(`Updated ${business.name} from tier "${business.tier}" to "${newTier}"`)
    }

    return NextResponse.json({
      message: 'Tiers fixed successfully',
      updated: updates.length,
      businesses: updates
    })
  } catch (error) {
    console.error('Error fixing tiers:', error)
    return NextResponse.json(
      { error: 'Failed to fix tiers' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}