import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    
    // Find the business
    const business = await prisma.business.findUnique({
      where: { email }
    })
    
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }
    
    // Delete all related data
    const deleteResults = {
      messages: 0,
      conversations: 0,
      knowledgeBase: 0,
      guestProfiles: 0
    }
    
    // Delete all messages (must be done before conversations)
    const conversations = await prisma.conversation.findMany({
      where: { businessId: business.id }
    })
    
    for (const conv of conversations) {
      const deleted = await prisma.message.deleteMany({
        where: { conversationId: conv.id }
      })
      deleteResults.messages += deleted.count
    }
    
    // Delete all conversations
    const deletedConversations = await prisma.conversation.deleteMany({
      where: { businessId: business.id }
    })
    deleteResults.conversations = deletedConversations.count
    
    // Delete all knowledge base entries
    const deletedKB = await prisma.knowledgeBase.deleteMany({
      where: { businessId: business.id }
    })
    deleteResults.knowledgeBase = deletedKB.count
    
    // Delete all guest profiles
    const deletedGuests = await prisma.guestProfile.deleteMany({
      where: { businessId: business.id }
    })
    deleteResults.guestProfiles = deletedGuests.count
    
    return NextResponse.json({
      success: true,
      message: `All data cleaned for ${email}`,
      deleted: deleteResults
    })
    
  } catch (error: any) {
    console.error('Clean account error:', error)
    return NextResponse.json(
      { error: 'Failed to clean account data', details: error.message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// GET method to clean specific account directly
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')
  
  // Security check - only allow specific emails for now
  if (email !== 'shaypro2000@gmail.com') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  return POST(new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ email })
  }))
}