-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "establishmentReply" TEXT,
    "repliedAt" DATETIME,
    "isReported" BOOLEAN NOT NULL DEFAULT false,
    "reportReason" TEXT,
    "reportedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_comments_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_comments" ("content", "createdAt", "establishmentId", "id", "rating", "updatedAt", "userId") SELECT "content", "createdAt", "establishmentId", "id", "rating", "updatedAt", "userId" FROM "user_comments";
DROP TABLE "user_comments";
ALTER TABLE "new_user_comments" RENAME TO "user_comments";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
