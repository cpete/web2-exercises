# web2-exercises

Web 2 course exercises — Node.js + TypeScript.

## Session-based authentication

Branch `stateful-session-auth`.

An Express server ([src/index.ts](src/index.ts)) with a hand-rolled session layer
([src/auth.ts](src/auth.ts)): login checks a bcrypt hash, a random session id is
stored in an in-memory `Map` and handed to the client as an `httpOnly` cookie
(`sid`), and `requireAuth` middleware guards protected routes. Sessions expire
after one hour and are lost on restart.

### Demo accounts

| Username | Password      |
| -------- | ------------- |
| `alice`  | `password123` |
| `bob`    | `hunter2`     |

### Endpoints

| Method & path  | Auth | Body                   | Description                                                              |
| -------------- | ---- | ---------------------- | ------------------------------------------------------------------------ |
| `GET /`        | –    | –                      | Public hello world                                                       |
| `GET /login`   | –    | –                      | Small HTML login form that posts to `POST /login`                        |
| `POST /login`  | –    | `username`, `password` | Form post → `302` to `/me`; JSON post → `{ ok: true }`; `401` on failure |
| `POST /logout` | –    | –                      | Destroys the session and clears the cookie (`{ ok: true }`)              |
| `GET /logout`  | –    | –                      | Same, then `302` to `/login` (usable as a plain link)                    |
| `GET /me`      | ✅   | –                      | Returns `{ username }` for the current session                           |

`POST /login` accepts either an HTML form (`application/x-www-form-urlencoded`) or
a JSON body. Form submissions redirect to `/me` on success and re-render the form
with an error message on failure; JSON clients get JSON responses.

```bash
npm run dev
# then open http://localhost:3000/login in a browser, or use the API directly:
curl -i -c jar.txt -X POST localhost:3000/login \
  -H 'content-type: application/json' \
  -d '{"username":"alice","password":"password123"}'
curl -b jar.txt localhost:3000/me
curl -b jar.txt -X POST localhost:3000/logout
```

The cookie is sent with `secure: false` for local HTTP — set `secure: true` when
serving over HTTPS.

## Requirements

- Node.js >= 20

## Setup

```bash
npm install
```

## Scripts

| Command              | Description                                |
| -------------------- | ------------------------------------------ |
| `npm run dev`        | Run `src/index.ts` with watch mode (`tsx`) |
| `npm run build`      | Compile TypeScript to `dist/`              |
| `npm start`          | Run the compiled output (`dist/index.js`)  |
| `npm test`           | Run the test suite once (`vitest`)         |
| `npm run test:watch` | Run tests in watch mode                    |
| `npm run typecheck`  | Type-check without emitting                |
| `npm run lint`       | Lint with ESLint                           |
| `npm run format`     | Format with Prettier                       |

## Layout

```
src/            source files
  index.ts      Express app + routes
  auth.ts       session store, credential checks, requireAuth middleware
  index.test.ts co-located tests
dist/           build output (git-ignored)
```
