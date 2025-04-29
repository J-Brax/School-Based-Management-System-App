/*
  Warnings:

  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'PROMOTED', 'RETAINED', 'DROPPED_OUT', 'TRANSFERRED', 'NLS');

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "statusDate" TIMESTAMP(3),
ADD COLUMN     "statusNotes" TEXT;

-- DropTable
DROP TABLE "Message";

-- DropEnum
DROP TYPE "UserRole";
