/*
  Warnings:

  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ChatEventType" AS ENUM ('JoinRoom', 'LeaveRoom', 'Message');

-- CreateEnum
CREATE TYPE "ChatEventStatus" AS ENUM ('Success', 'Fail');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL;

-- CreateTable
CREATE TABLE "ChatEventLogs" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "actorId" INTEGER NOT NULL,
    "eventType" "ChatEventType" NOT NULL,
    "eventTypeStatus" "ChatEventStatus" NOT NULL,

    CONSTRAINT "ChatEventLogs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChatEventLogs" ADD CONSTRAINT "ChatEventLogs_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatEventLogs" ADD CONSTRAINT "ChatEventLogs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
