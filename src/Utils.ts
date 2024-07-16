export class Utils {
  private static playerInput: REManagedObject | undefined = undefined;
  private static t_SnowGameManager: RETypeDefinition = sdk.find_type_definition("snow.SnowGameManager");
  private static getStatus: REMethodDefinition = Utils.t_SnowGameManager.get_method("getStatus");

  static getPlayerBase(): REManagedObject {
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
  ): void {
    const methodDef = sdk.find_type_definition(typeName).get_method(methodName);
    sdk.hook(methodDef, preFunction, postFunction);
  }

  static isInVillage(): boolean {
    const snowGameManager = sdk.get_managed_singleton("snow.SnowGameManager");
    return snowGameManager != undefined && this.getStatus.call(snowGameManager) == 1;
  }
}
