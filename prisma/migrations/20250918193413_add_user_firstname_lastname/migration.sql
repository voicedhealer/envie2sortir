/*
  Warnings:

  - You are about to alter the column `accessibilityDetails` on the `establishments` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `childrenServices` on the `establishments` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `clienteleInfo` on the `establishments` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `detailedPayments` on the `establishments` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `detailedServices` on the `establishments` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

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
    "paymentMethods" JSONB,
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
    "tiktok" TEXT,
    "imageUrl" TEXT,
    "priceMax" REAL,
    "priceMin" REAL,
    "informationsPratiques" JSONB,
    "googlePlaceId" TEXT,
    "googleBusinessUrl" TEXT,
    "enriched" BOOLEAN NOT NULL DEFAULT false,
    "enrichmentData" JSONB,
    "envieTags" JSONB,
    "priceLevel" INTEGER,
    "googleRating" REAL,
    "googleReviewCount" INTEGER,
    "theForkLink" TEXT,
    "uberEatsLink" TEXT,
    "specialties" JSONB,
    "atmosphere" JSONB,
    "accessibility" JSONB,
    "accessibilityDetails" JSONB,
    "detailedServices" JSONB,
    "clienteleInfo" JSONB,
    "detailedPayments" JSONB,
    "childrenServices" JSONB,
    CONSTRAINT "establishments_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_establishments" ("accessibilite", "accessibilityDetails", "activities", "address", "ambiance", "avgRating", "capaciteMax", "childrenServices", "city", "clicksCount", "clienteleInfo", "country", "createdAt", "description", "detailedPayments", "detailedServices", "email", "facebook", "horairesOuverture", "id", "imageUrl", "informationsPratiques", "instagram", "latitude", "longitude", "motsClesRecherche", "name", "ownerId", "parking", "paymentMethods", "phone", "postalCode", "priceMax", "priceMin", "prixMoyen", "services", "slug", "specialites", "status", "subscription", "terrasse", "tiktok", "totalComments", "updatedAt", "viewsCount", "website") SELECT "accessibilite", "accessibilityDetails", "activities", "address", "ambiance", "avgRating", "capaciteMax", "childrenServices", "city", "clicksCount", "clienteleInfo", "country", "createdAt", "description", "detailedPayments", "detailedServices", "email", "facebook", "horairesOuverture", "id", "imageUrl", "informationsPratiques", "instagram", "latitude", "longitude", "motsClesRecherche", "name", "ownerId", "parking", "paymentMethods", "phone", "postalCode", "priceMax", "priceMin", "prixMoyen", "services", "slug", "specialites", "status", "subscription", "terrasse", "tiktok", "totalComments", "updatedAt", "viewsCount", "website" FROM "establishments";
DROP TABLE "establishments";
ALTER TABLE "new_establishments" RENAME TO "establishments";
CREATE UNIQUE INDEX "establishments_slug_key" ON "establishments"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
