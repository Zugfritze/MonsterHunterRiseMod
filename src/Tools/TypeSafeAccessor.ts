import { ExcludeKeysOfTypeOrSubtype, KeysOfType } from "./Types";

export interface ITypeSafeAccessor<T> {
  get<K extends keyof T>(key: K): T[K];

  get<V>(key: Extract<keyof T, KeysOfType<T, V>>): V;

  getAccessor<K extends ExcludeKeysOfTypeOrSubtype<T, ITypeSafeAccessor<T[K]>>>(
    key: K,
  ): ITypeSafeAccessor<T[K]>;

  getAccessor<V extends T[ExcludeKeysOfTypeOrSubtype<T, ITypeSafeAccessor<V>>]>(
    key: Extract<keyof T, KeysOfType<T, V>>,
  ): ITypeSafeAccessor<V>;

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

  getAccessor<
    K extends ExcludeKeysOfTypeOrSubtype<this, ITypeSafeAccessor<this[K]>>,
  >(key: K): ITypeSafeAccessor<this[K]>;
  getAccessor<
    V extends this[ExcludeKeysOfTypeOrSubtype<this, ITypeSafeAccessor<V>>],
  >(key: Extract<keyof this, KeysOfType<this, V>>): ITypeSafeAccessor<V>;
  getAccessor<
    K extends ExcludeKeysOfTypeOrSubtype<this, ITypeSafeAccessor<this[K]>>,
  >(key: K): ITypeSafeAccessor<this[K]> {
    return new TypeSafeAccessorProxy(this[key]);
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

  getAccessor<K extends ExcludeKeysOfTypeOrSubtype<T, ITypeSafeAccessor<T[K]>>>(
    key: K,
  ): ITypeSafeAccessor<T[K]>;
  getAccessor<V extends T[ExcludeKeysOfTypeOrSubtype<T, ITypeSafeAccessor<V>>]>(
    key: Extract<keyof T, KeysOfType<T, V>>,
  ): ITypeSafeAccessor<V>;
  getAccessor<K extends ExcludeKeysOfTypeOrSubtype<T, ITypeSafeAccessor<T[K]>>>(
    key: K,
  ): ITypeSafeAccessor<T[K]> {
    return new TypeSafeAccessorProxy(this.object[key]);
  }

  set<K extends keyof T>(key: K, value: T[K]): void;
  set<V>(key: Extract<keyof T, KeysOfType<T, V>>, value: V): void;
  set<K extends keyof T>(key: K, value: T[K]): void {
    this.object[key] = value;
  }
}
