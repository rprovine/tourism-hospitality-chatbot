-- Create GuestProfile table for storing guest preferences and history
CREATE TABLE IF NOT EXISTS "GuestProfile" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "name" TEXT,
    "preferences" JSONB DEFAULT '{}',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "languagePreference" TEXT DEFAULT 'en',
    "lastVisit" TIMESTAMP(3),
    "totalConversations" INTEGER DEFAULT 0,
    "totalBookings" INTEGER DEFAULT 0,
    "lifetimeValue" DECIMAL(10,2) DEFAULT 0,
    "notes" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestProfile_pkey" PRIMARY KEY ("id")
);

-- Create ConversationContext table for maintaining chat context
CREATE TABLE IF NOT EXISTS "ConversationContext" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "guestProfileId" TEXT,
    "context" JSONB DEFAULT '{}',
    "bookingIntent" JSONB,
    "lastTopic" TEXT,
    "abandonedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "followUpSent" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationContext_pkey" PRIMARY KEY ("id")
);

-- Create TriggerMessage table for automated follow-ups
CREATE TABLE IF NOT EXISTS "TriggerMessage" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "triggerType" TEXT NOT NULL, -- 'abandonment', 'welcome_back', 'post_stay', 'upsell'
    "conditions" JSONB DEFAULT '{}',
    "message" TEXT NOT NULL,
    "delay" INTEGER DEFAULT 0, -- delay in minutes
    "channel" TEXT DEFAULT 'email', -- 'email', 'sms', 'whatsapp', 'web'
    "isActive" BOOLEAN DEFAULT true,
    "sentCount" INTEGER DEFAULT 0,
    "clickCount" INTEGER DEFAULT 0,
    "conversionCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TriggerMessage_pkey" PRIMARY KEY ("id")
);

-- Create GuestInteraction table for tracking all touchpoints
CREATE TABLE IF NOT EXISTS "GuestInteraction" (
    "id" TEXT NOT NULL,
    "guestProfileId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "interactionType" TEXT NOT NULL, -- 'chat', 'email', 'booking', 'review', 'complaint'
    "channel" TEXT NOT NULL,
    "content" TEXT,
    "sentiment" DECIMAL(3,2), -- -1 to 1 scale
    "outcome" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestInteraction_pkey" PRIMARY KEY ("id")
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "GuestProfile_businessId_idx" ON "GuestProfile"("businessId");
CREATE INDEX IF NOT EXISTS "GuestProfile_email_idx" ON "GuestProfile"("email");
CREATE INDEX IF NOT EXISTS "GuestProfile_phone_idx" ON "GuestProfile"("phone");
CREATE INDEX IF NOT EXISTS "ConversationContext_conversationId_idx" ON "ConversationContext"("conversationId");
CREATE INDEX IF NOT EXISTS "ConversationContext_guestProfileId_idx" ON "ConversationContext"("guestProfileId");
CREATE INDEX IF NOT EXISTS "TriggerMessage_businessId_idx" ON "TriggerMessage"("businessId");
CREATE INDEX IF NOT EXISTS "GuestInteraction_guestProfileId_idx" ON "GuestInteraction"("guestProfileId");
CREATE INDEX IF NOT EXISTS "GuestInteraction_businessId_idx" ON "GuestInteraction"("businessId");

-- Add foreign key constraints
ALTER TABLE "GuestProfile" ADD CONSTRAINT "GuestProfile_businessId_fkey" 
    FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ConversationContext" ADD CONSTRAINT "ConversationContext_conversationId_fkey" 
    FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ConversationContext" ADD CONSTRAINT "ConversationContext_guestProfileId_fkey" 
    FOREIGN KEY ("guestProfileId") REFERENCES "GuestProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TriggerMessage" ADD CONSTRAINT "TriggerMessage_businessId_fkey" 
    FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GuestInteraction" ADD CONSTRAINT "GuestInteraction_guestProfileId_fkey" 
    FOREIGN KEY ("guestProfileId") REFERENCES "GuestProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GuestInteraction" ADD CONSTRAINT "GuestInteraction_businessId_fkey" 
    FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;