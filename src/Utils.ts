export class Utils {
  private static playerInput: REManagedObject | undefined = undefined;
  private static t_SnowGameManager: RETypeDefinition = sdk.find_type_definition("snow.SnowGameManager");
  private static getStatus: REMethodDefinition = Utils.t_SnowGameManager.get_method("getStatus");

  static getPlayerBase(): REManagedObject | undefined {
    if (this.playerInput == undefined) {
      const inputManager = sdk.get_managed_singleton("snow.StmInputManager");
      const inGameInputDevice: REManagedObject = inputManager.get_field("_InGameInputDevice");
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
    preFunction?: (this: void, ...args: any[]) => any,
    postFunction?: (this: void, retval: any) => any,
    ignore_jmp?: boolean,
  ): void {
    const methodDef = sdk.find_type_definition(typeName).get_method(methodName);
    sdk.hook(methodDef, preFunction, postFunction, ignore_jmp);
  }

  static isInVillage(): boolean {
    const snowGameManager = sdk.get_managed_singleton("snow.SnowGameManager");
    return snowGameManager != undefined && this.getStatus.call(snowGameManager) == 1;
  }
}

export class REArray<T> {
  readonly RawData: REManagedObject;
  private readonly GetMethod: REMethodDefinition;
  private readonly SetMethod: REMethodDefinition;
  private readonly get_CountMethod: REMethodDefinition;

  constructor(RawData: REManagedObject) {
    this.RawData = RawData;
    const typeDefinition = RawData.get_type_definition();
    this.GetMethod = typeDefinition.get_method("Get");
    this.SetMethod = typeDefinition.get_method("Set");
    this.get_CountMethod = typeDefinition.get_method("get_Count");
  }

  get(index: number): T {
    return this.GetMethod.call<REManagedObject, [number], T>(this.RawData, index);
  }

  set(index: number, value: T) {
    this.SetMethod.call<REManagedObject, [number, T], null>(this.RawData, index, value);
  }

  getCapacity(): number {
    return this.get_CountMethod.call<REManagedObject, [], number>(this.RawData);
  }
}

export class REList<T> {
  readonly RawData: REManagedObject;
  private readonly get_ItemMethod: REMethodDefinition;
  private readonly set_ItemMethod: REMethodDefinition;
  private readonly get_CountMethod: REMethodDefinition;
  private readonly get_CapacityMethod: REMethodDefinition;

  constructor(RawData: REManagedObject) {
    this.RawData = RawData;
    const typeDefinition = RawData.get_type_definition();
    this.get_ItemMethod = typeDefinition.get_method("get_Item");
    this.set_ItemMethod = typeDefinition.get_method("set_Item");
    this.get_CountMethod = typeDefinition.get_method("get_Count");
    this.get_CapacityMethod = typeDefinition.get_method("get_Capacity");
  }

  get(index: number): T {
    return this.get_ItemMethod.call<REManagedObject, [number], T>(this.RawData, index);
  }

  set(index: number, value: T) {
    this.set_ItemMethod.call<REManagedObject, [number, T], null>(this.RawData, index, value);
  }

  getCount(): number {
    return this.get_CountMethod.call<REManagedObject, [], number>(this.RawData);
  }

  getCapacity(): number {
    return this.get_CapacityMethod.call<REManagedObject, [], number>(this.RawData);
  }
}
