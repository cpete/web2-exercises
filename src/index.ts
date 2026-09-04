import { argv } from "node:process";
import { fileURLToPath } from "node:url";

import cookieParser from "cookie-parser";
import express from "express";

import {
  createSession,
  destroySession,
  requireAuth,
  SESSION_COOKIE,
  SESSION_TTL_MS,
  verifyCredentials,
} from "./auth.js";

export const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.get("/login", (req, res) => {
  res.type("html").send(renderLoginPage());
});

app.post("/login", async (req, res) => {
  const fromForm = req.is("urlencoded") !== false;
  const { username, password } = req.body ?? {};

  if (typeof username !== "string" || typeof password !== "string") {
    respondLoginError(res, fromForm, 400, "username and password are required");
    return;
  }

  if (!(await verifyCredentials(username, password))) {
    respondLoginError(res, fromForm, 401, "invalid credentials");
    return;
  }

  const sid = createSession(username);
  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // localhost is HTTP; set true behind HTTPS in production
    maxAge: SESSION_TTL_MS,
  });

  if (fromForm) {
    res.redirect("/me");
    return;
  }
  res.json({ ok: true });
});

function clearSession(req: express.Request, res: express.Response): void {
  destroySession(req.cookies?.[SESSION_COOKIE]);
  res.clearCookie(SESSION_COOKIE);
}

app.post("/logout", (req, res) => {
  clearSession(req, res);
  res.json({ ok: true });
});

// GET variant so a browser can log out via a plain link.
app.get("/logout", (req, res) => {
  clearSession(req, res);
  res.redirect("/login");
});

app.get("/me", requireAuth, (req, res) => {
  res.json({ username: req.username });
});

/** Send a login failure as an HTML form (browser) or JSON (API client). */
function respondLoginError(
  res: express.Response,
  fromForm: boolean,
  status: number,
  message: string,
): void {
  if (fromForm) {
    res.status(status).type("html").send(renderLoginPage(message));
    return;
  }
  res.status(status).json({ error: message });
}

function renderLoginPage(error?: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Log in</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; min-height: 100vh;
           display: grid; place-items: center; background: #f4f4f5; }
    form { background: #fff; padding: 2rem; border-radius: 8px; width: 260px;
           display: grid; gap: 0.75rem; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1); }
    h1 { margin: 0 0 0.5rem; font-size: 1.25rem; }
    label { display: grid; gap: 0.25rem; font-size: 0.875rem; }
    input { padding: 0.5rem; border: 1px solid #d4d4d8; border-radius: 4px; font: inherit; }
    button { padding: 0.5rem; border: 0; border-radius: 4px; background: #2563eb;
             color: #fff; font: inherit; cursor: pointer; }
    .error { margin: 0; color: #b91c1c; font-size: 0.875rem; }
  </style>
</head>
<body>
  <form method="post" action="/login">
    <h1>Log in</h1>
    ${error ? `<p class="error">${escapeHtml(error)}</p>` : ""}
    <label>Username
      <input name="username" autocomplete="username" required autofocus />
    </label>
    <label>Password
      <input type="password" name="password" autocomplete="current-password" required />
    </label>
    <button type="submit">Log in</button>
  </form>
</body>
</html>
`;
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char,
  );
}

const isMain = argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}
