import { RouteShorthandOptions, RouteHandler } from "fastify";
import S from "fluent-json-schema";
import {
  CreateRoomService,
  CreateRoomServiceReq,
} from "../services/create-room.service";
import { deriveRoomRepository, deriveUserRepository } from "../repositories";

const bodySchema = S.object()
  .prop("roomName", S.string())
  .prop("members", S.array().items(S.string()).minItems(1))
  .required(["roomName", "members"]);
export const createRoomHandlerOpts: RouteShorthandOptions = {
  schema: { body: bodySchema },
};

export const createRoomHandler: RouteHandler = async (req, reply) => {
  const service = new CreateRoomService(
    deriveUserRepository(),
    deriveRoomRepository(),
  );
  const result = await service.exec(req.body as CreateRoomServiceReq);
  if (!result.ok) {
    if (result.error instanceof Error) {
      reply.code(422);
      return;
    }
  } else {
    return { room: result.value };
  }
};
