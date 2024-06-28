import { ConfigManager } from "./ConfigManager";
import { Utils } from "./Utils";

export class InfiniteConsumables {
  private static config = new ConfigManager(
    "BPQSMHR/infinite_consumables.json",
    {
      infiniteCoating: false,
      infiniteAmmo: false,
      infiniteItem: false,
      infiniteEndemicLife: false,
      infiniteWirebug: false,
    },
  );

  static ui() {
    if (imgui.tree_node("无限消耗品")) {
      const configItems = [
        { label: "无限瓶(用于弓)", key: "infiniteCoating" },
        { label: "无限弹药(用于弩)", key: "infiniteAmmo" },
        { label: "无限物品(药、食物、陷阱等)", key: "infiniteItem" },
        { label: "无限特有生命(蜘蛛、甲虫等)", key: "infiniteEndemicLife" },
        { label: "无限线虫", key: "infiniteWirebug" },
      ];
      for (const item of configItems) {
        const [changed, value] = imgui.checkbox(
          item.label,
          this.config.get(item.key),
        );
        if (changed) {
          this.config.set(item.key, value);
        }
      }
      imgui.tree_pop();
    }
  }

  static init_hook() {
    Utils.hookMethod(
      "snow.data.bulletSlider.BottleSliderFunc",
      "consumeItem",
      () => {
        if (this.config.get("infiniteCoating")) {
          return sdk.PreHookResult.SKIP_ORIGINAL;
        }
      },
    );

    Utils.hookMethod(
      "snow.data.bulletSlider.BulletSliderFunc",
      "consumeItem",
      () => {
        if (this.config.get("infiniteAmmo")) {
          return sdk.PreHookResult.SKIP_ORIGINAL;
        }
      },
    );

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

    Utils.hookMethod(
      "snow.envCreature.EnvironmentCreatureManager",
      "addEc057UseCount",
      (args) => {
        if (this.config.get("infiniteEndemicLife")) {
          const playerBase = Utils.getPlayerBase();
          if (playerBase.get_field("_PlayerIndex") == sdk.to_int64(args[3])) {
            return sdk.PreHookResult.SKIP_ORIGINAL;
          }
        }
      },
    );

    Utils.hookMethod(
      "snow.player.fsm.PlayerFsm2ActionHunterWire",
      "start",
      () => {
        if (this.config.get("infiniteWirebug")) {
          const playerBase = Utils.getPlayerBase();

          let wireGuages = playerBase.get_field("_HunterWireGauge");
          if (wireGuages == null) return;

          wireGuages = wireGuages.get_elements();
          for (const gauge of wireGuages) {
            gauge.set_field("_RecastTimer", 0);
            gauge.set_field("_RecoverWaitTimer", 0);
          }
        }
      },
    );
  }
}
