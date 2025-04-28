-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('ADMIN', 'TEACHER', 'STUDENT', 'PARENT');

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "senderId" TEXT NOT NULL,
    "senderType" "UserType" NOT NULL,
    "receiverId" TEXT NOT NULL,
    "receiverType" "UserType" NOT NULL,
    "conversationId" TEXT,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);
