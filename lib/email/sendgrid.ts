import sgMail from '@sendgrid/mail'
import { emailTemplates } from './mailer'

// Initialize SendGrid if API key exists
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@lenilani.com'
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'LeniLani AI'

export async function sendEmailWithSendGrid(
  to: string,
  template: { subject: string; html: string }
) {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('📧 SendGrid not configured. Email would be sent to:', to)
      console.log('Subject:', template.subject)
      return { success: true, messageId: 'dev-mode' }
    }

    const msg = {
      to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME
      },
      subject: template.subject,
      html: template.html,
    }

    const [response] = await sgMail.send(msg)
    
    return {
      success: true,
      messageId: response.headers['x-message-id'],
      provider: 'sendgrid'
    }
  } catch (error: any) {
    console.error('SendGrid error:', error)
    
    if (error.response) {
      console.error('SendGrid error details:', error.response.body)
    }
    
    return {
      success: false,
      error: error.message,
      provider: 'sendgrid'
    }
  }
}

// Unified email service that tries SendGrid first, then falls back to SMTP
export async function sendEmail(
  to: string,
  template: { subject: string; html: string }
) {
  // Try SendGrid first if configured
  if (process.env.SENDGRID_API_KEY) {
    return sendEmailWithSendGrid(to, template)
  }
  
  // Fall back to SMTP (Nodemailer)
  if (process.env.SMTP_USER) {
    const { sendEmail: sendWithNodemailer } = await import('./mailer')
    return sendWithNodemailer(to, template)
  }
  
  // Development mode - just log
  console.log('📧 Email (dev mode):', {
    to,
    subject: template.subject,
    preview: template.html.substring(0, 200) + '...'
  })
  
  return { success: true, messageId: 'dev-mode', provider: 'none' }
}

// Export convenience functions
export async function sendWelcomeEmail(email: string, name: string, tier: string) {
  return sendEmail(email, emailTemplates.welcome(name, email, tier))
}

export async function sendPaymentSuccessEmail(
  email: string,
  name: string,
  tier: string,
  amount: string
) {
  return sendEmail(email, emailTemplates.paymentSuccess(name, tier, amount))
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string
) {
  return sendEmail(email, emailTemplates.passwordReset(name, resetToken))
}

export async function sendConversationLimitWarning(
  email: string,
  name: string,
  used: number,
  limit: number
) {
  // Only send warning at 80% usage
  if (used < limit * 0.8) {
    return { success: false, reason: 'Below threshold' }
  }
  
  return sendEmail(email, emailTemplates.conversationLimitWarning(name, used, limit))
}

// New email templates for billing
export async function sendTrialEndingEmail(
  email: string,
  name: string,
  tier: string,
  daysLeft: number
) {
  const template = {
    subject: `⏰ Your LeniLani AI trial ends in ${daysLeft} days`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e5e5; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #0891b2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .pricing { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Trial Ending Soon</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            
            <p>Your 14-day free trial of LeniLani AI ${tier} plan ends in <strong>${daysLeft} days</strong>.</p>
            
            <p>Don't lose access to your AI chatbot! Subscribe now to keep serving your guests 24/7.</p>
            
            <div class="pricing">
              <h3>Continue with ${tier} Plan</h3>
              ${tier === 'professional' ? '<p><s>$899</s> <strong>$699/month</strong> - Limited time offer!</p>' : ''}
              ${tier === 'starter' ? '<p><strong>$299/month</strong> or $2,390/year (save $598)</p>' : ''}
              ${tier === 'premium' ? '<p><strong>$2,499/month</strong> or $22,490/year (save $7,498)</p>' : ''}
            </div>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/billing" class="button">Subscribe Now</a>
            </center>
            
            <p>Questions? Reply to this email or chat with our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
  
  return sendEmail(email, template)
}

export async function sendBillingFailedEmail(
  email: string,
  name: string,
  tier: string
) {
  const template = {
    subject: '❌ Payment Failed - Action Required',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e5e5; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #ef4444; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Payment Failed</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            
            <p>We were unable to process your payment for your LeniLani AI ${tier} subscription.</p>
            
            <div class="warning">
              <strong>⚠️ Your service will be suspended in 3 days if payment is not updated.</strong>
            </div>
            
            <p>Please update your payment method to avoid any interruption to your AI chatbot service.</p>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/billing" class="button">Update Payment Method</a>
            </center>
            
            <p>If you believe this is an error, please contact billing@lenilani.com immediately.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
  
  return sendEmail(email, template)
}