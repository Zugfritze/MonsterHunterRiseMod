import { Utils } from "./Utils";

export class Other {
  static init_hook() {
    Utils.hookMethod("snow.data.EquipmentInventoryData", "updateCheatBitFlag", () => {
      return sdk.PreHookResult.SKIP_ORIGINAL;
    });
  }
}
