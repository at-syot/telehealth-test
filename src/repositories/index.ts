import { PrismaClient } from "@prisma/client";
import { UserRepository, IUserRepository } from "./user.repo";
import { RoomRepository, IRoomRepository } from "./room.repo";
import {
  ChatActLogRepository,
  IChatActLogRepository,
} from "./chat-actlogs.repo";

let client: PrismaClient;
let userRepository: IUserRepository;
let roomRepository: IRoomRepository;
let chatActLogRepository: IChatActLogRepository;

export function init() {
  const prisma = new PrismaClient();
  prisma.$connect();

  client = prisma;

  // REMARk: uncomment and start compose.dev to see data
  // prisma.user.findMany().then((users) => {
  //   const _users = users.map(({ id, username, roomId, role }) => ({
  //     id,
  //     username,
  //     roomId,
  //     role,
  //   }));
  //   console.log("users", _users);
  // });

  // prisma.room.findMany().then((rooms) => console.log("rooms", rooms));
  // prisma.chatEventLogs.findMany().then((logs) => console.log("logs", logs));
  // prisma.message.findMany().then((msgs) => console.log("msgs", msgs));

  // construct all repositories
  userRepository = new UserRepository(prisma);
  roomRepository = new RoomRepository(prisma);
  chatActLogRepository = new ChatActLogRepository(prisma);
}

export const derivePrisma = () => client;
export const deriveUserRepository = () => userRepository;
export const deriveRoomRepository = () => roomRepository;
export const deriveChatActLogRepository = () => chatActLogRepository;
