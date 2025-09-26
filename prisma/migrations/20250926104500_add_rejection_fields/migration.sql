-- AlterTable
ALTER TABLE "establishments" ADD COLUMN "lastModifiedAt" DATETIME;
ALTER TABLE "establishments" ADD COLUMN "rejectedAt" DATETIME;
ALTER TABLE "establishments" ADD COLUMN "rejectionReason" TEXT;
