import { describe, expect, it } from "vitest";
import { Forger, Mold, StringMold } from "../src/index";

describe("Forger", () => {
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

  describe("forge", () => {
    it("should create an instance", () => {
      const forger = Forger(personMold);
      const person = forger.forge();

      expect(person.name).toMatch(/^Person\d+$/);
      expect(typeof person.age).toBe("number");
    });

    it("should allow overrides", () => {
      const forger = Forger(personMold);
      const person = forger.forge({ name: "Custom" });

      expect(person.name).toBe("Custom");
    });

    it("should produce unique instances on each call", () => {
      const forger = Forger(personMold);
      const person1 = forger.forge();
      const person2 = forger.forge();

      expect(person1.name).not.toBe(person2.name);
    });
  });

  describe("forgeMulti", () => {
    it("should create multiple instances", () => {
      const forger = Forger(personMold);
      const people = forger.forgeMulti(5);

      expect(people.length).toBe(5);
    });

    it("should produce unique instances", () => {
      const forger = Forger(personMold);
      const people = forger.forgeMulti(10);

      const names = people.map((person) => person.name);
      const uniqueNames = new Set(names);

      expect(uniqueNames.size).toBe(10);
    });

    it("should apply overrides to all instances", () => {
      const forger = Forger(personMold);
      const people = forger.forgeMulti(3, { age: 25 });

      for (const person of people) {
        expect(person.age).toBe(25);
      }
    });
  });

  describe("forgeWithSeed", () => {
    it("should create an instance with specific seed", () => {
      const forger = Forger(personMold);
      const person = forger.forgeWithSeed(42);

      expect(person.name).toBe("Person42");
      expect(person.age).toBe(42);
    });

    it("should produce consistent results for the same seed", () => {
      const forger = Forger(personMold);
      const person1 = forger.forgeWithSeed(100);
      const person2 = forger.forgeWithSeed(100);

      expect(person1).toEqual(person2);
    });

    it("should allow overrides", () => {
      const forger = Forger(personMold);
      const person = forger.forgeWithSeed(42, { name: "Custom" });

      expect(person.name).toBe("Custom");
      expect(person.age).toBe(42);
    });
  });

  describe("forgeMultiWithSeed", () => {
    it("should create multiple instances starting from seed", () => {
      const forger = Forger(personMold);
      const people = forger.forgeMultiWithSeed(3, 100);

      expect(people.length).toBe(3);
      expect(people[0]?.name).toBe("Person100");
      expect(people[1]?.name).toBe("Person101");
      expect(people[2]?.name).toBe("Person102");
    });

    it("should produce consistent results", () => {
      const forger = Forger(personMold);
      const people1 = forger.forgeMultiWithSeed(5, 42);
      const people2 = forger.forgeMultiWithSeed(5, 42);

      expect(people1).toEqual(people2);
    });

    it("should apply overrides to all instances", () => {
      const forger = Forger(personMold);
      const people = forger.forgeMultiWithSeed(3, 100, { age: 30 });

      for (const person of people) {
        expect(person.age).toBe(30);
      }
    });
  });
});

describe("Forger with StringMold", () => {
  it("should create strings", () => {
    const stringMold = StringMold(5, 10);
    const forger = Forger(stringMold);

    const result = forger.forge();

    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThanOrEqual(5);
    expect(result.length).toBeLessThanOrEqual(10);
  });

  it("should create multiple unique strings", () => {
    const stringMold = StringMold(10, 20);
    const forger = Forger(stringMold);

    const results = forger.forgeMulti(10);
    const uniqueResults = new Set(results);

    expect(uniqueResults.size).toBe(10);
  });
});
