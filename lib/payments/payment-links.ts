// HubSpot Payment Link Configuration
// Replace these URLs with your actual HubSpot payment links

export const PAYMENT_LINKS = {
  // Monthly Plans
  starter_monthly: {
    url: 'https://app-na2.hubspot.com/payments/GGGZKG9b2jt7vtZ7?referrer=PAYMENT_LINK',
    amount: 29,
    interval: 'monthly'
  },
  professional_monthly: {
    url: 'PASTE_YOUR_PROFESSIONAL_MONTHLY_LINK_HERE',
    amount: 149,
    interval: 'monthly'
  },
  premium_monthly: {
    url: 'PASTE_YOUR_PREMIUM_MONTHLY_LINK_HERE',
    amount: 299,
    interval: 'monthly'
  },
  enterprise_monthly: {
    url: 'CUSTOM_QUOTE', // Special handling for enterprise
    amount: 999,
    interval: 'monthly'
  },
  
  // Yearly Plans (create these if you have them, or we can calculate discount)
  starter_yearly: {
    url: 'PASTE_YOUR_STARTER_YEARLY_LINK_HERE', // Or use monthly link with note about annual billing
    amount: 290,
    interval: 'yearly'
  },
  professional_yearly: {
    url: 'PASTE_YOUR_PROFESSIONAL_YEARLY_LINK_HERE',
    amount: 1490,
    interval: 'yearly'
  },
  premium_yearly: {
    url: 'PASTE_YOUR_PREMIUM_YEARLY_LINK_HERE',
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