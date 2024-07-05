import { ExcludeKeysOfTypeOrSubtype, KeysOfType } from "./Tools/Types";
import { ITypeSafeAccessor, TypeSafeAccessorProxy } from "./Tools/TypeSafeAccessor";

export class ConfigManager<T extends { [key: string]: any }> implements ITypeSafeAccessor<T> {
  private readonly configPath: string;
  private config: T;
  private readonly defaultConfig: T;

  constructor(configPath: string, defaultConfig: T) {
    this.configPath = configPath;
    this.config = { ...defaultConfig };
    this.defaultConfig = { ...defaultConfig };
    this.load();
  }

  get<K extends keyof T>(key: K): T[K];
  get<V>(key: Extract<keyof T, KeysOfType<T, V>>): V;
  get<K extends keyof T>(key: K): T[K] {
    return this.config[key] != undefined ? this.config[key] : this.defaultConfig[key];
  }

  getAccessor<K extends ExcludeKeysOfTypeOrSubtype<T, ITypeSafeAccessor<T[K]>>>(key: K): ITypeSafeAccessor<T[K]>;
  getAccessor<V extends T[ExcludeKeysOfTypeOrSubtype<T, ITypeSafeAccessor<V>>]>(
    key: Extract<keyof T, KeysOfType<T, V>>,
  ): ITypeSafeAccessor<V>;
  getAccessor<K extends ExcludeKeysOfTypeOrSubtype<T, ITypeSafeAccessor<T[K]>>>(key: K): ITypeSafeAccessor<T[K]> {
    return new TypeSafeAccessorProxy(this.config[key] != undefined ? this.config[key] : this.defaultConfig[key]);
  }

  set<K extends keyof T>(key: K, value: T[K]): void;
  set<V>(key: Extract<keyof T, KeysOfType<T, V>>, value: V): void;
  set<K extends keyof T>(key: K, value: T[K]): void {
    if (this.config[key] != value) {
      this.config[key] = value;
      this.save();
    }
  }

  private load(): void {
    const configFile = json.load_file(this.configPath);
    if (configFile) {
      this.config = configFile as unknown as T;
    } else {
      this.save();
    }
  }

  private save(): void {
    json.dump_file(this.configPath, this.config);
  }
}
