import { ChatEventLogs, PrismaClient } from "@prisma/client";

export interface IChatActLogRepository {
  create(log: Partial<ChatEventLogs>): Promise<unknown>;
}

export class ChatActLogRepository implements IChatActLogRepository {
  private client: PrismaClient;

  constructor(client: PrismaClient) {
    this.client = client;
  }

  create(log: Partial<ChatEventLogs>) {
    const connectRoomProps = log.roomId
      ? { room: { connect: { id: log.roomId } } }
      : {};
    return this.client.chatEventLogs.create({
      data: {
        eventType: log.eventType ?? "Message",
        eventTypeStatus: log.eventTypeStatus ?? "Success",
        ...connectRoomProps,
        user: { connect: { id: log.actorId } },
      },
    });
  }
}
