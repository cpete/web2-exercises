import type { AddressInfo } from "node:net";

import { describe, expect, it } from "vitest";

import { createApp, greet } from "./index.js";

describe("greet", () => {
  it("greets by name", () => {
    expect(greet("Ada")).toBe("Hello, Ada!");
  });
});

type AccountResponse = { id: string; balance: number };

describe("account API", () => {
  async function withServer(run: (baseUrl: string) => Promise<void>): Promise<void> {
    const server = createApp().listen(0);
    try {
      const { port } = server.address() as AddressInfo;
      await run(`http://localhost:${port}`);
    } finally {
      server.close();
    }
  }

  it("creates a new account with a zero balance", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/account`, { method: "POST" });
      const body = (await response.json()) as AccountResponse;

      expect(response.status).toBe(201);
      expect(body).toMatchObject({ balance: 0 });
      expect(body.id).toEqual(expect.any(String));
    });
  });

  it("deposits and withdraws money from an account", async () => {
    await withServer(async (baseUrl) => {
      const created = await fetch(`${baseUrl}/account`, { method: "POST" });
      const { id } = (await created.json()) as AccountResponse;

      const deposit = await fetch(`${baseUrl}/account/${id}/deposit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 100 }),
      });
      expect(deposit.status).toBe(200);
      expect(((await deposit.json()) as AccountResponse).balance).toBe(100);

      const withdrawal = await fetch(`${baseUrl}/account/${id}/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 40 }),
      });
      expect(withdrawal.status).toBe(200);
      expect(((await withdrawal.json()) as AccountResponse).balance).toBe(60);

      const balance = await fetch(`${baseUrl}/account/${id}`);
      expect(((await balance.json()) as AccountResponse).balance).toBe(60);
    });
  });

  it("rejects a withdrawal that exceeds the balance", async () => {
    await withServer(async (baseUrl) => {
      const created = await fetch(`${baseUrl}/account`, { method: "POST" });
      const { id } = (await created.json()) as AccountResponse;

      const withdrawal = await fetch(`${baseUrl}/account/${id}/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 10 }),
      });

      expect(withdrawal.status).toBe(400);
    });
  });

  it("returns 404 for an account that does not exist", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/account/does-not-exist`);
      expect(response.status).toBe(404);
    });
  });
});
