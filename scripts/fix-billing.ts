import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixBillingForTrialAccount() {
  try {
    // Find the production account
    const business = await prisma.business.findUnique({
      where: { email: 'shaypro2000@gmail.com' },
      include: {
        subscription: true,
        payments: true
      }
    })

    if (!business) {
      console.log('Business not found')
      return
    }

    console.log('Business found:', {
      id: business.id,
      email: business.email,
      tier: business.tier,
      subscriptionStatus: business.subscriptionStatus,
      trialStartDate: business.trialStartDate,
      trialEndDate: business.trialEndDate
    })

    // Delete all incorrect payment history
    if (business.payments.length > 0) {
      console.log(`Deleting ${business.payments.length} incorrect payment records...`)
      await prisma.payment.deleteMany({
        where: { businessId: business.id }
      })
      console.log('Incorrect payment history deleted.')
    }

    // Since they're on a trial, they shouldn't have any payments yet
    console.log('Account is on trial - no payment history needed until trial ends.')
    
    // If trial is ending soon or has ended, create a pending invoice for the first payment
    if (business.trialEndDate) {
      const trialEndDate = new Date(business.trialEndDate)
      const today = new Date()
      
      // If trial has ended or is ending within 7 days
      if (trialEndDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) {
        console.log('Trial is ending soon or has ended. Creating first pending invoice...')
        
        const tierPrices: Record<string, number> = {
          starter: 29,
          professional: 149,
          premium: 299,
          enterprise: 999
        }
        
        const price = tierPrices[business.tier] || 29
        
        // Create the first pending invoice for after trial ends
        const firstBillingDate = new Date(trialEndDate)
        firstBillingDate.setDate(firstBillingDate.getDate() + 1) // Day after trial ends
        
        const billingEndDate = new Date(firstBillingDate)
        billingEndDate.setMonth(billingEndDate.getMonth() + 1)
        
        const payment = await prisma.payment.create({
          data: {
            businessId: business.id,
            amount: price,
            currency: 'USD',
            status: 'pending',
            description: `${business.tier.charAt(0).toUpperCase() + business.tier.slice(1)} Plan - Monthly (First Payment After Trial)`,
            invoiceNumber: `INV-${firstBillingDate.getFullYear()}-${String(firstBillingDate.getMonth() + 1).padStart(2, '0')}-${business.id.slice(-4).toUpperCase()}`,
            paymentMethod: null, // No payment method yet
            billingPeriodStart: firstBillingDate,
            billingPeriodEnd: billingEndDate,
            dueDate: firstBillingDate,
            paidAt: null,
            createdAt: new Date()
          }
        })
        
        console.log(`Created pending invoice for first payment after trial: ${payment.invoiceNumber}`)
        console.log(`Amount: $${payment.amount}`)
        console.log(`Due date: ${payment.dueDate}`)
      } else {
        console.log(`Trial doesn't end until ${trialEndDate.toLocaleDateString()}. No invoice needed yet.`)
      }
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixBillingForTrialAccount()