# forger-ts

A TypeScript library for generating test data with deterministic, seed-based randomness.

## Installation

```bash
npm install @lihs/forger-ts
# or
pnpm add @lihs/forger-ts
```

## Features

- Deterministic data generation using seeds
- Type-safe API with full TypeScript support
- Built-in molds for strings, enums, and maps
- Create custom molds for any data type

## Usage

### Basic Example

```typescript
import { Mold, Forger, StringMold } from "@lihs/forger-ts";

// Define value objects
type UserID = { value: string };
type UserName = { value: string };

type User = {
  id: UserID;
  name: UserName;
};

// Create molds for value objects
const UserIDMold = Mold<UserID, UserID>({
  pour: (props) => props,
  prepare: (overrides, seed) => ({
    value: overrides.value ?? `user-${seed}`,
  }),
});

const UserNameMold = Mold<UserName, UserName>({
  pour: (props) => props,
  prepare: (overrides, seed) => ({
    value: overrides.value ?? `User ${seed}`,
  }),
});

// Create forgers for value objects
const userIDForger = Forger(UserIDMold);
const userNameForger = Forger(UserNameMold);

// Compose to create UserMold
const UserMold = Mold<User, User>({
  pour: (props) => props,
  prepare: (overrides, seed) => ({
    id: overrides.id ?? userIDForger.forgeWithSeed(seed),
    name: overrides.name ?? userNameForger.forgeWithSeed(seed),
  }),
});

// Create a forger
const userForger = Forger(UserMold);

// Generate test data
const user = userForger.forge();
// { id: { value: "user-123456" }, name: { value: "User 123456" } }

const users = userForger.forgeMulti(5);
// Array of 5 unique users

// With overrides
const admin = userForger.forge({ name: { value: "Admin" } });
// { id: { value: "user-789012" }, name: { value: "Admin" } }

// Deterministic generation with seed
const consistentUser = userForger.forgeWithSeed(42);
// Always returns the same user for seed 42
```

### Built-in Molds

#### StringMold

Generate random strings with configurable length and character set.

```typescript
import { Forger, StringMold, Characters } from "@lihs/forger-ts";

// Default: 1-255 characters, alphanumeric
const stringForger = Forger(StringMold());

// Custom length range
const shortStringForger = Forger(StringMold(5, 10));

// Custom character set
const numericForger = Forger(StringMold(10, 10, Characters.NUMERIC));
const slugForger = Forger(StringMold(10, 20, Characters.SLUG));
```

Available character sets in `Characters`:
- `ALPHANUMERIC` - a-z, A-Z, 0-9
- `ALPHA` - a-z, A-Z
- `NUMERIC` - 0-9
- `SLUG` - a-z, 0-9, -
- `SYMBOL` - Special characters

#### EnumMold

Generate random values from an enum or object.

```typescript
import { Forger, EnumMold } from "@lihs/forger-ts";

const Status = {
  Active: "active",
  Inactive: "inactive",
  Pending: "pending",
} as const;

const statusForger = Forger(EnumMold(Status));

const status = statusForger.forge();
// "active" | "inactive" | "pending"

// Exclude specific values
const nonPendingStatus = statusForger.forge({ exclusion: "pending" });

// Exclude multiple values
const exclusions = new Set(["inactive", "pending"] as const);
const activeOnly = statusForger.forge({ exclusion: exclusions });
```

#### MapMold

Generate random maps with typed keys and values.

```typescript
import { Forger, MapMold, StringMold } from "@lihs/forger-ts";

const keyMold = StringMold(5, 5);
const valueMold = StringMold(10, 10);

const mapForger = Forger(MapMold(keyMold, valueMold));

const map = mapForger.forge();
// Map with 1-10 entries
```

## API Reference

### Mold

Creates a mold that defines how to generate instances of a type.

```typescript
const mold = Mold<T, P>({
  pour: (properties: P) => T,
  prepare: (overrides: Partial<P>, seed: number) => P,
});
```

### Forger

Creates a forger from a mold for generating test data.

```typescript
const forger = Forger(mold);

// Generate a single instance with random seed
forger.forge(overrides?)

// Generate multiple instances with random seeds
forger.forgeMulti(size, overrides?)

// Generate with a specific seed (deterministic)
forger.forgeWithSeed(seed, overrides?)

// Generate multiple with sequential seeds starting from seed
forger.forgeMultiWithSeed(size, seed, overrides?)
```

## License

MIT
