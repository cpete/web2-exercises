# web2-exercises

Web 2 course exercises — Node.js + TypeScript.

## Stateless token authentication

Branch `stateless-token-auth`.

An Express server ([src/index.ts](src/index.ts)) with JWT-based auth
([src/auth.ts](src/auth.ts)): login returns a short-lived **access token** and a
longer-lived **refresh token**, both signed JWTs. The server keeps no session
state — every request is authorised by verifying the token's signature and
expiry. Access and refresh tokens are signed with **separate** secrets so one
cannot be used in place of the other.

### Demo accounts

| Username | Password      |
| -------- | ------------- |
| `alice`  | `password123` |
| `bob`    | `hunter2`     |

### Endpoints

| Method & path   | Auth              | Body                     | Description                                           |
| --------------- | ----------------- | ------------------------ | ----------------------------------------------------- |
| `GET /`         | –                 | –                        | Public hello world                                    |
| `POST /login`   | –                 | `{ username, password }` | `{ accessToken, refreshToken, tokenType, expiresIn }` |
| `POST /refresh` | –                 | `{ refreshToken }`       | `{ accessToken, tokenType, expiresIn }`               |
| `GET /me`       | `Bearer` (access) | –                        | `{ username }` for the token's subject                |

- Access token TTL: **15 minutes**. Refresh token TTL: **7 days**.
- Send the access token as `Authorization: Bearer <accessToken>`.
- There is no logout — a stateless client simply discards its tokens. `/refresh`
  does not rotate the refresh token; it only issues a new access token.

```bash
npm run dev

# log in
TOKENS=$(curl -s -X POST localhost:3000/login \
  -H 'content-type: application/json' \
  -d '{"username":"alice","password":"password123"}')
ACCESS=$(echo "$TOKENS"  | node -pe 'JSON.parse(require("fs").readFileSync(0)).accessToken')
REFRESH=$(echo "$TOKENS" | node -pe 'JSON.parse(require("fs").readFileSync(0)).refreshToken')

# call a protected route
curl -s localhost:3000/me -H "Authorization: Bearer $ACCESS"

# get a new access token when it expires
curl -s -X POST localhost:3000/refresh \
  -H 'content-type: application/json' \
  -d "{\"refreshToken\":\"$REFRESH\"}"
```

### Configuration

Signing secrets come from the environment; without them the server uses insecure
development defaults and logs a warning.

```bash
cp .env.example .env      # then edit the values
node --env-file=.env dist/index.js
```

| Variable               | Purpose                        |
| ---------------------- | ------------------------------ |
| `ACCESS_TOKEN_SECRET`  | HMAC secret for access tokens  |
| `REFRESH_TOKEN_SECRET` | HMAC secret for refresh tokens |

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
  auth.ts       token issue/verify, requireAuth middleware
  index.test.ts co-located tests
dist/           build output (git-ignored)
```
