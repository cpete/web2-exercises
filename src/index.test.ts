import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "./index.js";

describe("session authentication", () => {
  it("rejects /me without a session", async () => {
    await request(app).get("/me").expect(401);
  });

  it("rejects login with bad credentials", async () => {
    await request(app).post("/login").send({ username: "alice", password: "nope" }).expect(401);
  });

  it("serves an HTML login form on GET /login", async () => {
    const res = await request(app).get("/login").expect(200).expect("Content-Type", /html/);
    expect(res.text).toContain('<form method="post" action="/login">');
    expect(res.text).toContain('name="username"');
    expect(res.text).toContain('name="password"');
  });

  it("redirects to /me after a successful form submission", async () => {
    const agent = request.agent(app);

    await agent
      .post("/login")
      .type("form")
      .send({ username: "bob", password: "hunter2" })
      .expect(302)
      .expect("Location", "/me");

    const me = await agent.get("/me").expect(200);
    expect(me.body).toEqual({ username: "bob" });
  });

  it("re-renders the form with an error on a failed submission", async () => {
    const res = await request(app)
      .post("/login")
      .type("form")
      .send({ username: "bob", password: "wrong" })
      .expect(401)
      .expect("Content-Type", /html/);
    expect(res.text).toContain("invalid credentials");
  });

  it("logs in, reads /me, then logs out", async () => {
    const agent = request.agent(app);

    const login = await agent
      .post("/login")
      .send({ username: "alice", password: "password123" })
      .expect(200);
    expect(login.headers["set-cookie"]?.[0]).toMatch(/sid=/);

    const me = await agent.get("/me").expect(200);
    expect(me.body).toEqual({ username: "alice" });

    await agent.post("/logout").expect(200);
    await agent.get("/me").expect(401);
  });

  it("logs out via GET /logout and redirects to /login", async () => {
    const agent = request.agent(app);

    await agent
      .post("/login")
      .type("form")
      .send({ username: "alice", password: "password123" })
      .expect(302);
    await agent.get("/me").expect(200);

    await agent.get("/logout").expect(302).expect("Location", "/login");
    await agent.get("/me").expect(401);
  });
});
