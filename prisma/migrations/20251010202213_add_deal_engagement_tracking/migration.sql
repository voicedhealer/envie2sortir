-- CreateTable
CREATE TABLE "deal_engagements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dealId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userIp" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "deal_engagements_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "daily_deals" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "deal_engagements_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "deal_engagements_dealId_type_idx" ON "deal_engagements"("dealId", "type");

-- CreateIndex
CREATE INDEX "deal_engagements_establishmentId_type_idx" ON "deal_engagements"("establishmentId", "type");

-- CreateIndex
CREATE INDEX "deal_engagements_timestamp_idx" ON "deal_engagements"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "deal_engagements_dealId_userIp_key" ON "deal_engagements"("dealId", "userIp");
