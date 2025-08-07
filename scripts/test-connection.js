const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  console.log('Testing database connections...\n')
  
  // Test different connection strings
  const connections = [
    {
      name: 'Pooler Connection',
      url: 'postgresql://postgres.hoybtqhautslrjxrlffs:Chi3ft%40n5527@aws-0-us-west-1.pooler.supabase.com:5432/postgres'
    },
    {
      name: 'Direct Connection',
      url: 'postgresql://postgres:Chi3ft%40n5527@db.hoybtqhautslrjxrlffs.supabase.co:5432/postgres'
    },
    {
      name: 'Direct with SSL',
      url: 'postgresql://postgres:Chi3ft%40n5527@db.hoybtqhautslrjxrlffs.supabase.co:5432/postgres?sslmode=require'
    }
  ]
  
  for (const conn of connections) {
    console.log(`Testing: ${conn.name}`)
    console.log(`URL: ${conn.url.replace(/Chi3ft%40n5527/, '[PASSWORD]')}\n`)
    
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: conn.url
        }
      }
    })
    
    try {
      const startTime = Date.now()
      await prisma.$connect()
      const endTime = Date.now()
      
      console.log(`✅ Connection successful (${endTime - startTime}ms)`)
      
      // Try a simple query
      const count = await prisma.business.count()
      console.log(`   Found ${count} businesses in database`)
      
      await prisma.$disconnect()
    } catch (error) {
      console.log(`❌ Connection failed: ${error.message}`)
    }
    
    console.log('-'.repeat(60) + '\n')
  }
}

testConnection().catch(console.error)