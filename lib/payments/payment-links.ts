// HubSpot Payment Link Configuration
// Replace these URLs with your actual HubSpot payment links

export const PAYMENT_LINKS = {
  // Monthly Plans
  starter_monthly: {
    url: 'https://app-na2.hubspot.com/payments/GGGZKG9b2jt7vtZ7?referrer=PAYMENT_LINK',
    amount: 29,
    interval: 'monthly',
    trialDays: 14,
    trialText: '14-day free trial'
  },
  professional_monthly: {
    url: 'https://app-na2.hubspot.com/payments/zXbRjHGbPfr?referrer=PAYMENT_LINK',
    amount: 149,
    interval: 'monthly',
    trialDays: 14,
    trialText: '14-day free trial'
  },
  premium_monthly: {
    url: 'https://app-na2.hubspot.com/payments/fmmQJJHmxtnTJPt?referrer=PAYMENT_LINK',
    amount: 299,
    interval: 'monthly',
    trialDays: 30,
    trialText: '30-day money-back guarantee'
  },
  enterprise_monthly: {
    url: 'CUSTOM_QUOTE', // Special handling for enterprise
    amount: 999,
    interval: 'monthly'
  },
  
  // Yearly Plans with discounts
  starter_yearly: {
    url: 'https://app-na2.hubspot.com/payments/FXTWhqGsWc4sMw?referrer=PAYMENT_LINK',
    amount: 290,
    interval: 'yearly',
    trialDays: 14,
    trialText: '14-day free trial + Save $58/year'
  },
  professional_yearly: {
    url: 'https://app-na2.hubspot.com/payments/GPz7Y4zvWDPV4Wjy?referrer=PAYMENT_LINK',
    amount: 1490,
    interval: 'yearly',
    trialDays: 14,
    trialText: '14-day free trial + Save $298/year'
  },
  premium_yearly: {
    url: 'https://app-na2.hubspot.com/payments/wQcwWQrtYdV?referrer=PAYMENT_LINK',
    amount: 2990,
    interval: 'yearly',
    trialDays: 30,
    trialText: '30-day guarantee + Save $598/year'
  }
}

// Generate checkout URL based on payment link configuration
export function getCheckoutUrl(planId: string, email?: string, businessName?: string) {
  const link = PAYMENT_LINKS[planId as keyof typeof PAYMENT_LINKS]
  
  if (!link) {
    throw new Error(`Invalid plan ID: ${planId}`)
  }
  
  // Handle enterprise custom quote
  if (link.url === 'CUSTOM_QUOTE') {
    return `/contact-sales?plan=enterprise&email=${email}&business=${businessName}`
  }
  
  // If URL is not configured yet, show a placeholder page
  if (link.url.includes('PASTE_YOUR')) {
    console.warn(`Payment link not configured for ${planId}`)
    return `/payment-setup-required?plan=${planId}`
  }
  
  // For HubSpot or Stripe payment links, we can append parameters
  const url = new URL(link.url)
  
  // Add email and business name as URL parameters if the payment provider supports it
  if (email) {
    url.searchParams.append('prefilled_email', email)
    url.searchParams.append('email', email) // Some providers use 'email'
  }
  
  if (businessName) {
    url.searchParams.append('client_reference_id', businessName)
    url.searchParams.append('company', businessName) // HubSpot might use 'company'
  }
  
  return url.toString()
}