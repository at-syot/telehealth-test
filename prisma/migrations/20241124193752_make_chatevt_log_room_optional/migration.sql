-- DropForeignKey
ALTER TABLE "ChatEventLogs" DROP CONSTRAINT "ChatEventLogs_roomId_fkey";

-- AlterTable
ALTER TABLE "ChatEventLogs" ALTER COLUMN "roomId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ChatEventLogs" ADD CONSTRAINT "ChatEventLogs_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
