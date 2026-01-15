import { Characters, scramble } from "./helper";

export type MoldDelegate<T, P extends object> = {
  pour: (properties: P) => T;
  prepare: (overrides: Partial<P>, seed: number) => P;
};

export type Mold<T, P extends object> = {
  pour: (overrides: Partial<P>, seed: number) => T;
};

export const Mold = <T, P extends object>(
  delegate: MoldDelegate<T, P>,
): Mold<T, P> => {
  const pour = (overrides: Partial<P>, seed: number): T => {
    return delegate.pour(delegate.prepare(overrides, seed));
  };

  return {
    pour,
  };
};

type StringProperties = {
  value: string;
};

export const StringMold = (
  minimumLength?: number | null,
  maximumLength?: number | null,
  candidates?: readonly string[],
) => {
  const minLength = minimumLength ?? 1;
  const maxLength = maximumLength ?? 255;
  const characters = candidates ?? Characters.ALPHANUMERIC;

  return Mold<string, StringProperties>({
    pour: (properties: StringProperties): string => properties.value,
    prepare: (
      overrides: Partial<StringProperties>,
      seed: number,
    ): StringProperties => {
      const offset = seed % (maxLength - minLength + 1);
      const length = minLength + offset;

      const value = Array.from({ length }, (_, index) => {
        const characterIndex = scramble(seed + index) % characters.length;
        return characters[characterIndex];
      }).join("");

      return { value, ...overrides };
    },
  });
};

export const EnumMold = <T extends object>(choices: T) => {
  type Choice = T[keyof T];
  type Properties = {
    value: Choice;
    exclusion?: Choice | Set<Choice>;
  };

  const candidates = Object.values(choices) as Choice[];

  const determineExclusions = (
    exclusion?: Choice | Set<Choice>,
  ): Set<Choice> => {
    if (exclusion === undefined) {
      return new Set<Choice>();
    }
    if (exclusion instanceof Set) {
      return exclusion;
    }
    return new Set<Choice>([exclusion]);
  };

  return Mold<Choice, Properties>({
    pour: (properties: Properties): Choice => {
      return properties.value;
    },
    prepare: (overrides: Partial<Properties>, seed: number): Properties => {
      const exclusionSet = determineExclusions(overrides.exclusion);

      const availableCandidates = candidates.filter(
        (candidate) => !exclusionSet.has(candidate),
      );

      if (availableCandidates.length === 0) {
        throw new Error("Candidates does not exist.");
      }

      // availableCandidates is guaranteed to be non-empty at this point
      const selectedValue = availableCandidates[
        seed % availableCandidates.length
      ] as Choice;

      return { value: selectedValue, ...overrides };
    },
  });
};

export type MapProperties<K, V> = {
  entries: [K, V][];
};

export const MapMold = <K, KP extends object, V, VP extends object>(
  keyMold: Mold<K, KP>,
  valueMold: Mold<V, VP>,
) =>
  Mold<Map<K, V>, MapProperties<K, V>>({
    pour: (properties: MapProperties<K, V>): Map<K, V> =>
      new Map(properties.entries),
    prepare: (
      overrides: Partial<MapProperties<K, V>>,
      seed: number,
    ): MapProperties<K, V> => {
      const entries = Array.from(
        { length: (seed % 10) + 1 },
        (_, index): [K, V] => {
          const keyInstance = keyMold.pour({}, seed + index);
          const valueInstance = valueMold.pour({}, seed + index);

          return [keyInstance, valueInstance];
        },
      );

      return { entries, ...overrides };
    },
  });
