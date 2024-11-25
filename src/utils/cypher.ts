import "dotenv/config";
import { hash, compare, genSalt } from "bcryptjs";
import jwt, {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
  VerifyErrors,
} from "jsonwebtoken";

export const hashPassword = async (pw: string) => {
  const salt = await genSalt(10);
  return hash(pw, salt);
};
export const comparePassword = (raw: string, hash: string) =>
  compare(raw, hash);

const jwtSecret = String(process.env.JWT_SECRET);
const atLT = String(process.env.AT_LIVETIME);

export const jwtSign = (uid: number) =>
  jwt.sign({ uid }, jwtSecret, { expiresIn: atLT });
export const jwtVerify = (token: string) => jwt.verify(token, jwtSecret);

export type JWTClaims = { uid: number };

export function isJWTVerifyErrors(e: unknown): e is VerifyErrors {
  const isJWTErr = e instanceof JsonWebTokenError;
  const isNotBeforeErr = e instanceof NotBeforeError;
  const isExpiredErr = e instanceof TokenExpiredError;

  return isJWTErr || isNotBeforeErr || isExpiredErr;
}
