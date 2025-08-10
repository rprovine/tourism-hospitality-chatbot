import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configure database URL with pooler settings
const getDatabaseUrl = () => {
  let dbUrl = process.env.DATABASE_URL || ''
  
  // Add pgbouncer parameter if not already present for Supabase pooler
  if (dbUrl && !dbUrl.includes('pgbouncer') && dbUrl.includes('pooler.supabase.com')) {
    const separator = dbUrl.includes('?') ? '&' : '?'
    dbUrl = dbUrl + separator + 'pgbouncer=true&connection_limit=1'
  }
  
  return dbUrl
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  }
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma