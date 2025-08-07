// HubSpot Payment Link Configuration
// Update these IDs after creating payment links in HubSpot

export const PAYMENT_LINKS = {
  // Monthly Plans
  starter_monthly: {
    hubspotId: 'REPLACE_WITH_STARTER_MONTHLY_ID',
    stripeUrl: '', // If using Stripe through HubSpot
    amount: 29,
    interval: 'monthly'
  },
  professional_monthly: {
    hubspotId: 'REPLACE_WITH_PROFESSIONAL_MONTHLY_ID',
    stripeUrl: '',
    amount: 149,
    interval: 'monthly'
  },
  premium_monthly: {
    hubspotId: 'REPLACE_WITH_PREMIUM_MONTHLY_ID',
    stripeUrl: '',
    amount: 299,
    interval: 'monthly'
  },
  enterprise_monthly: {
    hubspotId: 'CUSTOM_QUOTE', // Special handling for enterprise
    stripeUrl: '',
    amount: 999,
    interval: 'monthly'
  },
  
  // Yearly Plans
  starter_yearly: {
    hubspotId: 'REPLACE_WITH_STARTER_YEARLY_ID',
    stripeUrl: '',
    amount: 290,
    interval: 'yearly'
  },
  professional_yearly: {
    hubspotId: 'REPLACE_WITH_PROFESSIONAL_YEARLY_ID',
    stripeUrl: '',
    amount: 1490,
    interval: 'yearly'
  },
  premium_yearly: {
    hubspotId: 'REPLACE_WITH_PREMIUM_YEARLY_ID',
    stripeUrl: '',
    amount: 2990,
    interval: 'yearly'
  }
}

// Generate checkout URL based on payment link configuration
export function getCheckoutUrl(planId: string, email?: string, businessName?: string) {
  const link = PAYMENT_LINKS[planId as keyof typeof PAYMENT_LINKS]
  
  if (!link) {
    throw new Error(`Invalid plan ID: ${planId}`)
  }
  
  // Handle enterprise custom quote
  if (link.hubspotId === 'CUSTOM_QUOTE') {
    return `/contact-sales?plan=enterprise&email=${email}&business=${businessName}`
  }
  
  // If Stripe URL is configured, use it
  if (link.stripeUrl) {
    const params = new URLSearchParams()
    if (email) params.append('prefilled_email', email)
    if (businessName) params.append('client_reference_id', businessName)
    return `${link.stripeUrl}?${params.toString()}`
  }
  
  // Use HubSpot payment link
  const portalId = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID || process.env.HUBSPOT_PORTAL_ID
  const baseUrl = `https://app.hubspot.com/payments/checkout/${portalId}/${link.hubspotId}`
  
  const params = new URLSearchParams()
  if (email) params.append('email', email)
  if (businessName) params.append('company', businessName)
  
  return `${baseUrl}?${params.toString()}`
}