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
