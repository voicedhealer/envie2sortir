/*
  Warnings:

  - You are about to drop the column `instagram` on the `Establishment` table. All the data in the column will be lost.
  - You are about to drop the column `openingHours` on the `Establishment` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionExpiresAt` on the `Establishment` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionType` on the `Establishment` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `isFeatured` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `pricePaidCents` on the `FeaturedPromotion` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `FeaturedPromotion` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `FeaturedPromotion` table. All the data in the column will be lost.
  - Made the column `ownerId` on table `Establishment` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `name` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `placementType` to the `FeaturedPromotion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `FeaturedPromotion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `FeaturedPromotion` table without a default value. This is not possible if the table is not empty.

*/

-- Créer un utilisateur par défaut si nécessaire
INSERT OR IGNORE INTO "User" ("id", "email", "role", "createdAt", "updatedAt") 
VALUES ('default-user', 'admin@envie2sortir.fr', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Mettre à jour les établissements sans ownerId
UPDATE "Establishment" SET "ownerId" = 'default-user' WHERE "ownerId" IS NULL;

-- Créer la table des tags
CREATE TABLE "etablissement_tags" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "etablissementId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "typeTag" TEXT NOT NULL,
    "poids" INTEGER NOT NULL DEFAULT 5,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "etablissement_tags_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "Establishment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Redéfinir les tables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- Table Establishment
CREATE TABLE "new_Establishment" (
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
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "specialites" TEXT NOT NULL DEFAULT '',
    "motsClesRecherche" TEXT,
    "horairesOuverture" JSONB,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Establishment_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_Establishment" ("address", "category", "createdAt", "description", "email", "id", "latitude", "longitude", "name", "ownerId", "phone", "slug", "status", "updatedAt", "website") 
SELECT "address", "category", "createdAt", "description", "email", "id", "latitude", "longitude", "name", "ownerId", "phone", "slug", "status", "updatedAt", "website" FROM "Establishment";

DROP TABLE "Establishment";
ALTER TABLE "new_Establishment" RENAME TO "Establishment";
CREATE UNIQUE INDEX "Establishment_slug_key" ON "Establishment"("slug");

-- Table Event
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "establishmentId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Event_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Event" ("createdAt", "description", "endDate", "establishmentId", "id", "startDate", "name", "updatedAt") 
SELECT "createdAt", "description", "endDate", "establishmentId", "id", "startDate", COALESCE("title", 'Événement'), "createdAt" FROM "Event";

DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";

-- Table FeaturedPromotion
CREATE TABLE "new_FeaturedPromotion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "placementType" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FeaturedPromotion_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_FeaturedPromotion" ("endDate", "establishmentId", "id", "startDate", "title", "description", "placementType", "createdAt", "updatedAt") 
SELECT "endDate", "establishmentId", "id", "startDate", COALESCE("type", 'homepage'), "description", COALESCE("type", 'homepage'), "createdAt", "createdAt" FROM "FeaturedPromotion";

DROP TABLE "FeaturedPromotion";
ALTER TABLE "new_FeaturedPromotion" RENAME TO "FeaturedPromotion";

-- Table Image
CREATE TABLE "new_Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "establishmentId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Image_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Image" ("altText", "establishmentId", "id", "isPrimary", "url", "createdAt") 
SELECT "altText", "establishmentId", "id", "isPrimary", "url", "createdAt" FROM "Image";

DROP TABLE "Image";
ALTER TABLE "new_Image" RENAME TO "Image";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
