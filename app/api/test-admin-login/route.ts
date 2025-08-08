import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  const prisma = new PrismaClient()
  
  try {
    // Test if admin exists and password works
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: 'admin@lenilani.com' }
    })
    
    if (!adminUser) {
      return NextResponse.json({ 
        error: 'Admin user not found',
        suggestion: 'Run /api/seed-admin?key=create-admin-2024 to create admin'
      })
    }
    
    // Test password
    const testPassword = 'Admin@2024!'
    const isValid = await bcrypt.compare(testPassword, adminUser.password)
    
    return NextResponse.json({
      adminExists: true,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      passwordValid: isValid,
      passwordHash: adminUser.password.substring(0, 20) + '...',
      createdAt: adminUser.createdAt,
      updatedAt: adminUser.updatedAt
    })
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Database error',
      message: error.message
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}