import { TeleChatEventCallbacks, TeleChatEvents } from "./io-event-types";
import { Socket } from "socket.io";
import { User, ChatEventLogs, ChatEventType } from "@prisma/client";
import {
  deriveRoomRepository,
  deriveChatActLogRepository,
} from "../repositories";

export const makeJoinRoomHandler = (socket: Socket<TeleChatEvents>) => {
  const handler: TeleChatEventCallbacks<"joinRoom"> = async (payload, cb) => {
    const { roomId } = payload;
    const { id: uid } = socket.handshake.auth.user as User;

    const roomRepository = deriveRoomRepository();
    const chatActLogRepo = deriveChatActLogRepository();

    const isRoomHasUser = await roomRepository.hasUser(roomId, uid);
    const makeLogProps = (
      joinOk: boolean,
      roomId?: number,
      etype?: ChatEventType,
    ): Partial<ChatEventLogs> => ({
      eventType: etype,
      eventTypeStatus: joinOk ? "Success" : "Fail",
      actorId: uid,
      roomId,
    });

    // join room fails
    if (!isRoomHasUser) {
      const logProps = makeLogProps(isRoomHasUser, undefined, "JoinRoom");
      await chatActLogRepo.create(logProps);
      socket.disconnect();
      return;
    }

    // join room success
    const logProps = makeLogProps(true, roomId, "JoinRoom");
    await chatActLogRepo.create(logProps);

    socket.join(String(roomId));
    cb({ message: `join room:${roomId} success` });
  };

  return handler;
};
