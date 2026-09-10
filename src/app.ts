import express, { type Express } from "express";

import { searchWords } from "./search.js";

export function createApp(): Express {
  const app = express();

  app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  });

  app.get("/api/search", (req, res) => {
    const { q } = req.query;
    if (typeof q !== "string") {
      res.status(400).json({ error: "Query parameter 'q' is required" });
      return;
    }
    // delay the response to simulate a slow API
    // random value between 100 and 500 milliseconds
    // delay a shorter query string more than a longer query string to simulate a more realistic search experience
    const delay = Math.floor(Math.random() * 401) + 100 + (q.length * 50);
    setTimeout(() => {
      res.json(searchWords(q));
    }, delay);
  });

  return app;
}
