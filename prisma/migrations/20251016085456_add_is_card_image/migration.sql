-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_images" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isCardImage" BOOLEAN NOT NULL DEFAULT false,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "establishmentId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "images_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_images" ("altText", "createdAt", "establishmentId", "id", "isPrimary", "ordre", "url") SELECT "altText", "createdAt", "establishmentId", "id", "isPrimary", "ordre", "url" FROM "images";
DROP TABLE "images";
ALTER TABLE "new_images" RENAME TO "images";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
