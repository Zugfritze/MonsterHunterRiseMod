import { ConfigManager } from "./ConfigManager";
import { ReferenceType, Utils } from "./Utils";

export class Character {
  private static config = new ConfigManager("BPQSMHR/character.json", {
    attack: 0,
    defence: 0,
    PercentageVitalRecovery: 0,
  });
  private static attack_modify: ReferenceType<boolean> = new ReferenceType(
    false,
  );
  private static defence_modify: ReferenceType<boolean> = new ReferenceType(
    false,
  );
  private static lastTime: number = os.time();

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

      const configItems = [
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

      for (const item of configItems) {
        const [changed, value_string] = imgui.input_text(
          item.label,
          this.config.get(item.key).toString(),
        );
        if (changed) {
          let value_number: number | undefined;
          if (item.float) {
            value_number = parseFloat(value_string);
          } else {
            value_number = parseInt(value_string, 10);
          }
          if (value_number != undefined) {
            const value = Math.max(item.min, Math.min(item.max, value_number));
            this.config.set(item.key, value);
          }
        }
      }
      imgui.tree_pop();
    }
  }

  static init_hook() {
    Utils.hookMethod("snow.player.PlayerManager", "update", () => {
      const playerData = Utils.getPlayerData();
      if (!playerData) return;

      const modifyStatConfig = [
        {
          key: "attack",
          field: "_AtkUpAlive",
          modifyFlag: this.attack_modify,
        },
        {
          key: "defence",
          field: "_DefUpAlive",
          modifyFlag: this.defence_modify,
        },
      ];

      for (const modifyStat of modifyStatConfig) {
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
