import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAndSetupBilling() {
  try {
    // Find the production account
    const business = await prisma.business.findUnique({
      where: { email: 'shaypro2000@gmail.com' },
      include: {
        subscription: true,
        payments: {
          orderBy: { createdAt: 'desc' }
        }
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
      subscriptionStatus: business.subscriptionStatus
    })

    console.log('Subscription:', business.subscription)
    console.log('Existing payments:', business.payments.length)

    if (business.payments.length === 0) {
      console.log('No payments found. Creating sample payment history...')
      
      const tierPrices: Record<string, number> = {
        starter: 29,
        professional: 149,
        premium: 299,
        enterprise: 999
      }
      
      const currentPrice = tierPrices[business.tier] || 149
      const today = new Date()
      
      // Generate last 6 months of payment history
      for (let i = 5; i >= 0; i--) {
        const billingDate = new Date(today)
        billingDate.setMonth(today.getMonth() - i)
        billingDate.setDate(1) // First of the month
        
        const billingEndDate = new Date(billingDate)
        billingEndDate.setMonth(billingEndDate.getMonth() + 1)
        billingEndDate.setDate(0) // Last day of the month
        
        const payment = await prisma.payment.create({
          data: {
            businessId: business.id,
            amount: currentPrice,
            currency: 'USD',
            status: i === 0 ? 'pending' : 'paid',
            description: `${business.tier.charAt(0).toUpperCase() + business.tier.slice(1)} Plan - Monthly`,
            invoiceNumber: `INV-2024-${String(billingDate.getMonth() + 1).padStart(2, '0')}-${business.id.slice(-4).toUpperCase()}`,
            paymentMethod: 'Visa •••• 4242',
            billingPeriodStart: billingDate,
            billingPeriodEnd: billingEndDate,
            dueDate: new Date(billingDate.getTime() + 7 * 24 * 60 * 60 * 1000),
            paidAt: i === 0 ? null : new Date(billingDate.getTime() + 2 * 24 * 60 * 60 * 1000),
            createdAt: billingDate
          }
        })
        
        console.log(`Created payment for ${billingDate.toISOString().split('T')[0]}: ${payment.invoiceNumber}`)
      }
      
      console.log('Sample payment history created successfully!')
    } else {
      console.log('Payment history already exists:')
      business.payments.forEach(payment => {
        console.log(`- ${payment.invoiceNumber}: $${payment.amount} (${payment.status})`)
      })
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAndSetupBilling()