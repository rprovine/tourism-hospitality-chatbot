# HubSpot Integration Setup Guide

## Overview
This guide will help you set up HubSpot CRM and Payments integration for the Tourism & Hospitality Chatbot platform.

## Prerequisites
- HubSpot account (Professional or Enterprise tier recommended)
- HubSpot Payments enabled (US businesses only currently)
- Admin access to HubSpot portal

## Step 1: Create HubSpot Private App

1. Go to **Settings** > **Integrations** > **Private Apps**
2. Click **Create a private app**
3. Name it: "Tourism Chatbot Integration"
4. Add these scopes:
   - **CRM**:
     - `crm.objects.contacts.read`
     - `crm.objects.contacts.write`
     - `crm.objects.deals.read`
     - `crm.objects.deals.write`
     - `crm.objects.companies.read`
     - `crm.objects.companies.write`
   - **Commerce**:
     - `e-commerce` (all subscopes)
   - **Webhooks**:
     - `webhooks` (for payment notifications)

5. Copy the **Access Token**

## Step 2: Configure Environment Variables

Add these to your `.env.local` file:

```env
# HubSpot Configuration
HUBSPOT_ACCESS_TOKEN=pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
HUBSPOT_PORTAL_ID=12345678
HUBSPOT_PAYMENT_LINK_ID=payment_link_id_here
HUBSPOT_WEBHOOK_SECRET=your_webhook_secret_here
```

## Step 3: Set Up HubSpot Payments

### Create Payment Links
1. Go to **Commerce** > **Payment Links**
2. Create payment links for each tier:

#### Starter Plan ($29/month)
- Name: "Starter Plan - Monthly"
- Amount: $29
- Recurring: Monthly
- Product: Tourism Chatbot - Starter

#### Professional Plan ($149/month)
- Name: "Professional Plan - Monthly"
- Amount: $149
- Recurring: Monthly
- Product: Tourism Chatbot - Professional

#### Premium Plan ($299/month)
- Name: "Premium Plan - Monthly"
- Amount: $299
- Recurring: Monthly
- Product: Tourism Chatbot - Premium

3. Copy each Payment Link ID

## Step 4: Create Custom Properties

In HubSpot, create these custom contact properties:

1. **subscription_tier** (Dropdown)
   - Options: starter, professional, premium, enterprise
   
2. **subscription_status** (Dropdown)
   - Options: active, cancelled, expired, pending

3. **subscription_id** (Single-line text)

4. **subscription_start_date** (Date picker)

5. **subscription_end_date** (Date picker)

6. **chatbot_api_key** (Single-line text)

## Step 5: Set Up Webhooks

1. Go to **Settings** > **Integrations** > **Webhooks**
2. Create webhook subscription:
   - URL: `https://your-domain.vercel.app/api/payments/webhook`
   - Events:
     - Deal created
     - Deal updated
     - Contact updated
   - Properties to include:
     - All custom properties created above
     - Email, Company, Deal Amount

## Step 6: Configure Workflows

### Workflow 1: New Subscription
Trigger: Deal stage = "Closed Won"
Actions:
1. Update contact property `subscription_status` = "active"
2. Send welcome email
3. Create task for onboarding

### Workflow 2: Subscription Cancellation
Trigger: Contact property `subscription_status` = "cancelled"
Actions:
1. Send cancellation confirmation
2. Update deal stage
3. Create task for win-back campaign

## Step 7: Test Integration

### Test Checkout Flow:
```bash
# Local testing
npm run dev

# Visit
http://localhost:3000/checkout?plan=starter&interval=monthly
```

### Test Webhook:
```bash
curl -X POST http://localhost:3000/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "test-123",
    "contactId": "contact-456",
    "status": "active",
    "planId": "starter_monthly"
  }'
```

## Step 8: Production Deployment

1. Add all environment variables to Vercel:
   - Go to Vercel Dashboard > Settings > Environment Variables
   - Add all HubSpot variables

2. Update webhook URLs in HubSpot to production domain

3. Test with a real payment (can refund after)

## Pricing Tiers

| Tier | Monthly | Yearly | Conversations | AI Model |
|------|---------|--------|--------------|----------|
| Starter | $29 | $290 | 1,000/mo | Claude Haiku |
| Professional | $149 | $1,490 | 5,000/mo | Claude + GPT-4 |
| Premium | $299 | $2,990 | Unlimited | Dual AI + Learning |
| Enterprise | $999+ | Custom | Unlimited | Custom Blend |

## Troubleshooting

### Payment Link Not Working
- Ensure HubSpot Payments is activated
- Check that payment link IDs are correct
- Verify domain is whitelisted in HubSpot

### Webhooks Not Receiving
- Check webhook secret matches
- Verify URL is publicly accessible
- Check HubSpot webhook logs

### Contact Not Syncing
- Verify API token has correct scopes
- Check rate limits (100 requests/10 seconds)
- Ensure email is valid format

## Support

For HubSpot-specific issues:
- HubSpot Support: support.hubspot.com
- API Documentation: developers.hubspot.com

For integration issues:
- Create issue on GitHub repository
- Contact support@yourdomain.com