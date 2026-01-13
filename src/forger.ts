import type { Mold } from "./mold";

export type Forger<T, P extends object> = {
  forge: (overrides?: Partial<P>) => T;
  forgeMulti: (size: number, overrides?: Partial<P>) => T[];
  forgeWithSeed: (seed: number, overrides?: Partial<P>) => T;
  forgeMultiWithSeed: (
    size: number,
    seed: number,
    overrides?: Partial<P>
  ) => T[];
};

export const Forger = <T, P extends object>(mold: Mold<T, P>): Forger<T, P> => {
  const usedSeeds = new Set<number>();

  const nextSeed = (): number => {
    const seeds = nextSeeds(1);
    return seeds[0] as number;
  };

  const nextSeeds = (size: number): number[] => {
    const result: number[] = [];

    while (result.length < size) {
      const candidate = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
      if (!usedSeeds.has(candidate)) {
        usedSeeds.add(candidate);
        result.push(candidate);
      }
    }

    return result;
  };

  const forge = (overrides: Partial<P> = {} as Partial<P>): T => {
    return mold.pour(overrides, nextSeed());
  };

  const forgeMulti = (
    size: number,
    overrides: Partial<P> = {} as Partial<P>
  ): T[] => {
    return nextSeeds(size).map((seed) => mold.pour(overrides, seed));
  };

  const forgeWithSeed = (
    seed: number,
    overrides: Partial<P> = {} as Partial<P>
  ): T => {
    return mold.pour(overrides, seed);
  };

  const forgeMultiWithSeed = (
    size: number,
    seed: number,
    overrides: Partial<P> = {} as Partial<P>
  ): T[] => {
    return Array.from({ length: size }, (_, index) =>
      forgeWithSeed(seed + index, overrides)
    );
  };

  return {
    forge,
    forgeMulti,
    forgeWithSeed,
    forgeMultiWithSeed,
  };
};
