import bcrypt from 'bcryptjs'

const API_URL = 'http://localhost:3000'

async function testDemoLogin(email: string, password: string) {
  console.log(`\n🔑 Testing login for: ${email}`)
  console.log('-'.repeat(40))
  
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
    
    const data = await response.json()
    
    if (response.ok && data.token) {
      console.log(`✅ Login successful!`)
      console.log(`   Business: ${data.business.name}`)
      console.log(`   Tier: ${data.business.tier}`)
      console.log(`   Status: ${data.business.subscriptionStatus}`)
      
      // Test accessing a protected route
      const dashboardResponse = await fetch(`${API_URL}/api/analytics`, {
        headers: {
          'Authorization': `Bearer ${data.token}`
        }
      })
      
      if (dashboardResponse.ok) {
        console.log(`   ✅ Can access dashboard`)
      } else {
        console.log(`   ❌ Cannot access dashboard: ${dashboardResponse.status}`)
      }
      
      return true
    } else {
      console.log(`❌ Login failed: ${data.error || 'Unknown error'}`)
      return false
    }
  } catch (error: any) {
    console.log(`❌ Error: ${error.message}`)
    return false
  }
}

async function testAllDemoAccounts() {
  console.log('🧪 Testing All Demo Account Logins')
  console.log('='.repeat(60))
  
  const accounts = [
    { email: 'starter@demo.com', password: 'demo123', expectedTier: 'starter' },
    { email: 'professional@demo.com', password: 'demo123', expectedTier: 'professional' },
    { email: 'premium@demo.com', password: 'demo123', expectedTier: 'premium' },
    { email: 'enterprise@demo.com', password: 'demo123', expectedTier: 'enterprise' }
  ]
  
  let successCount = 0
  let failCount = 0
  
  // Check if server is running
  try {
    const healthCheck = await fetch(`${API_URL}/api/health`)
    if (!healthCheck.ok) {
      console.log('❌ Server is not responding properly')
      console.log('Please make sure the dev server is running: npm run dev')
      process.exit(1)
    }
  } catch (error) {
    console.log('❌ Cannot connect to server at http://localhost:3000')
    console.log('Please start the dev server with: npm run dev')
    process.exit(1)
  }
  
  for (const account of accounts) {
    const success = await testDemoLogin(account.email, account.password)
    if (success) {
      successCount++
    } else {
      failCount++
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 TEST RESULTS')
  console.log('='.repeat(60))
  console.log(`✅ Successful logins: ${successCount}`)
  console.log(`❌ Failed logins: ${failCount}`)
  console.log('='.repeat(60))
  
  if (failCount === 0) {
    console.log('\n🎉 All demo accounts are working correctly!')
    console.log('\nYou can now test the application with different tier features:')
    console.log('  • Starter: Basic features only')
    console.log('  • Professional: + CRM/Booking integrations')
    console.log('  • Premium: + Revenue optimization, VIP tracking')
    console.log('  • Enterprise: + Multi-property, custom features')
  } else {
    console.log('\n⚠️  Some accounts failed to log in. Check the errors above.')
    process.exit(1)
  }
}

// Run the test
testAllDemoAccounts().catch(console.error)