import { Utils } from "./Utils";
import { ConfigManager } from "./ConfigManager";
import { imgui_extra } from "./Tools/imgui_extra";

enum DecorationEquipStatusTypes {
  OK = 0,
  LackLv = 1,
  OtherEquipmentUsing = 2,
  SameSlotUsing = 3,
  OtherSlotUsing = 4,
  NoSlot = 5,
  OtherType = 6,
  OtherWeapon = 7,
  Error = 8,
}

class OtherConfig {
  autoSaveInterval: number = 0;
  ignoresDecorationsSlotLv: boolean = false;
}

export class Other {
  static lastSaveAt = 0;
  private static config = new ConfigManager("BPQSMHRMod/other.json", new OtherConfig());

  static ui() {
    imgui_extra.tree_node("其他", () => {
      const [aSI_Changed, aSI_Value] = imgui_extra.input_number("自动保存间隔", this.config.get("autoSaveInterval"));
      if (aSI_Changed) {
        this.config.set("autoSaveInterval", aSI_Value);
      }
      const [iDS_Changed, iDS_Value] = imgui.checkbox(
        "忽略装饰品槽位等级限制",
        this.config.get("ignoresDecorationsSlotLv"),
      );
      if (iDS_Changed) {
        this.config.set("ignoresDecorationsSlotLv", iDS_Value);
      }
    });
  }

  static init_hook() {
    Utils.hookMethod("snow.data.EquipmentInventoryData", "updateCheatBitFlag", () => {
      return sdk.PreHookResult.SKIP_ORIGINAL;
    });
    Utils.hookMethod("snow.SnowSaveService", "saveCharaData", () => {
      this.lastSaveAt = os.time();
    });
    Utils.hookMethod("snow.SnowSaveService", "requestAutoSaveAll", () => {
      if (os.difftime(os.time(), this.lastSaveAt) < this.config.get("autoSaveInterval")) {
        return sdk.PreHookResult.SKIP_ORIGINAL;
      }
    });
    const checkEquipStatusPostFunction = (retval: any): any => {
      if (this.config.get("ignoresDecorationsSlotLv")) {
        const retval_Int = sdk.to_int64(retval);
        if (retval_Int == DecorationEquipStatusTypes.LackLv) {
          return sdk.to_ptr(DecorationEquipStatusTypes.OK);
        }
      }
      return retval;
    };
    Utils.hookMethod(
      "snow.data.EquipmentInventoryData",
      "checkEquipStatus(System.Int32, snow.data.DecorationsInventoryData)",
      undefined,
      checkEquipStatusPostFunction,
    );
    Utils.hookMethod(
      "snow.data.EquipmentInventoryData",
      "checkEquipStatus(System.Int32, snow.equip.DecorationsId)",
      undefined,
      checkEquipStatusPostFunction,
    );
  }
}
