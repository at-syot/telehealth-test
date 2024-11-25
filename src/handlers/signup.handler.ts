import { Prisma } from "@prisma/client";
import { RouteHandler, RouteShorthandOptions } from "fastify";
import S from "fluent-json-schema";
import { deriveUserRepository } from "../repositories";
import { SignupService, SignupServiceReq } from "../services";

const bodySchema = S.object()
  .prop("displayName", S.string())
  .prop("username", S.string())
  .prop("password", S.string())
  .prop("role", S.string().enum(["Consult", "Patient"]))
  .required(["displayName", "username", "password", "role"]);
export const signupHandlerOpts: RouteShorthandOptions = {
  schema: { body: bodySchema },
};

export const signupHandler: RouteHandler = async (req, reply) => {
  const service = new SignupService(deriveUserRepository());
  const user = await service.exec(req.body as SignupServiceReq);

  if (!user.ok) {
    if (user.error instanceof Prisma.PrismaClientKnownRequestError) {
      reply.code(409);
      return;
    }
  } else {
    return { user: user.value };
  }
};
