import { Resend } from 'resend'
import { emailTemplates } from './mailer'

// Initialize Resend if API key exists
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM_EMAIL = process.env.EMAIL_FROM || 'LeniLani AI <noreply@lenilani.com>'

export async function sendEmailWithResend(
  to: string,
  template: { subject: string; html: string }
) {
  try {
    if (!resend || !process.env.RESEND_API_KEY) {
      console.log('📧 Resend not configured. Email would be sent to:', to)
      console.log('Subject:', template.subject)
      return { success: true, messageId: 'dev-mode', provider: 'resend-dev' }
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: template.subject,
      html: template.html
    })

    if (error) {
      console.error('Resend error:', error)
      return {
        success: false,
        error: error.message,
        provider: 'resend'
      }
    }
    
    return {
      success: true,
      messageId: data?.id,
      provider: 'resend'
    }
  } catch (error: any) {
    console.error('Resend error:', error)
    
    return {
      success: false,
      error: error.message,
      provider: 'resend'
    }
  }
}

// Unified email service that uses Resend first, then falls back to SendGrid, then SMTP
export async function sendEmail(
  to: string,
  template: { subject: string; html: string }
) {
  // Try Resend first if configured
  if (process.env.RESEND_API_KEY) {
    return sendEmailWithResend(to, template)
  }
  
  // Fall back to SendGrid if configured
  if (process.env.SENDGRID_API_KEY) {
    const { sendEmailWithSendGrid } = await import('./sendgrid')
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
            
            <p>Questions? Reply to this email or chat with our support team at info@lenilani.com</p>
            
            <p>Mahalo,<br>The LeniLani AI Team</p>
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
            
            <p>Mahalo,<br>The LeniLani AI Team</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
  
  return sendEmail(email, template)
}

export async function sendAccountCancelledEmail(
  email: string,
  name: string,
  tier: string,
  endDate: Date
) {
  const template = {
    subject: '👋 Your LeniLani AI subscription has been cancelled',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6b7280; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e5e5; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #0891b2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .info-box { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>👋 Subscription Cancelled</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            
            <p>We're sorry to see you go! Your LeniLani AI ${tier} subscription has been cancelled as requested.</p>
            
            <div class="info-box">
              <h3>What happens next:</h3>
              <ul>
                <li>✅ You'll keep access until ${endDate.toLocaleDateString()}</li>
                <li>📱 Your chatbot will continue working until then</li>
                <li>📊 You can still access your analytics dashboard</li>
                <li>💾 Your data will be preserved for 30 days</li>
              </ul>
            </div>
            
            <p>Changed your mind? You can reactivate your subscription anytime before ${endDate.toLocaleDateString()}.</p>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/billing" class="button">Reactivate Subscription</a>
            </center>
            
            <p>We'd love to hear your feedback about why you're leaving. Reply to this email and let us know how we can improve.</p>
            
            <p>Mahalo for using LeniLani AI!<br>The LeniLani AI Team</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
  
  return sendEmail(email, template)
}