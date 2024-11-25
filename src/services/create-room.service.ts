import { Room, User } from "@prisma/client";
import { IUserRepository } from "../repositories/user.repo";
import { IRoomRepository } from "../repositories/room.repo";
import { Result, tryCatchAsync } from "../utils/fns";

export type CreateRoomServiceReq = {
  roomName: string;
  members: string[];
};

export class CreateRoomService {
  private userRepository: IUserRepository;
  private roomRepository: IRoomRepository;
  constructor(
    userRepository: IUserRepository,
    roomRepository: IRoomRepository,
  ) {
    this.userRepository = userRepository;
    this.roomRepository = roomRepository;
  }

  async exec(req: CreateRoomServiceReq) {
    const memberIds = req.members.map((id) => Number(id));
    const isInvalidId = memberIds.some((id) => Number.isNaN(id));
    if (isInvalidId) {
      return {
        ok: false,
        error: new Error("invalid member ids"),
      } satisfies Result<User>;
    }

    const findUserQueries = req.members.map((id) =>
      tryCatchAsync<User>(() =>
        this.userRepository.findFirstThrows({ where: { id: Number(id) } }),
      ),
    );
    const userQueriesResults = await Promise.all(findUserQueries);
    const userQueryErrors = userQueriesResults
      .filter((result) => !result.ok)
      .map((result) => result.error);
    if (userQueryErrors.length > 0) {
      return {
        ok: false,
        error: userQueryErrors[0],
      } satisfies Result<User>;
    }

    const resultRoom = await tryCatchAsync<Room>(() => {
      const connect = memberIds.reduce(
        (acc, id) => {
          acc.push({ id });
          return acc;
        },
        [] as { id: number }[],
      );

      return this.roomRepository.create({
        name: req.roomName,
        users: { connect },
      });
    });
    return resultRoom;
  }
}
