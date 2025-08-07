-- Create Channel Configuration table
CREATE TABLE IF NOT EXISTS "ChannelConfig" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "channel" TEXT NOT NULL, -- 'whatsapp', 'sms', 'instagram', 'facebook', 'telegram'
    "isActive" BOOLEAN DEFAULT false,
    "config" JSONB DEFAULT '{}', -- Store API keys, tokens, etc
    "webhookUrl" TEXT,
    "webhookSecret" TEXT,
    "rateLimits" JSONB DEFAULT '{}',
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChannelConfig_pkey" PRIMARY KEY ("id")
);

-- Create Message Queue table for unified messaging
CREATE TABLE IF NOT EXISTS "MessageQueue" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "recipient" TEXT NOT NULL, -- phone number, whatsapp id, instagram handle, etc
    "message" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "status" TEXT DEFAULT 'pending', -- 'pending', 'sending', 'sent', 'delivered', 'failed'
    "priority" INTEGER DEFAULT 0,
    "scheduledFor" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "error" TEXT,
    "retries" INTEGER DEFAULT 0,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageQueue_pkey" PRIMARY KEY ("id")
);

-- Create Channel Session table for tracking conversations across channels
CREATE TABLE IF NOT EXISTS "ChannelSession" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "externalId" TEXT NOT NULL, -- WhatsApp conversation ID, SMS thread, etc
    "recipient" TEXT NOT NULL,
    "guestProfileId" TEXT,
    "conversationId" TEXT,
    "status" TEXT DEFAULT 'active', -- 'active', 'expired', 'closed'
    "lastMessageAt" TIMESTAMP(3),
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChannelSession_pkey" PRIMARY KEY ("id")
);

-- Create Template Messages table for pre-approved messages
CREATE TABLE IF NOT EXISTS "MessageTemplate" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "category" TEXT NOT NULL, -- 'marketing', 'utility', 'authentication'
    "language" TEXT DEFAULT 'en',
    "content" TEXT NOT NULL,
    "variables" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mediaUrl" TEXT,
    "buttons" JSONB DEFAULT '[]',
    "externalId" TEXT, -- WhatsApp template ID, etc
    "approvalStatus" TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    "isActive" BOOLEAN DEFAULT true,
    "usageCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id")
);

-- Add indexes
CREATE INDEX IF NOT EXISTS "ChannelConfig_businessId_idx" ON "ChannelConfig"("businessId");
CREATE INDEX IF NOT EXISTS "ChannelConfig_channel_idx" ON "ChannelConfig"("channel");
CREATE INDEX IF NOT EXISTS "MessageQueue_businessId_idx" ON "MessageQueue"("businessId");
CREATE INDEX IF NOT EXISTS "MessageQueue_status_idx" ON "MessageQueue"("status");
CREATE INDEX IF NOT EXISTS "MessageQueue_scheduledFor_idx" ON "MessageQueue"("scheduledFor");
CREATE INDEX IF NOT EXISTS "ChannelSession_businessId_idx" ON "ChannelSession"("businessId");
CREATE INDEX IF NOT EXISTS "ChannelSession_channel_idx" ON "ChannelSession"("channel");
CREATE INDEX IF NOT EXISTS "ChannelSession_externalId_idx" ON "ChannelSession"("externalId");
CREATE INDEX IF NOT EXISTS "ChannelSession_guestProfileId_idx" ON "ChannelSession"("guestProfileId");
CREATE INDEX IF NOT EXISTS "MessageTemplate_businessId_idx" ON "MessageTemplate"("businessId");
CREATE INDEX IF NOT EXISTS "MessageTemplate_channel_idx" ON "MessageTemplate"("channel");

-- Add foreign key constraints
ALTER TABLE "ChannelConfig" ADD CONSTRAINT "ChannelConfig_businessId_fkey" 
    FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MessageQueue" ADD CONSTRAINT "MessageQueue_businessId_fkey" 
    FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ChannelSession" ADD CONSTRAINT "ChannelSession_businessId_fkey" 
    FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ChannelSession" ADD CONSTRAINT "ChannelSession_guestProfileId_fkey" 
    FOREIGN KEY ("guestProfileId") REFERENCES "GuestProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ChannelSession" ADD CONSTRAINT "ChannelSession_conversationId_fkey" 
    FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "MessageTemplate" ADD CONSTRAINT "MessageTemplate_businessId_fkey" 
    FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;