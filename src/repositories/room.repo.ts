import { Message, Prisma, PrismaClient, Room, User } from "@prisma/client";
import { tryCatchAsync } from "../utils/fns";

export type RoomFindFirstOrTrowReturnType = Room & { users: User[] };
export interface IRoomRepository {
  create(room: Prisma.RoomCreateInput): Promise<Partial<Room>>;
  findFirstThrows(args: Prisma.RoomFindFirstOrThrowArgs): Promise<unknown>;
  addMessage(roomId: number, message: Message): Promise<unknown>;
  hasUser(roomId: number, userId: number): Promise<boolean>;
}

export class RoomRepository implements IRoomRepository {
  private client: PrismaClient;

  constructor(client: PrismaClient) {
    this.client = client;
  }

  create(room: Prisma.RoomCreateInput) {
    return this.client.room.create({ data: room });
  }

  findFirstThrows(args: Prisma.RoomFindFirstOrThrowArgs) {
    return this.client.room.findFirstOrThrow(args);
  }

  async addMessage(roomId: number, message: Message) {
    const { senderId, content } = message;
    return this.client.room.update({
      where: { id: roomId },
      include: { messages: true },
      data: {
        messages: {
          create: { senderId, content },
        },
      },
    });
  }

  async hasUser(roomId: number, userId: number): Promise<boolean> {
    const room = await tryCatchAsync<RoomFindFirstOrTrowReturnType>(() =>
      this.client.room.findFirstOrThrow({
        where: { id: roomId },
        include: { users: { where: { id: userId } } },
      }),
    );
    if (!room.ok) {
      return false;
    }

    const roomUsers = room.value.users;
    const isUserInRoom = roomUsers.some(({ id }) => id === userId);
    return isUserInRoom;
  }
}
