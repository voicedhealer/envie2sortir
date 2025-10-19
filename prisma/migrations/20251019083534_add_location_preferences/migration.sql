-- CreateTable
CREATE TABLE "location_preferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "cityName" TEXT NOT NULL,
    "cityLatitude" REAL NOT NULL,
    "cityLongitude" REAL NOT NULL,
    "cityRegion" TEXT,
    "searchRadius" INTEGER NOT NULL DEFAULT 20,
    "mode" TEXT NOT NULL DEFAULT 'manual',
    "useCurrentLocation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "location_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "location_preferences_userId_key" ON "location_preferences"("userId");
