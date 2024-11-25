import { RouteShorthandOptions, RouteHandler } from "fastify";
import S from "fluent-json-schema";
import { AuthService, AuthServiceReq } from "../services/auth.service";
import { deriveUserRepository } from "../repositories";
import { isJWTVerifyErrors } from "../utils/cypher";
import { Prisma } from "@prisma/client";

const bodySchema = S.object()
  .prop("username", S.string())
  .prop("password", S.string())
  .prop("role", S.string().enum(["Consult", "Patient"]))
  .required(["username", "password", "role"]);
export const authHandlerOpts: RouteShorthandOptions = {
  schema: { body: bodySchema },
};

export const authHandler: RouteHandler = async (req, reply) => {
  const service = new AuthService(deriveUserRepository());
  const result = await service.exec(req.body as AuthServiceReq);
  if (!result.ok) {
    const isPrismaErr =
      result.error instanceof Prisma.PrismaClientKnownRequestError;
    const isErr = result.error instanceof Error;
    if (isPrismaErr || isErr) {
      reply.code(401);
      return { messages: [(result.error as Error).message] };
    }

    if (isJWTVerifyErrors(result.error)) {
      reply.code(401);
      return { messages: [result.error.inner.message] };
    }
  } else {
    return { accessToken: result.value };
  }
};
