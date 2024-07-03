export class Utils {
  private static playerInput: REManagedObject | undefined = undefined;

  static getPlayerBase(): REManagedObject {
    if (this.playerInput == undefined) {
      const inputManager = sdk.get_managed_singleton("snow.StmInputManager");
      const inGameInputDevice: REManagedObject =
        inputManager.get_field("_InGameInputDevice");
      this.playerInput = inGameInputDevice.get_field("_pl_input");
    }
    return this.playerInput!.get_field("RefPlayer");
  }

  static getPlayerData(): REManagedObject | undefined {
    const playerBase = this.getPlayerBase();
    if (playerBase == undefined) return undefined;
    return playerBase.call("get_PlayerData");
  }

  static sendMessage(text: string): void {
    const chatManager = sdk.get_managed_singleton("snow.gui.ChatManager");
    chatManager.call("reqAddChatInfomation", text, 0);
  }

  static hookMethod(
    typeName: string,
    methodName: string,
    preFunction?: (...args: any[]) => any,
    postFunction?: (...args: any[]) => any,
  ): void {
    const methodDef = sdk.find_type_definition(typeName).get_method(methodName);
    sdk.hook(methodDef, preFunction, postFunction);
  }

  static getFieldNames<T extends object>(obj: T): Array<keyof T> {
    return Object.keys(obj) as Array<keyof T>;
  }
}

export namespace imgui_extra {
  export function input_number(
    label: string,
    value: number,
    min_and_max?: [number, number],
    is_float: boolean = false,
    flags?: ImGuiInputTextFlags | number,
  ): [boolean, number] {
    const [changed, value_string] = imgui.input_text(
      label,
      value.toString(),
      flags,
    );
    if (changed) {
      let value_number: number | undefined;
      if (is_float) {
        value_number = parseFloat(value_string);
      } else {
        value_number = parseInt(value_string, 10);
      }
      if (value_number != undefined) {
        if (min_and_max != undefined) {
          const [min, max] = min_and_max;
          value_number = Math.max(min, Math.min(max, value_number));
        }
        return [changed, value_number];
      }
    }
    return [false, value];
  }

  export enum ImGuiInputTextFlags {
    None = 0,
    CharsDecimal = 1 << 0,
    CharsHexadecimal = 1 << 1,
    CharsUppercase = 1 << 2,
    CharsNoBlank = 1 << 3,
    AutoSelectAll = 1 << 4,
    EnterReturnsTrue = 1 << 5,
    CallbackCompletion = 1 << 6,
    CallbackHistory = 1 << 7,
    CallbackAlways = 1 << 8,
    CallbackCharFilter = 1 << 9,
    AllowTabInput = 1 << 10,
    CtrlEnterForNewLine = 1 << 11,
    NoHorizontalScroll = 1 << 12,
    AlwaysOverwrite = 1 << 13,
    ReadOnly = 1 << 14,
    Password = 1 << 15,
    NoUndoRedo = 1 << 16,
    CharsScientific = 1 << 17,
    CallbackResize = 1 << 18,
    CallbackEdit = 1 << 19,
    EscapeClearsAll = 1 << 20,
  }

  export enum ImGuiWindowFlags {
    None = 0,
    NoTitleBar = 1 << 0,
    NoResize = 1 << 1,
    NoMove = 1 << 2,
    NoScrollbar = 1 << 3,
    NoScrollWithMouse = 1 << 4,
    NoCollapse = 1 << 5,
    AlwaysAutoResize = 1 << 6,
    NoBackground = 1 << 7,
    NoSavedSettings = 1 << 8,
    NoMouseInputs = 1 << 9,
    MenuBar = 1 << 10,
    HorizontalScrollbar = 1 << 11,
    NoFocusOnAppearing = 1 << 12,
    NoBringToFrontOnFocus = 1 << 13,
    AlwaysVerticalScrollbar = 1 << 14,
    AlwaysHorizontalScrollbar = 1 << 15,
    AlwaysUseWindowPadding = 1 << 16,
    NoNavInputs = 1 << 18,
    NoNavFocus = 1 << 19,
    UnsavedDocument = 1 << 20,
    NoNav = NoNavInputs | NoNavFocus,
    NoDecoration = NoTitleBar | NoResize | NoScrollbar | NoCollapse,
    NoInputs = NoMouseInputs | NoNavInputs | NoNavFocus,

    // [Internal]
    NavFlattened = 1 << 23,
    ChildWindow = 1 << 24,
    Tooltip = 1 << 25,
    Popup = 1 << 26,
    Modal = 1 << 27,
    ChildMenu = 1 << 28,
  }
}

type PrimitiveType =
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
