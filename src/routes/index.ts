import { FastifyPluginAsync } from "fastify";

import { signupHandler, signupHandlerOpts } from "../handlers/signup.handler";
import { authHandler, authHandlerOpts } from "../handlers/auth.handler";
import {
  createRoomHandler,
  createRoomHandlerOpts,
} from "../handlers/create-room.handler";

const routes: FastifyPluginAsync = async (app, _) => {
  app.get("/health", () => ({ message: "telehealth is running" })); // healthcheck
  app.register(
    async (api) => {
      api.post("/auth/signup", signupHandlerOpts, signupHandler);
      api.post("/auth/token", authHandlerOpts, authHandler);

      api.post("/rooms", createRoomHandlerOpts, createRoomHandler);
    },
    { prefix: "/api/v1" },
  );
};

export default routes;
