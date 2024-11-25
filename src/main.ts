import "dotenv/config";
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import * as repositories from "./repositories";
import { Server, ServerOptions } from "socket.io";
import { Redis } from "ioredis";
import { createAdapter } from "@socket.io/redis-adapter";
import { handlerIO } from "./handlers/io.handler";

import routes from "./routes";

// API routes
// - DONE: POST register user { username, password, displayName, role } -> id
// - DONE: POST token { username, password } -> access-token
// - DONE: POST create room { roomName, members: []userId }

const pubClient = new Redis({ host: "redis" });
const subClient = pubClient.duplicate();
const fastify = Fastify({ logger: false });
fastify.register(fastifyCors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});
fastify.register(fastifySwagger, {
  swagger: {
    info: {
      title: "Fastify API",
      description: "API documentation for Fastify application",
      version: "1.0.0",
    },
    host: "localhost:8080",
    schemes: ["http"],
    consumes: ["application/json"],
    produces: ["application/json"],
  },
});
fastify.register(fastifySwaggerUi, { routePrefix: "/doc" });

const ioCfg: Partial<ServerOptions> = {
  cors: { origin: "*", credentials: true },
};
const fastifyServer = fastify.server;
const io = new Server(fastifyServer, ioCfg);
io.adapter(createAdapter(pubClient, subClient));

handlerIO(io);
fastify.register(routes);

const port = process.env.PORT || 3000;
async function run() {
  try {
    repositories.init();
    await fastify.listen({ port: Number(port), host: "0.0.0.0" });
    console.log("telehealth server is running on port:", port);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

run();
