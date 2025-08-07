-- Add subscription management fields
ALTER TABLE "Subscription" 
ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "paymentFailedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "gracePeriodEnds" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "accessRevokedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "lastPaymentAttempt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "paymentAttempts" INTEGER DEFAULT 0;

-- Add admin user table
CREATE TABLE IF NOT EXISTS "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AdminUser_email_key" ON "AdminUser"("email");