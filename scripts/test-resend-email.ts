import { sendWelcomeEmail, sendEmail } from '../lib/email/resend'

async function testResendEmail() {
  console.log('Testing Resend email service...')
  
  // Test basic email
  const testResult = await sendEmail('test@example.com', {
    subject: 'Test Email from LeniLani AI',
    html: `
      <h1>Test Email</h1>
      <p>This is a test email sent from the LeniLani AI system using Resend.</p>
      <p>Time: ${new Date().toISOString()}</p>
    `
  })
  
  console.log('Basic email test result:', testResult)
  
  // Test welcome email template
  const welcomeResult = await sendWelcomeEmail(
    'test@example.com',
    'Test User',
    'starter'
  )
  
  console.log('Welcome email test result:', welcomeResult)
  
  if (testResult.success && welcomeResult.success) {
    console.log('✅ Resend email service is working correctly!')
  } else {
    console.log('❌ There were issues with the email service')
  }
}

testResendEmail().catch(console.error)