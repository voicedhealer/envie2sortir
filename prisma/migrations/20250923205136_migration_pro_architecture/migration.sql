/*
  Warnings:

  - You are about to drop the column `establishmentId` on the `users` table. All the data in the column will be lost.

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
    CONSTRAINT "establishments_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "professionals" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_establishments" ("accessibilite", "accessibility", "accessibilityDetails", "activities", "address", "ambiance", "atmosphere", "avgRating", "capaciteMax", "childrenServices", "city", "clicksCount", "clienteleInfo", "country", "createdAt", "description", "detailedPayments", "detailedServices", "email", "enriched", "enrichmentData", "envieTags", "facebook", "googleBusinessUrl", "googlePlaceId", "googleRating", "googleReviewCount", "horairesOuverture", "id", "imageUrl", "informationsPratiques", "instagram", "latitude", "longitude", "motsClesRecherche", "name", "ownerId", "parking", "paymentMethods", "phone", "postalCode", "priceLevel", "priceMax", "priceMin", "prixMoyen", "services", "slug", "specialites", "specialties", "status", "subscription", "terrasse", "theForkLink", "tiktok", "totalComments", "uberEatsLink", "updatedAt", "viewsCount", "website") SELECT "accessibilite", "accessibility", "accessibilityDetails", "activities", "address", "ambiance", "atmosphere", "avgRating", "capaciteMax", "childrenServices", "city", "clicksCount", "clienteleInfo", "country", "createdAt", "description", "detailedPayments", "detailedServices", "email", "enriched", "enrichmentData", "envieTags", "facebook", "googleBusinessUrl", "googlePlaceId", "googleRating", "googleReviewCount", "horairesOuverture", "id", "imageUrl", "informationsPratiques", "instagram", "latitude", "longitude", "motsClesRecherche", "name", "ownerId", "parking", "paymentMethods", "phone", "postalCode", "priceLevel", "priceMax", "priceMin", "prixMoyen", "services", "slug", "specialites", "specialties", "status", "subscription", "terrasse", "theForkLink", "tiktok", "totalComments", "uberEatsLink", "updatedAt", "viewsCount", "website" FROM "establishments";
DROP TABLE "establishments";
ALTER TABLE "new_establishments" RENAME TO "establishments";
CREATE UNIQUE INDEX "establishments_slug_key" ON "establishments"("slug");
CREATE UNIQUE INDEX "establishments_ownerId_key" ON "establishments"("ownerId");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "firstName" TEXT,
    "lastName" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "preferences" JSONB,
    "newsletterOptIn" BOOLEAN NOT NULL DEFAULT true,
    "provider" TEXT,
    "providerId" TEXT,
    "avatar" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "favoriteCity" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("avatar", "createdAt", "email", "favoriteCity", "firstName", "id", "isVerified", "lastName", "name", "newsletterOptIn", "passwordHash", "phone", "preferences", "provider", "providerId", "role", "updatedAt") SELECT "avatar", "createdAt", "email", "favoriteCity", "firstName", "id", "isVerified", "lastName", "name", "newsletterOptIn", "passwordHash", "phone", "preferences", "provider", "providerId", "role", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
