-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hasStatus" BOOLEAN,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "isOnline" BOOLEAN,
ADD COLUMN     "lastConnection" TIMESTAMP(3),
ADD COLUMN     "note" TEXT;
