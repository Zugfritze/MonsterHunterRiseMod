import { ConfigManager } from "./ConfigManager";
import { imgui_extra, ReferenceType, Utils } from "./Utils";
import ImGuiInputTextFlags = imgui_extra.ImGuiInputTextFlags;

export class Character {
  private static config = new ConfigManager("BPQSMHRMod/character.json", {
    attack: 0,
    defence: 0,
    PercentageVitalRecovery: 0,
  });
  private static lastTime: number = os.time();
  private static uiConfigItems = [
    {
      label: "额外攻击力",
      key: "attack",
      min: 0,
      max: 2600,
      float: false,
    },
    {
      label: "额外防御力",
      key: "defence",
      min: 0,
      max: 3100,
      float: false,
    },
    {
      label: "每秒生命恢复百分比",
      key: "PercentageVitalRecovery",
      min: 0,
      max: 100,
      float: true,
    },
  ];
  private static modifyStatConfig = [
    {
      key: "attack",
      field: "_AtkUpAlive",
      modifyFlag: new ReferenceType<boolean>(false),
    },
    {
      key: "defence",
      field: "_DefUpAlive",
      modifyFlag: new ReferenceType<boolean>(false),
    },
  ];

  static ui() {
    if (imgui.tree_node("玩家编辑")) {
      if (imgui.tree_node("信息")) {
        const playerData = Utils.getPlayerData();
        if (playerData) {
          imgui.text(`攻击力: ${playerData.get_field("_Attack")}`);
          imgui.text(`防御力: ${playerData.get_field("_Defence")}`);
          imgui.text(`额外攻击力: ${playerData.get_field("_AtkUpAlive")}`);
          imgui.text(`额外防御力: ${playerData.get_field("_DefUpAlive")}`);
        }
        imgui.tree_pop();
      }

      for (const item of this.uiConfigItems) {
        const [changed, value] = imgui_extra.input_number(
          item.label,
          this.config.get(item.key),
          [item.min, item.max],
          item.float,
          ImGuiInputTextFlags.EnterReturnsTrue,
        );
        if (changed) {
          this.config.set(item.key, value);
        }
      }
      imgui.tree_pop();
    }
  }

  static init_hook() {
    Utils.hookMethod("snow.player.PlayerManager", "update", () => {
      const playerData = Utils.getPlayerData();
      if (!playerData) return;

      for (const modifyStat of this.modifyStatConfig) {
        const value: number = this.config.get(modifyStat.key);
        if (value != undefined && value >= 1) {
          modifyStat.modifyFlag.value = true;
          playerData.set_field(modifyStat.field, value);
        } else if (modifyStat.modifyFlag.value) {
          modifyStat.modifyFlag.value = false;
          playerData.set_field(modifyStat.field, 0);
        }
      }

      const currentTime = os.time();
      if (currentTime - this.lastTime >= 1) {
        this.lastTime = currentTime;

        const percentage: number = this.config.get("PercentageVitalRecovery");
        if (percentage != undefined && percentage >= 1) {
          const vitalMax: number = playerData.get_field("_vitalMax");
          const healAmount = vitalMax * (percentage / 100);
          const currentVital: number = playerData.call("get_vital");
          const newVital = Math.floor(
            Math.min(currentVital + healAmount, vitalMax) + 0.5,
          );
          playerData.set_field("_r_Vital", newVital);
          playerData.call("set__vital", newVital + 0.10001);
        }
      }
    });
  }
}
