export type PrimitiveType =
  | string
  | number
  | boolean
  | null
  | undefined
  | symbol
  | bigint;

export class ReferenceType<T extends PrimitiveType> {
  value: T;

  constructor(value: T) {
    this.value = value;
  }
}

export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

export type KeysOfTypeOrSubtype<T, I> = {
  [K in keyof T]: T[K] extends I
    ? K
    : T[K] extends infer U
      ? U extends I
        ? K
        : never
      : never;
}[keyof T];

export type ExcludeKeysOfTypeOrSubtype<T, I> = {
  [K in keyof T]: T[K] extends I
    ? never
    : T[K] extends infer U
      ? U extends I
        ? never
        : K
      : K;
}[keyof T];
