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
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("avatar", "createdAt", "email", "favoriteCity", "firstName", "id", "isVerified", "lastName", "name", "newsletterOptIn", "passwordHash", "phone", "preferences", "provider", "providerId", "updatedAt") SELECT "avatar", "createdAt", "email", "favoriteCity", "firstName", "id", "isVerified", "lastName", "name", "newsletterOptIn", "passwordHash", "phone", "preferences", "provider", "providerId", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
