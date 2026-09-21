import { argv } from "node:process";
import { fileURLToPath } from "node:url";
import { EventStore } from "./event-store.js";

export function greet(name: string): string {
  return `Hello, ${name}!`;
}

// implement an HTTP API with the following endpoints:
// POST /account - create a new account
// POST /account/:id/deposit - deposit money into an account
// POST /account/:id/withdraw - withdraw money from an account
// GET /account/:id - get the balance of an account
export function createApp(): express.Express {
  const eventStore = new EventStore();
  const app = express();
  app.use(express.json());

  app.post("/account", (_req, res) => {
    // TODO: Implement
  });

  app.post("/account/:id/deposit", (req, res) => {
    // TODO: Implement
  });

  app.post("/account/:id/withdraw", (req, res) => {
    // TODO: Implement
  });

  app.get("/account/:id", (req, res) => {
    // TODO: Implement
  });

  return app;
}

const isMain = argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  console.log(greet("world"));
}
