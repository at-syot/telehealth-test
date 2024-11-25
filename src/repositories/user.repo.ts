import { Prisma, PrismaClient, User } from "@prisma/client";

export type UserRole = "Consult" | "Patient";

export interface IUserRepository {
  create(u: Prisma.UserCreateInput): Promise<Partial<User>>;
  findFirstThrows(args: Prisma.UserFindFirstArgs): Promise<User>;
}

export class UserRepository implements IUserRepository {
  private client: PrismaClient;

  constructor(client: PrismaClient) {
    this.client = client;
  }

  create(u: Prisma.UserCreateInput) {
    return this.client.user.create({ data: u });
  }

  update(u: Prisma.UserUpdateInput) {
    // this.client.user.update({ where: { id: 0 }, data: { room: "" } });
  }

  findFirstThrows(args: Prisma.UserFindFirstArgs) {
    return this.client.user.findFirstOrThrow(args);
  }
}
