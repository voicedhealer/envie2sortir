/*
  Warnings:

  - You are about to drop the column `name` on the `events` table. All the data in the column will be lost.
  - Added the required column `title` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_establishments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'France',
    "latitude" REAL,
    "longitude" REAL,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "activities" JSONB,
    "specialites" TEXT NOT NULL DEFAULT '',
    "motsClesRecherche" TEXT,
    "services" JSONB,
    "ambiance" JSONB,
    "horairesOuverture" JSONB,
    "prixMoyen" REAL,
    "capaciteMax" INTEGER,
    "accessibilite" BOOLEAN NOT NULL DEFAULT false,
    "parking" BOOLEAN NOT NULL DEFAULT false,
    "terrasse" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "subscription" TEXT NOT NULL DEFAULT 'STANDARD',
    "ownerId" TEXT NOT NULL,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "clicksCount" INTEGER NOT NULL DEFAULT 0,
    "avgRating" REAL,
    "totalComments" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "establishments_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_establishments" ("accessibilite", "activities", "address", "ambiance", "avgRating", "capaciteMax", "city", "clicksCount", "country", "createdAt", "description", "email", "facebook", "horairesOuverture", "id", "instagram", "latitude", "longitude", "motsClesRecherche", "name", "ownerId", "parking", "phone", "postalCode", "prixMoyen", "services", "slug", "specialites", "status", "terrasse", "totalComments", "updatedAt", "viewsCount", "website") SELECT "accessibilite", "activities", "address", "ambiance", "avgRating", "capaciteMax", "city", "clicksCount", "country", "createdAt", "description", "email", "facebook", "horairesOuverture", "id", "instagram", "latitude", "longitude", "motsClesRecherche", "name", "ownerId", "parking", "phone", "postalCode", "prixMoyen", "services", "slug", "specialites", "status", "terrasse", "totalComments", "updatedAt", "viewsCount", "website" FROM "establishments";
DROP TABLE "establishments";
ALTER TABLE "new_establishments" RENAME TO "establishments";
CREATE UNIQUE INDEX "establishments_slug_key" ON "establishments"("slug");
CREATE TABLE "new_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "imageUrl" TEXT,
    "price" REAL,
    "maxCapacity" INTEGER,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "establishmentId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "events_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_events" ("createdAt", "description", "endDate", "establishmentId", "id", "isRecurring", "maxCapacity", "price", "startDate", "updatedAt", "title") SELECT "createdAt", "description", "endDate", "establishmentId", "id", "isRecurring", "maxCapacity", "price", "startDate", "updatedAt", COALESCE("name", 'Événement') as "title" FROM "events";
DROP TABLE "events";
ALTER TABLE "new_events" RENAME TO "events";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
