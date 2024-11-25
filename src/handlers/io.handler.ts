import { Server, Socket } from "socket.io";
import { deriveUserRepository } from "../repositories";
import { jwtVerify, isJWTVerifyErrors, JWTClaims } from "../utils/cypher";
import { tryCatch, tryCatchAsync } from "../utils/fns";
import { User } from "@prisma/client";
import { TeleChatEvents } from "./io-event-types";
import { makeJoinRoomHandler } from "./io.join-room.handler";
import { makeMessageHandler } from "./io.message.handler";
import { makeLeaveRoomHander } from "./io.leave-room.handler";

export const handlerIO = (io: Server) => {
  io.use(async (socket, next) => {
    const { authorization } = socket.handshake.headers;
    const token = authorization?.split(" ")[1];
    if (!token) {
      next(new Error("invalid token"));
      return;
    }

    const decoded = tryCatch<JWTClaims>(() => jwtVerify(token));
    if (!decoded.ok) {
      if (isJWTVerifyErrors(decoded.error)) {
        next(decoded.error);
        return;
      }
    } else {
      const { uid } = decoded.value;
      const userRepository = deriveUserRepository();
      const user = await tryCatchAsync<User>(() =>
        userRepository.findFirstThrows({ where: { id: uid } }),
      );
      if (!user.ok) {
        next(user.error as Error);
        return;
      }

      // embeded user
      socket.handshake.auth = { user: user.value };
      next();
    }
  });

  io.on("connection", (socket: Socket<TeleChatEvents>) => {
    const { username } = socket.handshake.auth.user as User;
    console.log(`client: {${username}} is connected`);

    socket.on("joinRoom", makeJoinRoomHandler(socket));
    socket.on("message", makeMessageHandler(socket));
    socket.on("leaveRoom", makeLeaveRoomHander(socket));

    socket.on("disconnect", () => {
      console.log(`client -${socket.id}- is disconnected`);
    });
  });
};
