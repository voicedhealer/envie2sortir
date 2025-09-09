/*
  Warnings:

  - You are about to drop the column `professionalOwnerId` on the `establishments` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `establishments` table without a default value. This is not possible if the table is not empty.
  - Made the column `passwordHash` on table `users` required. This step will fail if there are existing NULL values in that column.

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
    "ownerId" TEXT NOT NULL,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "clicksCount" INTEGER NOT NULL DEFAULT 0,
    "avgRating" REAL,
    "totalComments" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "establishments_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
-- D'abord, créer la nouvelle table users
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "firstName" TEXT,
    "lastName" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "preferences" JSONB,
    "newsletterOptIn" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Migrer les utilisateurs existants
INSERT INTO "new_users" ("createdAt", "email", "id", "name", "newsletterOptIn", "passwordHash", "phone", "preferences", "role", "updatedAt") 
SELECT "createdAt", "email", "id", "name", "newsletterOptIn", COALESCE("passwordHash", '$2b$10$temp.hash.for.existing.users') as "passwordHash", "phone", "preferences", "role", "updatedAt" FROM "users";

-- Créer des utilisateurs temporaires pour les établissements existants
INSERT INTO "new_users" ("id", "email", "passwordHash", "role", "firstName", "lastName", "name", "createdAt", "updatedAt")
SELECT 
    'temp_user_' || "id" as "id",
    COALESCE("email", 'temp_' || "id" || '@example.com') as "email",
    '$2b$10$temp.hash.for.existing.establishments' as "passwordHash",
    'pro' as "role",
    'Propriétaire' as "firstName",
    "name" as "lastName",
    "name" as "name",
    "createdAt",
    "updatedAt"
FROM "establishments";

-- Insérer les établissements avec les nouveaux ownerId
INSERT INTO "new_establishments" ("accessibilite", "activities", "address", "ambiance", "avgRating", "capaciteMax", "city", "clicksCount", "country", "createdAt", "description", "email", "facebook", "horairesOuverture", "id", "instagram", "latitude", "longitude", "motsClesRecherche", "name", "parking", "phone", "postalCode", "prixMoyen", "services", "slug", "specialites", "status", "terrasse", "totalComments", "updatedAt", "viewsCount", "website", "ownerId") 
SELECT "accessibilite", "activities", "address", "ambiance", "avgRating", "capaciteMax", "city", "clicksCount", "country", "createdAt", "description", "email", "facebook", "horairesOuverture", "id", "instagram", "latitude", "longitude", "motsClesRecherche", "name", "parking", "phone", "postalCode", "prixMoyen", "services", "slug", "specialites", "status", "terrasse", "totalComments", "updatedAt", "viewsCount", "website", 'temp_user_' || "id" as "ownerId" FROM "establishments";

-- Remplacer les tables
DROP TABLE "establishments";
ALTER TABLE "new_establishments" RENAME TO "establishments";
CREATE UNIQUE INDEX "establishments_slug_key" ON "establishments"("slug");

DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
