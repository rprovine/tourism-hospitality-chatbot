// Email service - SendGrid only
const FROM_EMAIL = process.env.EMAIL_FROM || 'LeniLani AI <noreply@lenilani.com>'

// Email templates
export const emailTemplates = {
  welcome: (name: string, email: string, tier: string) => ({
    subject: 'Welcome to LeniLani AI - Your Account is Ready!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0891b2 0%, #0c4a6e 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e5e5; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #0891b2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .feature-list { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .feature-list li { margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌺 Aloha ${name}!</h1>
            <p>Welcome to LeniLani AI</p>
          </div>
          <div class="content">
            <h2>Your ${tier} Account is Active!</h2>
            
            <p>Thank you for choosing LeniLani AI to transform your hospitality business. Your AI-powered chatbot is ready to start helping your guests 24/7.</p>
            
            <div class="feature-list">
              <h3>Your ${tier} Plan Includes:</h3>
              <ul>
                ${tier === 'starter' ? `
                  <li>✅ 500 conversations per month</li>
                  <li>✅ Basic analytics dashboard</li>
                  <li>✅ 50 knowledge base Q&As</li>
                  <li>✅ Email support</li>
                ` : tier === 'professional' ? `
                  <li>✅ 2,500 conversations per month</li>
                  <li>✅ 2 language support</li>
                  <li>✅ API access</li>
                  <li>✅ Priority 24/7 support</li>
                ` : tier === 'premium' ? `
                  <li>✅ 5 language support</li>
                  <li>✅ Custom AI training</li>
                  <li>✅ Dedicated account manager</li>
                  <li>✅ 99.9% SLA guarantee</li>
                ` : `
                  <li>✅ 30,000+ conversations per month</li>
                  <li>✅ Multi-property support</li>
                  <li>✅ Enterprise features</li>
                  <li>✅ White-glove service</li>
                `}
              </ul>
            </div>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" class="button">Access Your Dashboard</a>
            </center>
            
            <h3>Quick Start Guide:</h3>
            <ol>
              <li><strong>Login to your dashboard</strong> using your email: ${email}</li>
              <li><strong>Customize your chatbot</strong> with your brand colors and welcome message</li>
              <li><strong>Add knowledge base Q&As</strong> specific to your business</li>
              <li><strong>Copy the widget code</strong> and paste it on your website</li>
              <li><strong>Start chatting!</strong> Your AI assistant is ready</li>
            </ol>
            
            <p>Need help getting started? Reply to this email or visit our <a href="${process.env.NEXT_PUBLIC_APP_URL}/help">help center</a>.</p>
            
            <p>Mahalo,<br>The LeniLani AI Team</p>
          </div>
          <div class="footer">
            <p>© 2024 LeniLani Consulting. All rights reserved.</p>
            <p>You're receiving this email because you signed up for LeniLani AI.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  paymentSuccess: (name: string, tier: string, amount: string) => ({
    subject: 'Payment Confirmed - LeniLani AI',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e5e5; border-radius: 0 0 10px 10px; }
          .invoice { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #0891b2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Payment Successful!</h1>
          </div>
          <div class="content">
            <h2>Thank you for your payment, ${name}!</h2>
            
            <div class="invoice">
              <h3>Payment Details:</h3>
              <table style="width: 100%;">
                <tr>
                  <td><strong>Plan:</strong></td>
                  <td>${tier}</td>
                </tr>
                <tr>
                  <td><strong>Amount:</strong></td>
                  <td>${amount}/month</td>
                </tr>
                <tr>
                  <td><strong>Status:</strong></td>
                  <td>✅ Active</td>
                </tr>
                <tr>
                  <td><strong>Next billing:</strong></td>
                  <td>${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
                </tr>
              </table>
            </div>
            
            ${tier === 'starter' || tier === 'professional' ? `
              <h3>🚀 Your Chatbot is Ready!</h3>
              <p>Your AI assistant is now active and ready to be embedded on your website.</p>
              <center>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/widget" class="button">Get Your Widget Code</a>
              </center>
            ` : `
              <h3>🎯 Your Custom Setup Begins Now</h3>
              <p>Our team will contact you within 24 hours to begin your premium implementation.</p>
            `}
            
            <p>This receipt is for your records. You can view all invoices in your <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/billing">billing dashboard</a>.</p>
            
            <p>Questions about your payment? Contact billing@lenilani.com</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  passwordReset: (name: string, resetToken: string) => ({
    subject: 'Password Reset Request - LeniLani AI',
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
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            
            <p>We received a request to reset your password for your LeniLani AI account.</p>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}" class="button">Reset Your Password</a>
            </center>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="background: #f3f4f6; padding: 10px; word-break: break-all;">
              ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}
            </p>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul>
                <li>This link expires in 1 hour</li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Your password won't change until you create a new one</li>
              </ul>
            </div>
            
            <p>For security reasons, if you didn't make this request, please contact us immediately at security@lenilani.com</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  conversationLimitWarning: (name: string, used: number, limit: number) => ({
    subject: `⚠️ Approaching Conversation Limit - ${Math.round((used/limit)*100)}% Used`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e5e5; border-radius: 0 0 10px 10px; }
          .usage-bar { background: #e5e5e5; height: 30px; border-radius: 15px; overflow: hidden; margin: 20px 0; }
          .usage-fill { background: linear-gradient(90deg, #10b981 0%, #f59e0b 80%, #ef4444 100%); height: 100%; transition: width 0.3s; }
          .button { display: inline-block; padding: 12px 30px; background: #0891b2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Conversation Limit Alert</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            
            <p>Your Starter plan is approaching its monthly conversation limit.</p>
            
            <h3>Current Usage:</h3>
            <div class="usage-bar">
              <div class="usage-fill" style="width: ${Math.min((used/limit)*100, 100)}%"></div>
            </div>
            <p style="text-align: center; font-size: 24px; font-weight: bold;">
              ${used} / ${limit} conversations used (${Math.round((used/limit)*100)}%)
            </p>
            
            <p>You have <strong>${limit - used} conversations</strong> remaining this month.</p>
            
            <h3>💡 Upgrade to Professional for:</h3>
            <ul>
              <li>✅ 2,500 conversations per month</li>
              <li>✅ 2 language support</li>
              <li>✅ Advanced analytics</li>
              <li>✅ API access</li>
              <li>✅ Priority support</li>
            </ul>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/billing" class="button">Upgrade Now</a>
            </center>
            
            <p>Your limit will reset on ${new Date(new Date().setDate(1) + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}.</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
}

// Import SendGrid email service
async function sendEmailWithSendGrid(to: string, template: { subject: string; html: string }): Promise<any> {
  const { sendEmail } = await import('./sendgrid')
  return sendEmail(to, template)
}

// Send email function - SendGrid only
export async function sendEmail(to: string, template: { subject: string; html: string }) {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('📧 Email (dev mode - no SendGrid key):', { to, subject: template.subject })
      return { success: true, messageId: 'dev-mode' }
    }

    return await sendEmailWithSendGrid(to, template)
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

// Convenience functions
export async function sendWelcomeEmail(email: string, name: string, tier: string) {
  return sendEmail(email, emailTemplates.welcome(name, email, tier))
}

export async function sendPaymentSuccessEmail(email: string, name: string, tier: string, amount: string) {
  return sendEmail(email, emailTemplates.paymentSuccess(name, tier, amount))
}

export async function sendPasswordResetEmail(email: string, name: string, resetToken: string) {
  return sendEmail(email, emailTemplates.passwordReset(name, resetToken))
}

export async function sendConversationLimitWarning(email: string, name: string, used: number, limit: number) {
  // Only send warning at 80% usage
  if (used < limit * 0.8) return { success: false, reason: 'Below threshold' }
  
  return sendEmail(email, emailTemplates.conversationLimitWarning(name, used, limit))
}