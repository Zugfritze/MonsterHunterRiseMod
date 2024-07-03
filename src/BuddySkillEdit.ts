export class BuddySkillEdit {
  private static DataManager: REManagedObject | undefined = undefined;
  private static getSkillName: REMethodDefinition | undefined = undefined;

  static ui() {
    if (imgui.tree_node("伙伴技能修改")) {
      if (this.DataManager == undefined) {
        this.DataManager = sdk.get_managed_singleton("snow.data.DataManager");
      }
      if (this.getSkillName == undefined) {
        this.getSkillName = sdk
          .find_type_definition("snow.data.DataShortcut")
          .get_method("getName(snow.data.DataDef.OtSkillId)");
      }

      const Otomos: REManagedObject = this.DataManager.get_field(
        "<AttendantOtomoDataList>k__BackingField",
      );
      const Otomos_Count: number = Otomos.call("get_Count");

      for (let i = 0; i < Otomos_Count; i++) {
        const Otomo: REManagedObject | undefined = Otomos.call("Get", i);
        if (Otomo != undefined) {
          imgui.begin_group();
          if (imgui.tree_node(Otomo.call("getName"))) {
            if (imgui.tree_node("技能列表")) {
              const OtSkillIdList: REManagedObject =
                Otomo.get_field("_OtSkillIdList");
              const OtSkillIdList_Count: number =
                OtSkillIdList.call("get_Count");
              for (let i = 0; i < OtSkillIdList_Count; i++) {
                imgui.text(
                  this.getSkillName.call(
                    null,
                    OtSkillIdList.call("get_Item", i),
                  ),
                );
              }
              imgui.tree_pop();
            }

            if (imgui.tree_node("已启用技能列表")) {
              const EnableOtSkillIdList: REManagedObject = Otomo.get_field(
                "_EnableOtSkillIdList",
              );
              const EnableOtSkillIdList_Count: number =
                EnableOtSkillIdList.call("get_Count");
              for (let i = 0; i < EnableOtSkillIdList_Count; i++) {
                imgui.text(
                  this.getSkillName.call(
                    null,
                    EnableOtSkillIdList.call("get_Item", i),
                  ),
                );
              }
              imgui.tree_pop();
            }
            imgui.tree_pop();
          }
          imgui.end_group();
          if (Otomos_Count - i > 1) {
            imgui.same_line();
          }
        }
      }
      imgui.tree_pop();
    }
  }
}
