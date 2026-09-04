import { env } from "node:process";

import bcrypt from "bcryptjs";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

/**
 * Signing secrets. Access and refresh tokens use *different* secrets so a
 * refresh token can never be replayed as an access token (or vice versa).
 * Configure them via the environment in anything but local development.
 */
const ACCESS_TOKEN_SECRET = env.ACCESS_TOKEN_SECRET ?? "dev-access-secret";
const REFRESH_TOKEN_SECRET = env.REFRESH_TOKEN_SECRET ?? "dev-refresh-secret";

if (!env.ACCESS_TOKEN_SECRET || !env.REFRESH_TOKEN_SECRET) {
  console.warn(
    "[auth] ACCESS_TOKEN_SECRET / REFRESH_TOKEN_SECRET not set — using insecure development defaults",
  );
}

/** Lifetimes, kept short for the access token and long for the refresh token. */
export const ACCESS_TOKEN_TTL = "15m";
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL = "7d";

type TokenType = "access" | "refresh";

interface TokenPayload extends jwt.JwtPayload {
  sub: string;
  type: TokenType;
}

interface DemoUser {
  username: string;
  passwordHash: string;
}

/** Hardcoded demo accounts; passwords are hashed once at startup. */
const DEMO_USERS: DemoUser[] = [
  { username: "alice", password: "password123" },
  { username: "bob", password: "hunter2" },
].map(({ username, password }) => ({
  username,
  passwordHash: bcrypt.hashSync(password, 10),
}));

/** A valid hash that nothing matches, used to keep failed logins constant-time. */
const DUMMY_HASH = bcrypt.hashSync("dummy", 10);

/** Resolve to `true` when the credentials match a known user. */
export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const user = DEMO_USERS.find((u) => u.username === username);
  if (!user) {
    await bcrypt.compare(password, DUMMY_HASH);
    return false;
  }
  return bcrypt.compare(password, user.passwordHash);
}

function sign(username: string, type: TokenType): string {
  const secret = type === "access" ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET;
  const expiresIn = type === "access" ? ACCESS_TOKEN_TTL : REFRESH_TOKEN_TTL;
  return jwt.sign({ sub: username, type }, secret, { expiresIn });
}

function verify(token: string, type: TokenType): { username: string } {
  const secret = type === "access" ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET;
  const payload = jwt.verify(token, secret) as TokenPayload;
  if (payload.type !== type || typeof payload.sub !== "string") {
    throw new jwt.JsonWebTokenError(`expected a ${type} token`);
  }
  return { username: payload.sub };
}

/** Mint a fresh access + refresh token pair for `username`. */
export function issueTokens(username: string): { accessToken: string; refreshToken: string } {
  return {
    accessToken: sign(username, "access"),
    refreshToken: sign(username, "refresh"),
  };
}

/** Mint a new access token for `username`. */
export function issueAccessToken(username: string): string {
  return sign(username, "access");
}

/** Validate an access token; throws (JsonWebTokenError / TokenExpiredError) if invalid. */
export function verifyAccessToken(token: string): { username: string } {
  return verify(token, "access");
}

/** Validate a refresh token; throws (JsonWebTokenError / TokenExpiredError) if invalid. */
export function verifyRefreshToken(token: string): { username: string } {
  return verify(token, "refresh");
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      username?: string;
    }
  }
}

/**
 * Express middleware: requires a valid `Authorization: Bearer <access token>`
 * header. On success it attaches `req.username`.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.get("authorization") ?? "";
  const match = /^Bearer (.+)$/.exec(header);
  if (!match) {
    res.status(401).json({ error: "authentication required" });
    return;
  }

  try {
    const { username } = verifyAccessToken(match[1]!);
    req.username = username;
    next();
  } catch {
    res.status(401).json({ error: "invalid or expired token" });
  }
}
