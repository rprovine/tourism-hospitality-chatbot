// Environment variable validation
// This ensures all required environment variables are present at startup

export interface RequiredEnvVars {
  // Database
  DATABASE_URL: string
  
  // Authentication
  JWT_SECRET: string
  
  // AI/Claude API
  ANTHROPIC_API_KEY: string
  
  // HubSpot Integration (optional but recommended)
  HUBSPOT_ACCESS_TOKEN?: string
  HUBSPOT_PORTAL_ID?: string
  HUBSPOT_WEBHOOK_SECRET?: string
  
  // Application
  NEXT_PUBLIC_APP_URL?: string
  NEXT_PUBLIC_BASE_URL?: string
}

export function validateEnv(): { valid: boolean; missing: string[]; warnings: string[] } {
  const missing: string[] = []
  const warnings: string[] = []
  
  // Required variables
  if (!process.env.DATABASE_URL) {
    missing.push('DATABASE_URL')
  }
  
  if (!process.env.JWT_SECRET) {
    missing.push('JWT_SECRET')
  }
  
  if (!process.env.ANTHROPIC_API_KEY) {
    missing.push('ANTHROPIC_API_KEY')
  }
  
  // Recommended variables (warnings only)
  if (!process.env.HUBSPOT_ACCESS_TOKEN) {
    warnings.push('HUBSPOT_ACCESS_TOKEN - Payment processing will not work')
  }
  
  if (!process.env.HUBSPOT_PORTAL_ID) {
    warnings.push('HUBSPOT_PORTAL_ID - HubSpot integration will not work')
  }
  
  if (!process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_BASE_URL) {
    warnings.push('NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_BASE_URL - Widget embedding may not work correctly')
  }
  
  // Security warnings
  if (process.env.JWT_SECRET === 'your-secret-key-here') {
    warnings.push('JWT_SECRET is using the default value - this is insecure!')
  }
  
  if (process.env.NODE_ENV === 'production') {
    // Production-specific checks
    if (!process.env.HUBSPOT_ACCESS_TOKEN) {
      missing.push('HUBSPOT_ACCESS_TOKEN - Required for production')
    }
    
    if (!process.env.HUBSPOT_WEBHOOK_SECRET) {
      warnings.push('HUBSPOT_WEBHOOK_SECRET - Webhook verification disabled')
    }
    
    if (process.env.DATABASE_URL?.includes('file:')) {
      warnings.push('DATABASE_URL - Using SQLite in production is not recommended')
    }
  }
  
  return {
    valid: missing.length === 0,
    missing,
    warnings
  }
}

export function getEnvReport(): string {
  const validation = validateEnv()
  let report = '🔍 Environment Variable Check\n'
  report += '============================\n\n'
  
  if (validation.valid) {
    report += '✅ All required environment variables are set!\n\n'
  } else {
    report += '❌ Missing required environment variables:\n'
    validation.missing.forEach(varName => {
      report += `   - ${varName}\n`
    })
    report += '\n'
  }
  
  if (validation.warnings.length > 0) {
    report += '⚠️  Warnings:\n'
    validation.warnings.forEach(warning => {
      report += `   - ${warning}\n`
    })
    report += '\n'
  }
  
  report += 'Current Environment:\n'
  report += `   - NODE_ENV: ${process.env.NODE_ENV || 'development'}\n`
  report += `   - Database: ${process.env.DATABASE_URL ? 'Configured' : 'Not configured'}\n`
  report += `   - Claude API: ${process.env.ANTHROPIC_API_KEY ? 'Configured' : 'Not configured'}\n`
  report += `   - HubSpot: ${process.env.HUBSPOT_ACCESS_TOKEN ? 'Configured' : 'Not configured'}\n`
  
  return report
}

// Sample .env.example file content
export const envExample = `# Database
DATABASE_URL="file:./dev.db"  # For development
# DATABASE_URL="postgresql://user:password@localhost:5432/dbname"  # For production

# Authentication
JWT_SECRET="your-secure-random-string-here"  # Generate with: openssl rand -base64 32

# Claude AI API
ANTHROPIC_API_KEY="sk-ant-..."  # Get from https://console.anthropic.com

# HubSpot Integration (Required for payments)
HUBSPOT_ACCESS_TOKEN="pat-..."  # Private app access token
HUBSPOT_PORTAL_ID="12345678"  # Your HubSpot portal ID
HUBSPOT_WEBHOOK_SECRET="your-webhook-secret"  # For webhook verification

# Application URLs
NEXT_PUBLIC_APP_URL="https://your-domain.com"  # Your production URL
NEXT_PUBLIC_BASE_URL="https://your-domain.com"  # Same as above

# Optional
NODE_ENV="production"  # Set to "production" in production
`

// Function to check env on startup
export function checkEnvOnStartup() {
  const validation = validateEnv()
  
  if (!validation.valid) {
    console.error('\n❌ Environment configuration error!')
    console.error('Missing required environment variables:')
    validation.missing.forEach(varName => {
      console.error(`   - ${varName}`)
    })
    console.error('\nPlease set these variables in your .env file')
    console.error('See .env.example for reference\n')
    
    if (process.env.NODE_ENV === 'production') {
      // In production, exit if required vars are missing
      process.exit(1)
    }
  }
  
  if (validation.warnings.length > 0) {
    console.warn('\n⚠️  Environment warnings:')
    validation.warnings.forEach(warning => {
      console.warn(`   - ${warning}`)
    })
    console.warn('')
  }
}