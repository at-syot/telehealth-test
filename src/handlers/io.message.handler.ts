import { TeleChatEventCallbacks, TeleChatEvents } from "./io-event-types";
import { Socket } from "socket.io";
import {
  User,
  Message,
  ChatEventType,
  ChatEventLogs,
  ChatEventStatus,
} from "@prisma/client";
import {
  deriveRoomRepository,
  deriveChatActLogRepository,
} from "../repositories";
import { tryCatchAsync } from "../utils/fns";

export const makeMessageHandler = (socket: Socket<TeleChatEvents>) => {
  const handler: TeleChatEventCallbacks<"message"> = async (payload) => {
    const user = socket.handshake.auth.user as User;
    const { id: senderId } = user;
    const { roomId, content } = payload;

    const chatActLogRepo = deriveChatActLogRepository();
    const roomRepository = deriveRoomRepository();
    const makeLogProps = (
      roomId?: number,
      status?: ChatEventStatus,
    ): Partial<ChatEventLogs> => ({
      roomId,
      actorId: senderId,
      eventType: "Message",
      eventTypeStatus: status,
    });

    const isRoomHasUser = await roomRepository.hasUser(roomId, senderId);
    if (!isRoomHasUser) {
      await chatActLogRepo.create(makeLogProps(undefined, "Fail"));
      socket.disconnect();
      return;
    }

    // add new message to the room
    const addedMessage = await tryCatchAsync(() =>
      roomRepository.addMessage(roomId, { senderId, content } as Message),
    );
    if (!addedMessage.ok) {
      await chatActLogRepo.create(makeLogProps(roomId, "Fail"));
      socket.disconnect();
      return;
    }

    await chatActLogRepo.create(makeLogProps(roomId, "Success")),
      // broadcast
      socket
        .to(String(roomId))
        .emit("broadcastMessage", { roomId, senderId, content });
  };
  return handler;
};
