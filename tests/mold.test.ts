import { describe, expect, it } from "vitest";
import { Characters, EnumMold, MapMold, Mold, StringMold } from "../src/index";

describe("Mold", () => {
  type PersonProperties = {
    name: string;
    age: number;
  };

  type Person = {
    name: string;
    age: number;
  };

  const personMold = Mold<Person, PersonProperties>({
    pour: (properties) => ({
      name: properties.name,
      age: properties.age,
    }),
    prepare: (overrides, seed) => ({
      name: overrides.name ?? `Person${seed}`,
      age: overrides.age ?? seed % 100,
    }),
  });

  it("should create an instance with seed", () => {
    const person = personMold.pour({}, 42);

    expect(person.name).toBe("Person42");
    expect(person.age).toBe(42);
  });

  it("should allow overrides", () => {
    const person = personMold.pour({ name: "Custom" }, 42);

    expect(person.name).toBe("Custom");
    expect(person.age).toBe(42);
  });

  it("should produce consistent results for the same seed", () => {
    const person1 = personMold.pour({}, 100);
    const person2 = personMold.pour({}, 100);

    expect(person1).toEqual(person2);
  });
});

describe("StringMold", () => {
  it("should create a string with default settings", () => {
    const mold = StringMold();
    const result = mold.pour({}, 10);

    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.length).toBeLessThanOrEqual(255);
  });

  it("should respect minimum and maximum length", () => {
    const mold = StringMold(5, 10);
    const result = mold.pour({}, 0);

    expect(result.length).toBeGreaterThanOrEqual(5);
    expect(result.length).toBeLessThanOrEqual(10);
  });

  it("should use custom characters", () => {
    const mold = StringMold(10, 10, ["x"]);
    const result = mold.pour({}, 42);

    expect(result).toBe("xxxxxxxxxx");
  });

  it("should produce consistent results for the same seed", () => {
    const mold = StringMold();
    const result1 = mold.pour({}, 42);
    const result2 = mold.pour({}, 42);

    expect(result1).toBe(result2);
  });

  it("should allow value override", () => {
    const mold = StringMold();
    const result = mold.pour({ value: "custom" }, 42);

    expect(result).toBe("custom");
  });

  it("should use ALPHA characters when specified", () => {
    const mold = StringMold(10, 10, Characters.ALPHA);
    const result = mold.pour({}, 42);

    expect(result).toMatch(/^[a-zA-Z]+$/);
  });

  it("should use NUMERIC characters when specified", () => {
    const mold = StringMold(10, 10, Characters.NUMERIC);
    const result = mold.pour({}, 42);

    expect(result).toMatch(/^[0-9]+$/);
  });
});

describe("EnumMold", () => {
  const Status = {
    Active: "active",
    Inactive: "inactive",
    Pending: "pending",
  } as const;

  it("should create a value from enum", () => {
    const mold = EnumMold(Status);
    const result = mold.pour({}, 0);

    expect(Object.values(Status)).toContain(result);
  });

  it("should produce consistent results for the same seed", () => {
    const mold = EnumMold(Status);
    const result1 = mold.pour({}, 42);
    const result2 = mold.pour({}, 42);

    expect(result1).toBe(result2);
  });

  it("should allow value override", () => {
    const mold = EnumMold(Status);
    const result = mold.pour({ value: "active" }, 42);

    expect(result).toBe("active");
  });

  it("should exclude single value", () => {
    const mold = EnumMold(Status);

    for (let seed = 0; seed < 100; seed++) {
      const result = mold.pour({ exclusion: "active" }, seed);
      expect(result).not.toBe("active");
    }
  });

  it("should exclude multiple values using Set", () => {
    const mold = EnumMold(Status);
    const exclusions = new Set(["active", "inactive"] as const);

    for (let seed = 0; seed < 100; seed++) {
      const result = mold.pour({ exclusion: exclusions }, seed);
      expect(result).toBe("pending");
    }
  });

  it("should throw when all candidates are excluded", () => {
    const mold = EnumMold(Status);
    const exclusions = new Set(["active", "inactive", "pending"] as const);

    expect(() => mold.pour({ exclusion: exclusions }, 0)).toThrow(
      "Candidates does not exist.",
    );
  });
});

describe("MapMold", () => {
  it("should create a Map", () => {
    const keyMold = StringMold(5, 5);
    const valueMold = StringMold(10, 10);
    const mold = MapMold(keyMold, valueMold);

    const result = mold.pour({}, 42);

    expect(result).toBeInstanceOf(Map);
    expect(result.size).toBeGreaterThan(0);
    expect(result.size).toBeLessThanOrEqual(10);
  });

  it("should produce consistent results for the same seed", () => {
    const keyMold = StringMold(5, 5);
    const valueMold = StringMold(10, 10);
    const mold = MapMold(keyMold, valueMold);

    const result1 = mold.pour({}, 42);
    const result2 = mold.pour({}, 42);

    expect(Array.from(result1.entries())).toEqual(
      Array.from(result2.entries()),
    );
  });

  it("should allow entries override", () => {
    const keyMold = StringMold(5, 5);
    const valueMold = StringMold(10, 10);
    const mold = MapMold(keyMold, valueMold);

    const customEntries: [string, string][] = [
      ["key1", "value1"],
      ["key2", "value2"],
    ];

    const result = mold.pour({ entries: customEntries }, 42);

    expect(result.get("key1")).toBe("value1");
    expect(result.get("key2")).toBe("value2");
  });
});
