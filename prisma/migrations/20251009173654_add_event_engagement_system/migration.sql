-- CreateTable
CREATE TABLE "event_engagements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_engagements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "event_engagements_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "click_analytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "establishmentId" TEXT NOT NULL,
    "elementType" TEXT NOT NULL,
    "elementId" TEXT NOT NULL,
    "elementName" TEXT,
    "action" TEXT NOT NULL,
    "sectionContext" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "country" TEXT,
    "city" TEXT,
    "hour" INTEGER,
    "dayOfWeek" TEXT,
    "timeSlot" TEXT,
    CONSTRAINT "click_analytics_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "search_analytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "searchTerm" TEXT NOT NULL,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "clickedEstablishmentId" TEXT,
    "clickedEstablishmentName" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "country" TEXT,
    "city" TEXT,
    "searchedCity" TEXT
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
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
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "karmaPoints" INTEGER NOT NULL DEFAULT 0,
    "gamificationBadges" JSONB
);
INSERT INTO "new_users" ("avatar", "createdAt", "email", "favoriteCity", "firstName", "id", "isVerified", "lastName", "name", "newsletterOptIn", "passwordHash", "phone", "preferences", "provider", "providerId", "role", "updatedAt") SELECT "avatar", "createdAt", "email", "favoriteCity", "firstName", "id", "isVerified", "lastName", "name", "newsletterOptIn", "passwordHash", "phone", "preferences", "provider", "providerId", "role", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "event_engagements_eventId_userId_key" ON "event_engagements"("eventId", "userId");

-- CreateIndex
CREATE INDEX "click_analytics_establishmentId_elementType_idx" ON "click_analytics"("establishmentId", "elementType");

-- CreateIndex
CREATE INDEX "click_analytics_timestamp_idx" ON "click_analytics"("timestamp");

-- CreateIndex
CREATE INDEX "click_analytics_hour_dayOfWeek_idx" ON "click_analytics"("hour", "dayOfWeek");

-- CreateIndex
CREATE INDEX "search_analytics_searchTerm_idx" ON "search_analytics"("searchTerm");

-- CreateIndex
CREATE INDEX "search_analytics_timestamp_idx" ON "search_analytics"("timestamp");

-- CreateIndex
CREATE INDEX "search_analytics_clickedEstablishmentId_idx" ON "search_analytics"("clickedEstablishmentId");
