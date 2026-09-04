import { argv } from "node:process";
import { fileURLToPath } from "node:url";

import express from "express";

import {
  ACCESS_TOKEN_TTL_SECONDS,
  issueAccessToken,
  issueTokens,
  requireAuth,
  verifyCredentials,
  verifyRefreshToken,
} from "./auth.js";

export const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body ?? {};
  if (typeof username !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "username and password are required" });
    return;
  }

  if (!(await verifyCredentials(username, password))) {
    res.status(401).json({ error: "invalid credentials" });
    return;
  }

  const { accessToken, refreshToken } = issueTokens(username);
  res.json({
    accessToken,
    refreshToken,
    tokenType: "Bearer",
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
  });
});

app.post("/refresh", (req, res) => {
  const { refreshToken } = req.body ?? {};
  if (typeof refreshToken !== "string") {
    res.status(400).json({ error: "refreshToken is required" });
    return;
  }

  let username: string;
  try {
    ({ username } = verifyRefreshToken(refreshToken));
  } catch {
    res.status(401).json({ error: "invalid or expired refresh token" });
    return;
  }

  res.json({
    accessToken: issueAccessToken(username),
    tokenType: "Bearer",
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
  });
});

app.get("/me", requireAuth, (req, res) => {
  res.json({ username: req.username });
});

const isMain = argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}
