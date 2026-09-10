import { describe, expect, it } from "vitest";
import request from "supertest";

import { createApp } from "./app.js";

describe("GET /api/search", () => {
  const app = createApp();

  it("returns words matching the query prefix", async () => {
    const res = await request(app).get("/api/search").query({ q: "ap" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.arrayContaining(["apple", "apricot"]));
  });

  it("is case-insensitive", async () => {
    const res = await request(app).get("/api/search").query({ q: "Ap" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.arrayContaining(["apple", "apricot"]));
  });

  it("returns an empty array when nothing matches", async () => {
    const res = await request(app).get("/api/search").query({ q: "zzzzz" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns 400 when q is missing", async () => {
    const res = await request(app).get("/api/search");
    expect(res.status).toBe(400);
  });
});
