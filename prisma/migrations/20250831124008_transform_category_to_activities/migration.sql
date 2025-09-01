/*
  Warnings:

  - You are about to drop the column `category` on the `establishments` table. All the data in the column will be lost.

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
    "professionalOwnerId" TEXT NOT NULL,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "clicksCount" INTEGER NOT NULL DEFAULT 0,
    "avgRating" REAL,
    "totalComments" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "establishments_professionalOwnerId_fkey" FOREIGN KEY ("professionalOwnerId") REFERENCES "professionals" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_establishments" ("accessibilite", "address", "ambiance", "avgRating", "capaciteMax", "city", "clicksCount", "country", "createdAt", "description", "email", "facebook", "horairesOuverture", "id", "instagram", "latitude", "longitude", "motsClesRecherche", "name", "parking", "phone", "postalCode", "prixMoyen", "professionalOwnerId", "services", "slug", "specialites", "status", "terrasse", "totalComments", "updatedAt", "viewsCount", "website") SELECT "accessibilite", "address", "ambiance", "avgRating", "capaciteMax", "city", "clicksCount", "country", "createdAt", "description", "email", "facebook", "horairesOuverture", "id", "instagram", "latitude", "longitude", "motsClesRecherche", "name", "parking", "phone", "postalCode", "prixMoyen", "professionalOwnerId", "services", "slug", "specialites", "status", "terrasse", "totalComments", "updatedAt", "viewsCount", "website" FROM "establishments";
DROP TABLE "establishments";
ALTER TABLE "new_establishments" RENAME TO "establishments";
CREATE UNIQUE INDEX "establishments_slug_key" ON "establishments"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
