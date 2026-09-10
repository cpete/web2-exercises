# web2-exercises

Web 2 course exercises — Node.js + TypeScript.

## Requirements

- Node.js >= 20

## Setup

```bash
npm install
```

## Scripts

| Command              | Description                                                 |
| -------------------- | ----------------------------------------------------------- |
| `npm run dev`        | Run the API backend and the static web server in watch mode |
| `npm run build`      | Compile TypeScript to `dist/`                               |
| `npm start`          | Run the compiled backend and web server together            |
| `npm test`           | Run the test suite once (`vitest`)                          |
| `npm run test:watch` | Run tests in watch mode                                     |
| `npm run typecheck`  | Type-check without emitting                                 |
| `npm run lint`       | Lint with ESLint                                            |
| `npm run format`     | Format with Prettier                                        |

The backend (API) listens on port 3000 (`PORT` env var), the web server on port 8080 (`WEB_PORT` env var).

## Layout

```
src/              source files
  index.ts        API backend entry point (createApp)
  app.ts          Express app exposing GET /api/search
  data.ts         hardcoded word corpus
  search.ts       search logic
  *.test.ts       co-located tests
public/           static assets served by the web server
  index.html      search page
dist/             build output (git-ignored)
```
