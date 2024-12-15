/*
  Warnings:

  - You are about to drop the column `refresgToken` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "refresgToken",
ADD COLUMN     "refreshToken" TEXT;
