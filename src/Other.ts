import { Utils } from "./Utils";
import { ConfigManager } from "./ConfigManager";
import { imgui_extra } from "./Tools/imgui_extra";

class OtherConfig {
  autoSaveInterval: number = 0;
}

export class Other {
  static lastSaveAt = 0;
  private static config = new ConfigManager("BPQSMHRMod/other.json", new OtherConfig());

  static ui() {
    if (imgui.tree_node("其他")) {
      const [changed, value] = imgui_extra.input_number("自动保存间隔", this.config.get("autoSaveInterval"));
      if (changed) {
        this.config.set("autoSaveInterval", value);
      }
      imgui.tree_pop();
    }
  }

  static init_hook() {
    Utils.hookMethod("snow.data.EquipmentInventoryData", "updateCheatBitFlag", () => {
      return sdk.PreHookResult.SKIP_ORIGINAL;
    });
    Utils.hookMethod("snow.SnowSaveService", "saveCharaData", () => {
      this.lastSaveAt = os.time();
    });
    Utils.hookMethod("snow.SnowSaveService", "requestAutoSaveAll", () => {
      if (os.difftime(this.lastSaveAt, os.time()) < this.config.get("autoSaveInterval")) {
        return sdk.PreHookResult.SKIP_ORIGINAL;
      }
    });
  }
}
