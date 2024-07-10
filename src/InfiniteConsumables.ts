import { ConfigManager } from "./ConfigManager";
import { KeysOfType } from "./Tools/Types";
import { Utils } from "./Utils";
import { imgui_extra } from "./Tools/imgui_extra";

class InfiniteConsumablesConfig {
  infiniteCoating: boolean = false;
  infiniteAmmo: boolean = false;
  infiniteItem: boolean = false;
  infiniteEndemicLife: boolean = false;
  infiniteWirebug: boolean = false;
}

export class InfiniteConsumables {
  private static config = new ConfigManager("BPQSMHRMod/infinite_consumables.json", new InfiniteConsumablesConfig());
  private static uiConfigItems: {
    label: string;
    key: KeysOfType<InfiniteConsumablesConfig, boolean>;
  }[] = [
    { label: "无限瓶(用于弓)", key: "infiniteCoating" },
    { label: "无限弹药(用于弩)", key: "infiniteAmmo" },
    { label: "无限物品(药、食物、陷阱等)", key: "infiniteItem" },
    { label: "无限特有生命(蜘蛛、甲虫等)", key: "infiniteEndemicLife" },
    { label: "无限线虫", key: "infiniteWirebug" },
  ];

  static ui() {
    imgui_extra.tree_node("无限消耗品", () => {
      for (const item of this.uiConfigItems) {
        const [changed, value] = imgui.checkbox(item.label, this.config.get(item.key));
        if (changed) {
          this.config.set(item.key, value);
        }
      }
    });
  }

  static init_hook() {
    Utils.hookMethod("snow.data.bulletSlider.BottleSliderFunc", "consumeItem", () => {
      if (this.config.get("infiniteCoating")) {
        return sdk.PreHookResult.SKIP_ORIGINAL;
      }
    });

    Utils.hookMethod("snow.data.bulletSlider.BulletSliderFunc", "consumeItem", () => {
      if (this.config.get("infiniteAmmo")) {
        return sdk.PreHookResult.SKIP_ORIGINAL;
      }
    });

    const isEcItem = (itemID: number): boolean => {
      return 69206016 <= itemID && itemID <= 69206038;
    };

    Utils.hookMethod(
      "snow.data.ItemSlider",
      "notifyConsumeItem(snow.data.ContentsIdSystem.ItemId, System.Boolean)",
      (args) => {
        const itemID = sdk.to_int64(args[3]);
        if (this.config.get("infiniteEndemicLife") && isEcItem(itemID)) {
          return sdk.PreHookResult.SKIP_ORIGINAL;
        } else if (this.config.get("infiniteItem") && !isEcItem(itemID)) {
          return sdk.PreHookResult.SKIP_ORIGINAL;
        }
      },
    );

    Utils.hookMethod("snow.envCreature.EnvironmentCreatureManager", "addEc057UseCount", (args) => {
      if (this.config.get("infiniteEndemicLife")) {
        const playerBase = Utils.getPlayerBase();
        if (playerBase.get_field("_PlayerIndex") == sdk.to_int64(args[3])) {
          return sdk.PreHookResult.SKIP_ORIGINAL;
        }
      }
    });

    Utils.hookMethod("snow.player.fsm.PlayerFsm2ActionHunterWire", "start", () => {
      if (this.config.get("infiniteWirebug")) {
        const playerBase = Utils.getPlayerBase();
        const wireGuages: REManagedObject | undefined = playerBase.get_field("_HunterWireGauge");
        if (wireGuages == undefined) return;
        const wireGuages_Count: number = wireGuages.call("get_Count");
        for (let i = 0; i < wireGuages_Count; i++) {
          const gauge: REManagedObject | undefined = wireGuages.call("Get", i);
          if (gauge != undefined) {
            gauge.set_field("_RecastTimer", 0);
            gauge.set_field("_RecoverWaitTimer", 0);
          } else {
            break;
          }
        }
      }
    });
  }
}
