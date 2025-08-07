-- CreateTable for API usage tracking
CREATE TABLE "ApiLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApiLog_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ApiLog_businessId_createdAt_idx" ON "ApiLog"("businessId", "createdAt");

-- Add monthly conversation count tracking to Business table
ALTER TABLE "Business" ADD COLUMN "monthlyConversationCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Business" ADD COLUMN "lastConversationReset" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;