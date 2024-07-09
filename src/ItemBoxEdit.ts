import { imgui_extra } from "./Tools/imgui_extra";
import Components = imgui_extra.Components;
import TableConfig = imgui_extra.Components.TableConfig;

class ItemData {
  private static t_DataShortcut = sdk.find_type_definition("snow.data.DataShortcut");
  private static getName = ItemData.t_DataShortcut.get_method("getName(snow.data.ContentsIdSystem.ItemId)");
  private static t_ItemInventoryData = sdk.find_type_definition("snow.data.ItemInventoryData");
  private static getId: REMethodDefinition = ItemData.t_ItemInventoryData.get_method("getId");
  private static getNum: REMethodDefinition = ItemData.t_ItemInventoryData.get_method("getNum");
  RawData: REManagedObject;
  Index: number;

  constructor(itemData: REManagedObject, index: number) {
    this.RawData = itemData;
    this.Index = index;
  }

  get_id(): number {
    return ItemData.getId.call(this.RawData);
  }

  get_name(): string {
    return ItemData.getName.call(null, this.get_id());
  }

  get_num(): number {
    return ItemData.getNum.call(this.RawData);
  }
}

export class ItemBoxEdit {
  private static get_Item: REMethodDefinition | undefined = undefined;
  private static searchOptions = {
    searchText: "",
    searchByItemBoxSlot: true,
    searchByItemID: true,
    searchByItemName: true,
    searchByItemAmt: true,
  };
  private static Item_box_slot: number = 0;
  private static Item_amt: number = 1;
  private static TableConfig: TableConfig<ItemData> = [
    { key: "Slot", label: "槽位", display: (data) => imgui.text(data.Index.toString()) },
    { key: "Id", label: "物品ID", display: (data) => imgui.text(data.get_id().toString()) },
    { key: "Name", label: "物品名称", display: (data) => imgui.text(data.get_name()) },
    { key: "Amt", label: "物品数量", display: (data) => imgui.text(data.get_num().toString()) },
    {
      key: "select",
      label: "",
      display: (_data, index) => {
        imgui.push_id(`选择${index}`);
        if (imgui.button("选择")) {
          ItemBoxEdit.Item_box_slot = index;
        }
        imgui.pop_id();
      },
    },
  ];

  static ui() {
    imgui_extra.tree_node("物品箱编辑", () => {
      const DataManager: REManagedObject = sdk.get_managed_singleton("snow.data.DataManager");
      const itemBox: REManagedObject = DataManager.get_field("_PlItemBox");

      const itemList: REManagedObject = itemBox.get_field("_InventoryList");
      const itemListCount: number = itemList.call("get_Count");

      if (this.get_Item == undefined) {
        this.get_Item = itemList.get_type_definition().get_method("get_Item");
      }

      const itemDataList: ItemData[] = [];
      for (let i = 0; i < itemListCount; i++) {
        const itemData = new ItemData(this.get_Item.call(itemList, i), i);
        if (itemData.get_id() != 67108864) {
          itemDataList.push(itemData);
        }
      }

      imgui_extra.tree_node("物品箱", () => {
        Components.searchAndCheckboxes("搜索", this.searchOptions, [
          { key: "searchByItemBoxSlot", label: "搜索槽位" },
          { key: "searchByItemID", label: "搜索物品ID", same_line: true },
          { key: "searchByItemName", label: "搜索物品名称", same_line: true },
          { key: "searchByItemAmt", label: "搜索物品数量", same_line: true },
        ]);

        const filterItemList = itemDataList.filter((itemData) => {
          return (
            this.searchOptions.searchText == "" ||
            (this.searchOptions.searchByItemBoxSlot &&
              itemData.Index.toString().includes(this.searchOptions.searchText)) ||
            (this.searchOptions.searchByItemID &&
              itemData.get_id().toString().includes(this.searchOptions.searchText)) ||
            (this.searchOptions.searchByItemName && itemData.get_name().includes(this.searchOptions.searchText)) ||
            (this.searchOptions.searchByItemAmt &&
              itemData.get_num().toString().includes(this.searchOptions.searchText))
          );
        });

        Components.table("物品箱表", filterItemList, this.TableConfig);
      });

      const [Item_box_slot_changed, Item_box_slot_value] = imgui_extra.input_number("物品箱槽位", this.Item_box_slot, [
        0,
        itemListCount - 1,
      ]);
      if (Item_box_slot_changed) {
        this.Item_box_slot = Item_box_slot_value;
      }
      const itemData = itemDataList[this.Item_box_slot];
      if (itemData == undefined) {
        imgui.text("这个槽位是空的");
      } else {
        imgui.text(`物品ID: ${itemData.get_id()} 名称: ${itemData.get_name()} 数量: ${itemData.get_num()}`);
        const [Item_amt_changed, Item_amt_value] = imgui_extra.input_number("物品数量", this.Item_amt, [1, 9999]);
        if (Item_amt_changed) {
          this.Item_amt = Item_amt_value;
        }
        if (imgui.button("修改数量至x" + this.Item_amt)) {
          itemData.RawData.get_field("_ItemCount").set_field("_Num", this.Item_amt);
        }
      }
    });
  }
}
