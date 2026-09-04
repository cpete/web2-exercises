import { randomUUID } from "node:crypto";

import bcrypt from "bcryptjs";
import type { NextFunction, Request, Response } from "express";

/** How long a session stays valid after creation. */
export const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

/** Name of the cookie that carries the session id. */
export const SESSION_COOKIE = "sid";

interface Session {
  username: string;
  expiresAt: number;
}

/**
 * In-memory session store, keyed by session id (not by username) so a single
 * user can hold several concurrent sessions. Cleared on server restart.
 */
const sessions = new Map<string, Session>();

interface DemoUser {
  username: string;
  passwordHash: string;
}

/**
 * Hardcoded demo accounts. Passwords are hashed once at startup so the rest of
 * the code only ever sees the hash.
 */
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
    // Compare against a dummy hash anyway to keep timing roughly constant.
    await bcrypt.compare(password, DUMMY_HASH);
    return false;
  }
  return bcrypt.compare(password, user.passwordHash);
}

/** Create a session for `username` and return its id. */
export function createSession(username: string): string {
  const id = randomUUID();
  sessions.set(id, { username, expiresAt: Date.now() + SESSION_TTL_MS });
  return id;
}

/** Look up a live session, deleting it if it has expired. */
export function getSession(id: string | undefined): Session | undefined {
  if (!id) return undefined;
  const session = sessions.get(id);
  if (!session) return undefined;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(id);
    return undefined;
  }
  return session;
}

/** Remove a session if it exists. */
export function destroySession(id: string | undefined): void {
  if (id) sessions.delete(id);
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      session?: Session;
      username?: string;
    }
  }
}

/**
 * Express middleware: rejects the request with 401 unless it carries a valid
 * session cookie. On success it attaches `req.session` and `req.username`.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const session = getSession(req.cookies?.[SESSION_COOKIE] as string | undefined);
  if (!session) {
    res.status(401).json({ error: "authentication required" });
    return;
  }
  req.session = session;
  req.username = session.username;
  next();
}
