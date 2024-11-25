import { User } from "@prisma/client";
import { Socket } from "socket.io";
import { TeleChatEventCallbacks, TeleChatEvents } from "./io-event-types";
import {
  deriveChatActLogRepository,
  deriveRoomRepository,
} from "../repositories";

export const makeLeaveRoomHander = (socket: Socket<TeleChatEvents>) => {
  const handler: TeleChatEventCallbacks<"leaveRoom"> = async ({ roomId }) => {
    const { id: uid, username } = socket.handshake.auth.user as User;

    const roomRepository = deriveRoomRepository();
    const chatActLogRepo = deriveChatActLogRepository();

    const isRoomHasUser = await roomRepository.hasUser(roomId, uid);
    if (!isRoomHasUser) {
      await chatActLogRepo.create({
        actorId: uid,
        eventType: "LeaveRoom",
        eventTypeStatus: "Fail",
      });
      socket.disconnect();
      return;
    }

    await chatActLogRepo.create({
      roomId,
      actorId: uid,
      eventType: "LeaveRoom",
      eventTypeStatus: "Success",
    });
    socket.to(String(roomId)).emit("broadcastMessage", {
      roomId,
      senderId: uid,
      content: `Bye client: ${username}`,
    });
  };
  return handler;
};
