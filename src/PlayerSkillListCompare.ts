import { REArray, Utils } from "./Utils";
import { imgui_extra } from "./Tools/imgui_extra";
import { SkillData } from "./Type";
import Components = imgui_extra.Components;
import TableConfig = imgui_extra.Components.TableConfig;

export class PlayerSkillListCompare {
  private static savedSkillDataList: SkillData[] | undefined;

  static ui() {
    imgui_extra.tree_node("角色技能对比", () => {
      const PlayerBase = Utils.getPlayerBase();
      if (PlayerBase != undefined) {
        const PlayerSkillList = PlayerBase.call<[], REManagedObject>("get_PlayerSkillList");
        const PlayerSkillDataArray = new REArray<REManagedObject>(
          PlayerSkillList.call<[], REManagedObject>("get_PlayerSkillData"),
        );
        const PlayerSkillDataArray_Capacity = PlayerSkillDataArray.getCapacity();
        const skillDataList: SkillData[] = [];
        for (let i = 0; i < PlayerSkillDataArray_Capacity; i++) {
          const PlayerSkillData = PlayerSkillDataArray.get(i);
          const SkillId = PlayerSkillData.get_field<number>("SkillId");
          const SkillLv = PlayerSkillData.get_field<number>("SkillLv");
          if (SkillId != 0) {
            skillDataList.push(new SkillData(SkillId, SkillLv));
          }
        }
        skillDataList.sort((a, b) => a.Id - b.Id);

        if (imgui.button("保存当前角色技能表")) {
          this.savedSkillDataList = skillDataList;
        }
        if (this.savedSkillDataList != undefined) {
          if (imgui.button("清除保存的角色技能表")) {
            this.savedSkillDataList = undefined;
          }
        }

        imgui.begin_group();
        const tableId1 = "当前角色技能表";
        imgui.text(tableId1);
        Components.table(tableId1, skillDataList, this.createTableConfig(this.savedSkillDataList));
        imgui.end_group();
        if (this.savedSkillDataList != undefined) {
          imgui.same_line();
          imgui.begin_group();
          const tableId2 = "保存的角色技能表";
          imgui.text(tableId2);
          Components.table(tableId2, this.savedSkillDataList, this.createTableConfig(skillDataList));
          imgui.end_group();
        }
      }
    });
  }

  static createTableConfig(comparisonSkillDataList: SkillData[] | undefined): TableConfig<SkillData> {
    const config: TableConfig<SkillData> = [
      { key: "SkillName", label: "技能名称", display: (data) => imgui.text(data.getName()) },
      { key: "SkillExplain", label: "技能描述", display: (data) => imgui.text(data.getExplain()) },
      { key: "SkillLv", label: "技能等级", display: (data) => imgui.text(`${data.Lv}`) },
    ];
    if (comparisonSkillDataList != undefined) {
      config.push({
        key: "Comparison",
        label: "对比情况",
        display: (data) => {
          const comparisonSkillData = comparisonSkillDataList.find((value) => value.Id == data.Id);
          const displayText = (() => {
            if (comparisonSkillData == undefined) return "*";
            switch (true) {
              case data.Lv == comparisonSkillData.Lv:
                return "=";
              case data.Lv > comparisonSkillData.Lv:
                return ">";
              case data.Lv < comparisonSkillData.Lv:
                return "<";
              default:
                return "";
            }
          })();
          imgui.text(displayText);
        },
      });
    }
    return config;
  }
}
