import { User, UserRole } from "@prisma/client";
import { IUserRepository } from "../repositories/user.repo";
import { hashPassword } from "../utils/cypher";
import { tryCatchAsync } from "../utils/fns";

export type SignupServiceReq = {
  displayName: string;
  username: string;
  password: string;
  role: string;
};

export class SignupService {
  private userRepository: IUserRepository;
  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async exec(req: SignupServiceReq) {
    const resultHash = await tryCatchAsync<string, unknown>(() =>
      hashPassword(req.password),
    );
    if (!resultHash.ok) {
      return resultHash;
    }

    const hash = resultHash.value;
    return await tryCatchAsync<User>(() =>
      this.userRepository.create({
        displayName: req.displayName,
        username: req.username,
        password: hash,
        role: req.role as UserRole,
      }),
    );
  }
}
