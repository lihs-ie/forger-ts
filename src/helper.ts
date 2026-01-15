const asUint32 = (original: bigint): bigint =>
  BigInt.asUintN(32, original & 0xffffffffn);

const invert = (original: bigint): bigint => {
  const masks = [
    0x55555555n,
    0x33333333n,
    0x0f0f0f0fn,
    0x00ff00ffn,
    0xffffffffn,
  ];

  return masks.reduce((carry, mask, index) => {
    const padding = BigInt(1 << index);

    const left = (carry >> padding) & mask;
    const right = (carry & mask) << padding;

    return asUint32(left | right);
  }, original);
};

const extendedGcd = (
  a: bigint,
  b: bigint,
): [gcd: bigint, x: bigint, y: bigint] => {
  if (a === 0n) {
    return [b, 0n, 1n];
  }

  const [gcd, y, x] = extendedGcd(asUint32(b % a), a);

  return [gcd, x - asUint32(asUint32(b / a) * y), y];
};

const modularInverse = (a: bigint, b: bigint): bigint => {
  const [gcd, x] = extendedGcd(a, b);

  if (gcd !== 1n) {
    throw new Error(`No inverse is found for ${a} on ${b}.`);
  }

  return asUint32(x % b);
};

const salt = 0x17654321n;
const invertedSalt = modularInverse(salt, 0xffffffffn + 1n);

export const scramble = (original: number): number => {
  const normalized = asUint32(BigInt(original));
  const base = asUint32(normalized * salt);
  const inverted = invert(base);

  return Number(asUint32(inverted * invertedSalt));
};

export const Characters = {
  ALPHANUMERIC: [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
  ] as const,
  ALPHA: [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ] as const,
  SLUG: [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "-",
  ] as const,
  NUMERIC: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const,
  SYMBOL: [
    "!",
    '"',
    "#",
    "$",
    "%",
    "&",
    "'",
    "(",
    ")",
    "*",
    "+",
    ",",
    "-",
    ".",
    "/",
    ":",
    ";",
    "<",
    "=",
    ">",
    "?",
    "@",
    "[",
    "\\",
    "]",
    "^",
    "_",
    "`",
    "{",
    "|",
    "}",
    "~",
  ] as const,
} as const;
