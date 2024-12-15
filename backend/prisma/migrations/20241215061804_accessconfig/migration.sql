-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "refresgToken" TEXT,
ADD COLUMN     "tokenExpiry" TIMESTAMP(3);
