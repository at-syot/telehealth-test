import { User, UserRole } from "@prisma/client";
import { IUserRepository } from "../repositories/user.repo";
import { comparePassword, jwtSign } from "../utils/cypher";
import { tryCatch, Result, tryCatchAsync } from "../utils/fns";

export type AuthServiceReq = {
  username: string;
  password: string;
  role: string;
};

export class AuthService {
  private userRepository: IUserRepository;
  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async exec(req: AuthServiceReq) {
    const { username, password: raw, role } = req;
    const resultInU = await tryCatchAsync<User>(() =>
      this.userRepository.findFirstThrows({
        where: { username, role: role as UserRole },
      }),
    );
    if (!resultInU.ok) {
      return resultInU;
    }

    const inU = resultInU.value;
    const isPasswordValid = await comparePassword(raw, inU.password);
    if (!isPasswordValid) {
      return {
        ok: false,
        error: new Error("invalid password"),
      } as Result<string>;
    }

    const resultSignedToken = tryCatch<string>(() => jwtSign(inU.id));
    if (!resultSignedToken.ok) {
      return resultSignedToken;
    }

    return {
      ok: true,
      value: resultSignedToken.value,
    } satisfies Result<string>;
  }
}
