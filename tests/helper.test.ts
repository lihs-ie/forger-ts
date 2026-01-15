import { describe, expect, it } from "vitest";
import { Characters, scramble } from "../src/helper";

describe("scramble", () => {
  it("should return consistent results for the same input", () => {
    const result1 = scramble(42);
    const result2 = scramble(42);

    expect(result1).toBe(result2);
  });

  it("should return different results for different inputs", () => {
    const result1 = scramble(1);
    const result2 = scramble(2);

    expect(result1).not.toBe(result2);
  });

  it("should return a number", () => {
    const result = scramble(12345);

    expect(typeof result).toBe("number");
  });

  it("should handle zero", () => {
    const result = scramble(0);

    expect(typeof result).toBe("number");
  });

  it("should handle large numbers", () => {
    const result = scramble(Number.MAX_SAFE_INTEGER);

    expect(typeof result).toBe("number");
  });
});

describe("Characters", () => {
  it("should have ALPHANUMERIC characters", () => {
    expect(Characters.ALPHANUMERIC.length).toBe(62);
    expect(Characters.ALPHANUMERIC).toContain("a");
    expect(Characters.ALPHANUMERIC).toContain("Z");
    expect(Characters.ALPHANUMERIC).toContain("0");
    expect(Characters.ALPHANUMERIC).toContain("9");
  });

  it("should have ALPHA characters", () => {
    expect(Characters.ALPHA.length).toBe(52);
    expect(Characters.ALPHA).toContain("a");
    expect(Characters.ALPHA).toContain("Z");
    expect(Characters.ALPHA).not.toContain("0");
  });

  it("should have SLUG characters", () => {
    expect(Characters.SLUG.length).toBe(37);
    expect(Characters.SLUG).toContain("a");
    expect(Characters.SLUG).toContain("-");
    expect(Characters.SLUG).not.toContain("A");
  });

  it("should have NUMERIC characters", () => {
    expect(Characters.NUMERIC.length).toBe(10);
    expect(Characters.NUMERIC).toContain("0");
    expect(Characters.NUMERIC).toContain("9");
    expect(Characters.NUMERIC).not.toContain("a");
  });

  it("should have SYMBOL characters", () => {
    expect(Characters.SYMBOL.length).toBeGreaterThan(0);
    expect(Characters.SYMBOL).toContain("!");
    expect(Characters.SYMBOL).toContain("@");
  });
});
