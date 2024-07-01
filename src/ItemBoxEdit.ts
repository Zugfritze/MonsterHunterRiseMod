import { imgui_extra } from "./Utils";

export class ItemBoxEdit {
  private static mo_data_manager: REManagedObject | undefined;
  private static mo_item_box: REManagedObject | undefined;
  private static m_get_item_name: REMethodDefinition | undefined;
  private static Item_name_search: string = "";
  private static Item_box_slot: number = 1;
  private static Item_amt: number = 1;

  static init(): boolean {
    this.mo_data_manager = sdk.get_managed_singleton("snow.data.DataManager");
    if (this.mo_data_manager == undefined) {
      return false;
    }

    this.mo_item_box = this.mo_data_manager.get_field("_PlItemBox");
    if (this.mo_item_box == undefined) {
      return false;
    }

    const t_data_shortcut = sdk.find_type_definition("snow.data.DataShortcut");
    if (t_data_shortcut == undefined) {
      return false;
    }

    this.m_get_item_name = t_data_shortcut.get_method(
      "getName(snow.data.ContentsIdSystem.ItemId)",
    );
    return this.m_get_item_name != undefined;
  }

  static ui() {
    if (imgui.tree_node("物品箱编辑")) {
      const items: REManagedObject =
        this.mo_item_box!.get_field("_InventoryList");
      const items_count: number = items.call("get_Count");
      if (imgui.tree_node("物品箱槽位预览")) {
        this.Item_name_search = imgui.input_text(
          "搜索",
          this.Item_name_search,
        )[1];
        for (let i = 0; i < items_count; i++) {
          const item: REManagedObject = items.call("get_Item", i);
          const item_data: REManagedObject = item.get_field("_ItemCount");
          const item_data_id: number = item_data.get_field("_Id");
          if (item_data_id != 67108864) {
            const item_name: string = this.m_get_item_name!.call(
              null,
              item_data_id,
            );
            if (
              this.Item_name_search == "" ||
              item_name.includes(this.Item_name_search)
            ) {
              const item_data_amt: number = item_data.get_field("_Num");
              imgui.push_id("设置槽位" + (i + 1));
              if (imgui.button("设置槽位")) {
                this.Item_box_slot = i + 1;
              }
              imgui.pop_id();
              imgui.same_line();
              imgui.text(
                `槽位: ${i + 1} 物品ID: ${item_data_id} 名称: ${item_name} 数量: ${item_data_amt}`,
              );
            }
          }
        }
        imgui.tree_pop();
      }
      const [Item_box_slot_changed, Item_box_slot_value] =
        imgui_extra.input_number("物品箱槽位", this.Item_box_slot, [
          1,
          items_count,
        ]);
      if (Item_box_slot_changed) {
        this.Item_box_slot = Item_box_slot_value;
      }
      const item: REManagedObject = items.call(
        "get_Item",
        this.Item_box_slot - 1,
      );
      const item_data: REManagedObject = item.get_field("_ItemCount");
      const item_data_id: number = item_data.get_field("_Id");
      if (item_data_id == 67108864) {
        imgui.text("这个槽位是空的");
      } else {
        const item_name: string = this.m_get_item_name!.call(
          null,
          item_data_id,
        );
        const item_data_amt: number = item_data.get_field("_Num");
        imgui.text(
          `物品ID: ${item_data_id} 名称: ${item_name} 数量: ${item_data_amt}`,
        );
        const [Item_amt_changed, Item_amt_value] = imgui_extra.input_number(
          "物品数量",
          this.Item_amt,
          [1, 9999],
        );
        if (Item_amt_changed) {
          this.Item_amt = Item_amt_value;
        }
        if (imgui.button("修改数量至x" + this.Item_amt)) {
          item_data.set_field("_Num", this.Item_amt);
        }
      }
      imgui.tree_pop();
    }
  }
}
