# web2-exercises

Web 2 course exercises — Node.js + TypeScript.

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
  index.ts      entry point
  index.test.ts co-located tests
dist/           build output (git-ignored)
```
