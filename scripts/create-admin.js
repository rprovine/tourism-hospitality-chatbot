const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('Creating admin user...')
    
    // Check if admin already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: 'admin@lenilani.com' }
    })
    
    if (existingAdmin) {
      console.log('Admin user already exists')
      return
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('LeniLani2025!', 10)
    
    const admin = await prisma.adminUser.create({
      data: {
        email: 'admin@lenilani.com',
        password: hashedPassword,
        name: 'LeniLani Admin',
        role: 'super_admin'
      }
    })
    
    console.log('Admin user created successfully:')
    console.log('Email: admin@lenilani.com')
    console.log('Password: LeniLani2025!')
    console.log('ID:', admin.id)
    
  } catch (error) {
    console.error('Error creating admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()