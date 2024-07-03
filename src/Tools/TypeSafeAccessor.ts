import { KeysOfType } from "./Types";

export interface ITypeSafeAccessor<T> {
  get<K extends keyof T>(key: K): T[K];

  get<V>(key: Extract<keyof T, KeysOfType<T, V>>): V;

  set<K extends keyof T>(key: K, value: T[K]): void;

  set<V>(key: Extract<keyof T, KeysOfType<T, V>>, value: V): void;
}

export abstract class TypeSafeAccessor
  implements ITypeSafeAccessor<TypeSafeAccessor>
{
  get<K extends keyof this>(key: K): this[K];
  get<V>(key: Extract<keyof this, KeysOfType<this, V>>): V;
  get<K extends keyof this>(key: K): this[K] {
    return this[key];
  }

  set<K extends keyof this>(key: K, value: this[K]): void;
  set<V>(key: Extract<keyof this, KeysOfType<this, V>>, value: V): void;
  set<K extends keyof this>(key: K, value: this[K]): void {
    this[key] = value;
  }
}

export class TypeSafeAccessorProxy<T> implements ITypeSafeAccessor<T> {
  private readonly object: T;

  constructor(object: T) {
    this.object = object;
  }

  get<K extends keyof T>(key: K): T[K];
  get<V>(key: Extract<keyof T, KeysOfType<T, V>>): V;
  get<K extends keyof T>(key: K): T[K] {
    return this.object[key];
  }

  set<K extends keyof T>(key: K, value: T[K]): void;
  set<V>(key: Extract<keyof T, KeysOfType<T, V>>, value: V): void;
  set<K extends keyof T>(key: K, value: T[K]): void {
    this.object[key] = value;
  }
}
