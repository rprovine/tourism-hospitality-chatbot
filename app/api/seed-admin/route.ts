import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// This endpoint creates the master admin account
export async function GET(request: NextRequest) {
  // Security check
  const seedKey = request.nextUrl.searchParams.get('key')
  if (seedKey !== 'create-admin-2024') {
    return NextResponse.json({ error: 'Invalid seed key' }, { status: 401 })
  }

  const prisma = new PrismaClient()
  
  try {
    await prisma.$connect()
    
    // Create or update admin user
    const adminEmail = 'admin@lenilani.com'
    const adminPassword = 'Admin@2024!' // Strong password
    
    // Check if admin exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: adminEmail }
    })
    
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    
    if (existingAdmin) {
      // Update admin password
      await prisma.adminUser.update({
        where: { email: adminEmail },
        data: { 
          password: hashedPassword,
          name: 'Master Admin',
          role: 'super_admin'
        }
      })
      
      return NextResponse.json({
        success: true,
        message: 'Admin account updated',
        credentials: {
          email: adminEmail,
          password: adminPassword,
          note: 'This is your master admin account. Please change the password after first login!'
        }
      })
    } else {
      // Create new admin
      await prisma.adminUser.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: 'Master Admin',
          role: 'super_admin'
        }
      })
      
      return NextResponse.json({
        success: true,
        message: 'Admin account created',
        credentials: {
          email: adminEmail,
          password: adminPassword,
          note: 'This is your master admin account. Please change the password after first login!'
        }
      })
    }
    
  } catch (error: any) {
    console.error('Admin seed error:', error)
    return NextResponse.json(
      { error: 'Failed to create admin account', details: error.message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}