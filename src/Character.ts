import { ConfigManager } from "./ConfigManager";
import { Utils } from "./Utils";
import { imgui_extra } from "./Tools/imgui_extra";
import { KeysOfType } from "./Tools/Types";
import ImGuiInputTextFlags = imgui_extra.ImGuiInputTextFlags;

class CharacterConfig {
  attack: number = 0;
  defence: number = 0;
  PercentageVitalRecovery: number = 0;
}

export class Character {
  private static config = new ConfigManager("BPQSMHRMod/character.json", new CharacterConfig());
  private static lastTime: number = os.time();
  private static uiConfigItems: {
    label: string;
    key: KeysOfType<CharacterConfig, number>;
    min: number;
    max: number;
    float: boolean;
  }[] = [
    { label: "额外攻击力", key: "attack", min: 0, max: 2600, float: false },
    { label: "额外防御力", key: "defence", min: 0, max: 3100, float: false },
    { label: "每秒生命恢复百分比", key: "PercentageVitalRecovery", min: 0, max: 100, float: true },
  ];
  private static modifyStatConfig: {
    key: KeysOfType<CharacterConfig, number>;
    field: string;
    modifyFlag: boolean;
  }[] = [
    { key: "attack", field: "_AtkUpAlive", modifyFlag: false },
    { key: "defence", field: "_DefUpAlive", modifyFlag: false },
  ];

  static ui() {
    imgui_extra.tree_node("玩家编辑", () => {
      imgui_extra.tree_node("信息", () => {
        const playerData = Utils.getPlayerData();
        if (playerData) {
          imgui.text(`攻击力: ${playerData.get_field("_Attack")}`);
          imgui.text(`防御力: ${playerData.get_field("_Defence")}`);
          imgui.text(`额外攻击力: ${playerData.get_field("_AtkUpAlive")}`);
          imgui.text(`额外防御力: ${playerData.get_field("_DefUpAlive")}`);
        }
      });

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
    });
  }

  static init_hook() {
    Utils.hookMethod("snow.player.PlayerManager", "update", () => {
      const playerData = Utils.getPlayerData();
      if (!playerData) return;

      for (const modifyStat of this.modifyStatConfig) {
        const value: number = this.config.get(modifyStat.key);
        if (value != undefined && value >= 1) {
          modifyStat.modifyFlag = true;
          playerData.set_field(modifyStat.field, value);
        } else if (modifyStat.modifyFlag) {
          modifyStat.modifyFlag = false;
          playerData.set_field(modifyStat.field, 0);
        }
      }

      const currentTime = os.time();
      if (os.difftime(currentTime, this.lastTime) >= 1) {
        this.lastTime = currentTime;

        const percentage: number = this.config.get("PercentageVitalRecovery");
        if (percentage != undefined && percentage >= 1) {
          const vitalMax: number = playerData.get_field("_vitalMax");
          const healAmount = vitalMax * (percentage / 100);
          const currentVital: number = playerData.call("get_vital");
          const newVital = Math.floor(Math.min(currentVital + healAmount, vitalMax) + 0.5);
          playerData.set_field("_r_Vital", newVital);
          playerData.call("set__vital", newVital + 0.10001);
        }
      }
    });
  }
}
