-- CreateTable
CREATE TABLE "establishment_learning_patterns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "detectedType" TEXT NOT NULL,
    "correctedType" TEXT,
    "googleTypes" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "isCorrected" BOOLEAN NOT NULL DEFAULT false,
    "correctedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
