import { describe, expect, it } from "vitest";

import { words } from "./data.js";
import { searchWords } from "./search.js";

describe("searchWords", () => {
  it("has exactly 500 words in the corpus", () => {
    expect(words.length).toBe(500);
  });

  it("matches words by prefix", () => {
    expect(searchWords("app")).toEqual(expect.arrayContaining(["apple"]));
  });

  it("is case-insensitive", () => {
    expect(searchWords("APP")).toEqual(searchWords("app"));
  });

  it("trims surrounding whitespace", () => {
    expect(searchWords("  app  ")).toEqual(searchWords("app"));
  });

  it("returns an empty array for an empty query", () => {
    expect(searchWords("")).toEqual([]);
  });

  it("returns an empty array when no word matches", () => {
    expect(searchWords("qzx")).toEqual([]);
  });
});
