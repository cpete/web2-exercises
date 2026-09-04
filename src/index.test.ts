import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "./index.js";

async function login(username: string, password: string) {
  const res = await request(app).post("/login").send({ username, password }).expect(200);
  return res.body as { accessToken: string; refreshToken: string };
}

describe("stateless token authentication", () => {
  it("rejects login with bad credentials", async () => {
    await request(app).post("/login").send({ username: "alice", password: "nope" }).expect(401);
  });

  it("issues an access and refresh token on login", async () => {
    const body = await login("alice", "password123");
    expect(typeof body.accessToken).toBe("string");
    expect(typeof body.refreshToken).toBe("string");
  });

  it("rejects /me without a bearer token", async () => {
    await request(app).get("/me").expect(401);
  });

  it("accepts a valid access token on /me", async () => {
    const { accessToken } = await login("alice", "password123");
    const res = await request(app)
      .get("/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body).toEqual({ username: "alice" });
  });

  it("rejects a refresh token used as an access token", async () => {
    const { refreshToken } = await login("alice", "password123");
    await request(app).get("/me").set("Authorization", `Bearer ${refreshToken}`).expect(401);
  });

  it("mints a working access token from a refresh token", async () => {
    const { refreshToken } = await login("bob", "hunter2");

    const refreshed = await request(app).post("/refresh").send({ refreshToken }).expect(200);
    const accessToken = (refreshed.body as { accessToken: string }).accessToken;

    const me = await request(app)
      .get("/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expect(me.body).toEqual({ username: "bob" });
  });

  it("rejects /refresh when given an access token", async () => {
    const { accessToken } = await login("alice", "password123");
    await request(app).post("/refresh").send({ refreshToken: accessToken }).expect(401);
  });

  it("rejects /refresh with a missing or garbage token", async () => {
    await request(app).post("/refresh").send({}).expect(400);
    await request(app).post("/refresh").send({ refreshToken: "not-a-jwt" }).expect(401);
  });
});
