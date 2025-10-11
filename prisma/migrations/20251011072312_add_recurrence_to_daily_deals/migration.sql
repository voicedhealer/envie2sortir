-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_daily_deals" (
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
    "modality" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceType" TEXT,
    "recurrenceDays" JSONB,
    "recurrenceEndDate" DATETIME,
    CONSTRAINT "daily_deals_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_daily_deals" ("createdAt", "dateDebut", "dateFin", "description", "discountedPrice", "establishmentId", "heureDebut", "heureFin", "id", "imageUrl", "isActive", "isDismissed", "modality", "originalPrice", "pdfUrl", "title", "updatedAt") SELECT "createdAt", "dateDebut", "dateFin", "description", "discountedPrice", "establishmentId", "heureDebut", "heureFin", "id", "imageUrl", "isActive", "isDismissed", "modality", "originalPrice", "pdfUrl", "title", "updatedAt" FROM "daily_deals";
DROP TABLE "daily_deals";
ALTER TABLE "new_daily_deals" RENAME TO "daily_deals";
CREATE INDEX "daily_deals_establishmentId_isActive_dateDebut_dateFin_idx" ON "daily_deals"("establishmentId", "isActive", "dateDebut", "dateFin");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
