-- CreateTable
CREATE TABLE "daily_deals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "establishmentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "originalPrice" REAL,
    "discountedPrice" REAL,
    "imageUrl" TEXT,
    "pdfUrl" TEXT,
    "dateDebut" DATETIME NOT NULL,
    "dateFin" DATETIME NOT NULL,
    "heureDebut" TEXT,
    "heureFin" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDismissed" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "daily_deals_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "daily_deals_establishmentId_isActive_dateDebut_dateFin_idx" ON "daily_deals"("establishmentId", "isActive", "dateDebut", "dateFin");
