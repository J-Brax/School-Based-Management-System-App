/*
  Warnings:

  - You are about to drop the column `conversationId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `receiverType` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `senderType` on the `Message` table. All the data in the column will be lost.
  - Added the required column `receiverName` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverRole` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderName` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderRole` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'TEACHER', 'STUDENT', 'PARENT');

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "conversationId",
DROP COLUMN "receiverType",
DROP COLUMN "senderType",
ADD COLUMN     "receiverName" TEXT NOT NULL,
ADD COLUMN     "receiverRole" "UserRole" NOT NULL,
ADD COLUMN     "senderName" TEXT NOT NULL,
ADD COLUMN     "senderRole" "UserRole" NOT NULL,
ADD COLUMN     "subject" TEXT NOT NULL;

-- DropEnum
DROP TYPE "UserType";
