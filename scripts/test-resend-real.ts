import { sendWelcomeEmail, sendEmail } from '../lib/email/resend'

async function testResendEmailReal() {
  console.log('Testing Resend email service with real email...')
  
  // Test basic email to verified address
  const testResult = await sendEmail('rprovine@gmail.com', {
    subject: 'Test Email from LeniLani AI',
    html: `
      <h1>Test Email</h1>
      <p>This is a test email sent from the LeniLani AI system using Resend.</p>
      <p>Time: ${new Date().toISOString()}</p>
      <p>✅ Resend integration is working!</p>
    `
  })
  
  console.log('Basic email test result:', testResult)
  
  // Test welcome email template
  const welcomeResult = await sendWelcomeEmail(
    'rprovine@gmail.com',
    'Reno Provine',
    'starter'
  )
  
  console.log('Welcome email test result:', welcomeResult)
  
  if (testResult.success && welcomeResult.success) {
    console.log('✅ Resend email service is working correctly!')
    console.log('📧 Check rprovine@gmail.com for test emails')
  } else {
    console.log('❌ There were issues with the email service')
  }
}

testResendEmailReal().catch(console.error)