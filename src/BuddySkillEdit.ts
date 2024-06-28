import { Debug } from "./Debug";

export class BuddySkillEdit {
  private static DataManager: REManagedObject | undefined = undefined;

  static ui() {
    if (imgui.tree_node("伙伴技能修改")) {
      if (this.DataManager == undefined) {
        this.DataManager = sdk.get_managed_singleton("snow.data.DataManager");
      }

      let Otomos: REManagedObject = this.DataManager.get_field(
        "<AttendantOtomoDataList>k__BackingField",
      );
      let Otomo1 = Otomos[0];
      let Otomo2 = Otomos[1];

      if (Otomo1) {
        imgui.text(Otomo1.call("getName"));

        let EnableOtSkillIdList: REManagedObject = Otomo1.get_field(
          "_EnableOtSkillIdList",
        );
        let a: number =
          EnableOtSkillIdList.get_field("mItems").call("get_Count");
        let b: number = EnableOtSkillIdList.call("get_Count");
        imgui.text(a.toString());
        imgui.text(b.toString());

        let c: number = EnableOtSkillIdList.get_field("mSize");
        imgui.text(c.toString());

        let d: number = EnableOtSkillIdList.call("get_Capacity");
        imgui.text(d.toString());

        let TypeDefinition = EnableOtSkillIdList.get_type_definition();
        Debug.add_TypeDefinition(TypeDefinition);
      }
      if (Otomo2) {
        imgui.text(Otomo2.call("getName"));
      }
      imgui.tree_pop();
    }
  }
}
