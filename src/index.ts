import { argv } from "node:process";
import { fileURLToPath } from "node:url";

import express from "express";

import { Account } from "./account.js";
import type { AccountEvent } from "./event.js";
import { EventStore } from "./event-store.js";
import { AccountBalanceProjection } from "./projection.js";

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
  const balanceProjection = new AccountBalanceProjection();

  // Persists an event and feeds it to the read model, keeping the projection up to date
  // incrementally so queries never have to replay the event stream.
  function record(accountId: string, event: AccountEvent): void {
    eventStore.append(accountId, event);
    balanceProjection.on(event);
  }

  const app = express();
  app.use(express.json());

  app.post("/account", (_req, res) => {
    const accountId = crypto.randomUUID();
    const account = new Account(accountId);

    try {
      const event = account.handle({ accountId, type: "OpenAccount" });
      record(accountId, event);
      res.status(201).json({ id: accountId, balance: balanceProjection.balanceOf(accountId) });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post("/account/:id/deposit", (req, res) => {
    const { id } = req.params;
    const events = eventStore.load(id);

    if (events.length === 0) {
      res.status(404).json({ error: "Account not found" });
      return;
    }

    // Reconstruct the account from its event history to validate the deposit command.
    // This is the write side of the CQRS pattern, where we validate commands against the current state of the aggregate.
    const account = Account.fromEvents(id, events);
    try {
      const event = account.handle({ accountId: id, type: "Deposit", amount: req.body.amount });
      record(id, event);
      res.status(200).json({ id, balance: balanceProjection.balanceOf(id) });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post("/account/:id/withdraw", (req, res) => {
    const { id } = req.params;
    const events = eventStore.load(id);

    if (events.length === 0) {
      res.status(404).json({ error: "Account not found" });
      return;
    }

    // Reconstruct the account from its event history to validate the withdrawal command.
    // This is the write side of the CQRS pattern, where we validate commands against the current state of the aggregate.
    const account = Account.fromEvents(id, events);
    try {
      const event = account.handle({ accountId: id, type: "Withdraw", amount: req.body.amount });
      record(id, event);
      res.status(200).json({ id, balance: balanceProjection.balanceOf(id) });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get("/account/:id", (req, res) => {
    const { id } = req.params;

    if (eventStore.load(id).length === 0) {
      res.status(404).json({ error: "Account not found" });
      return;
    }

    // Return the balance from the projection, which is kept up to date with events.
    res.status(200).json({ id, balance: balanceProjection.balanceOf(id) });
  });

  return app;
}

const isMain = argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  console.log(greet("world"));

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  createApp().listen(port, () => {
    console.log(`Account API listening on port ${port}`);
  });
}
