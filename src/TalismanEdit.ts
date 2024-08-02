import { imgui_extra } from "./Tools/imgui_extra";
import { REArray, Utils } from "./Utils";
import { Debug } from "./Debug";
import Components = imgui_extra.Components;
import TableConfig = imgui_extra.Components.TableConfig;

// https://github.com/Fexty12573/mhr-charm-item-editor/blob/master/RiseCharmEditorREF/RiseDataEditor.h enum class Rarity : uint32_t
enum TalismanRarity {
  Rarity1 = 0x10100000,
  Rarity2 = 0x10100001,
  Rarity3 = 0x10100002,
  Rarity4 = 0x10100003,
  Rarity5 = 0x10100004,
  Rarity6 = 0x10100005,
  Rarity7 = 0x10100006,
  Rarity4_Novice = 0x10100007,
  Rarity3_Kinship = 0x10100008,
  Rarity2_Veteran = 0x10100009,
  Rarity2_Legacy = 0x1010000a,
  Rarity8 = 0x1010000b,
  Rarity9 = 0x1010000c,
  Rarity10 = 0x1010000d,
}

// snow.data.EquipmentInventoryData.IdTypes
enum IdTypes {
  Empty = 0,
  Weapon = 1,
  Armor = 2,
  Talisman = 3,
  LvBuffCage = 4,
}

Debug.add_TypeDefinition(sdk.find_type_definition("snow.data.DataDef.PlEquipSkillId[]"));
const t_data_shortcut = sdk.find_type_definition("snow.data.DataShortcut");
const t_equipment_inventory_data = sdk.find_type_definition("snow.data.EquipmentInventoryData");

namespace SkillInfo {
  const m_getName = t_data_shortcut.get_method("getName(snow.data.DataDef.PlEquipSkillId)");
  const m_getExplain = t_data_shortcut.get_method("getExplain(snow.data.DataDef.PlEquipSkillId)");
  const m_getMaxLv = t_data_shortcut.get_method("getMaxLv(snow.data.DataDef.PlEquipSkillId)");

  export function getName(SkillId: number): string {
    return m_getName.call<null, [number], string>(null, SkillId);
  }

  export function getExplain(SkillId: number): string {
    return m_getExplain.call<null, [number], string>(null, SkillId);
  }

  export function getMaxLv(SkillId: number): number {
    return m_getMaxLv.call<null, [number], number>(null, SkillId);
  }
}

class SkillData {
  readonly Owner: TalismanData;
  readonly Index: number;
  readonly Id: number;
  readonly Lv: number;

  constructor(Owner: TalismanData, Index: number, Id: number, Lv: number) {
    this.Owner = Owner;
    this.Index = Index;
    this.Id = Id;
    this.Lv = Lv;
  }

  getName(): string {
    return SkillInfo.getName(this.Id);
  }

  getExplain(): string {
    return SkillInfo.getExplain(this.Id);
  }

  getMaxLv(): number {
    return SkillInfo.getMaxLv(this.Id);
  }
}

class TalismanData {
  private static getName: REMethodDefinition = t_equipment_inventory_data.get_method("getName");
  readonly RawData: REManagedObject;
  readonly SkillIdList: REArray<number>;
  readonly SkillLvList: REArray<number>;
  readonly DecoSlotNumList: REArray<number>;

  constructor(TalismanInventory: REManagedObject) {
    this.RawData = TalismanInventory;
    this.SkillIdList = new REArray(TalismanInventory.get_field<REManagedObject>("_TalismanSkillIdList"));
    this.SkillLvList = new REArray(TalismanInventory.get_field<REManagedObject>("_TalismanSkillLvList"));
    this.DecoSlotNumList = new REArray(TalismanInventory.get_field<REManagedObject>("_TalismanDecoSlotNumList"));
  }

  getRarity(): TalismanRarity {
    return this.RawData.get_field("_IdVal");
  }

  getName(): string {
    return TalismanData.getName.call<REManagedObject, [], string>(this.RawData);
  }

  getDecoSlotNum(): [number, number, number, number] {
    const slotLv1 = this.DecoSlotNumList.get(0);
    const slotLv2 = this.DecoSlotNumList.get(1);
    const slotLv3 = this.DecoSlotNumList.get(2);
    const slotLv4 = this.DecoSlotNumList.get(3);
    return [slotLv1, slotLv2, slotLv3, slotLv4];
  }

  getMaxSkillNum(): number {
    return this.SkillIdList.getCapacity();
  }

  getSkillDataList(): SkillData[] {
    const skillDataList: SkillData[] = [];
    for (let i = 0; i < this.getMaxSkillNum(); i++) {
      const id = this.SkillIdList.get(i);
      const lv = this.SkillLvList.get(i);
      if (id != 0) {
        skillDataList.push(new SkillData(this, i, id, lv));
      }
    }
    return skillDataList;
  }

  ContainsSkillId(SkillId: number): boolean {
    const skillDataList = this.getSkillDataList();
    for (const skillData of skillDataList) {
      if (skillData.Id == SkillId) {
        return true;
      }
    }
    return false;
  }
}

class TableConfigPresets {
  static SkillData: TableConfig<SkillData> = [
    { key: "SkillName", label: "技能名称", display: (data) => imgui.text(data.getName()) },
    { key: "SkillExplain", label: "技能描述", display: (data) => imgui.text(data.getExplain()) },
    {
      key: "SkillLv",
      label: "技能等级",
      display: (data, index) => {
        imgui.push_id(`技能等级${index}`);
        const maxLv = data.getMaxLv();
        const [changed, value] = imgui_extra.input_number("", data.Lv, [1, maxLv]);
        imgui.same_line();
        imgui.text(`/${maxLv}`);
        if (changed) data.Owner.SkillLvList.set(data.Index, value);
        imgui.pop_id();
      },
    },
    {
      key: "DeleteButton",
      label: "",
      display: (data, index) => {
        imgui.push_id(`删除${index}`);
        if (imgui.button("删除")) {
          data.Owner.SkillIdList.set(data.Index, 0);
          data.Owner.SkillLvList.set(data.Index, 0);
        }
        imgui.pop_id();
      },
    },
  ];
  static SkillId: TableConfig<number> = [
    { key: "SkillName", label: "技能名称", display: (data) => imgui.text(SkillInfo.getName(data)) },
    {
      key: "SkillExplain",
      label: "技能描述",
      display: (data) => imgui.text(SkillInfo.getExplain(data)),
    },
    {
      key: "SelectButton",
      label: "",
      display: (data, index) => {
        imgui.push_id(`选择${index}`);
        if (imgui.button("选择")) TalismanEdit.CurrentSelectSkillId = data;
        imgui.pop_id();
      },
    },
  ];
  static TalismanData: TableConfig<TalismanData> = [
    { key: "TalismanName", label: "护石名称", display: (data) => imgui.text(data.getName()) },
    {
      key: "TalismanSkills",
      label: "护石技能",
      display: (data) => {
        const skillDataList = data.getSkillDataList();
        for (const skillData of skillDataList) {
          imgui.text(`${skillData.getName()}: ${skillData.Lv}/${skillData.getMaxLv()}`);
        }
      },
    },
    {
      key: "TalismanDecoSlot",
      label: "护石插槽",
      display: (data) => {
        const decoSlotNum = data.getDecoSlotNum();
        imgui.text(`${decoSlotNum[0]}, ${decoSlotNum[1]}, ${decoSlotNum[2]}, ${decoSlotNum[3]}`);
      },
    },
    {
      key: "SelectButton",
      label: "",
      display: (_, index) => {
        imgui.push_id(`选择${index}`);
        if (imgui.button("选择")) TalismanEdit.CurrentSelectTalisman = index;
        imgui.pop_id();
      },
    },
  ];
}

export class TalismanEdit {
  static CurrentSelectTalisman: number | undefined;
  static CurrentSelectSkillId: number | undefined;

  static ui() {
    imgui_extra.tree_node("护石修改", () => {
      if (Utils.isInVillage()) {
        const DataManager = sdk.get_managed_singleton("snow.data.DataManager");
        if (DataManager == undefined) {
          return;
        }

        const PlEquipBox = DataManager.get_field<REManagedObject>("_PlEquipBox");
        const WeaponArmorInventoryList = PlEquipBox.get_field<REManagedObject>("_WeaponArmorInventoryList");
        const WeaponArmorInventoryList_Count = WeaponArmorInventoryList.call<[], number>("get_Count");

        if (TalismanEdit.CurrentSelectTalisman != undefined) {
          imgui.text(`当前选择护石索引: ${TalismanEdit.CurrentSelectTalisman}`);
          imgui.same_line();
          imgui.push_id("护石索引");
          if (imgui.button("取消选择")) this.CurrentSelectTalisman = undefined;
          imgui.pop_id();
        } else imgui.text("没有选择护石索引");
        if (TalismanEdit.CurrentSelectSkillId != undefined) {
          imgui.text(`当前选择技能: ${SkillInfo.getName(TalismanEdit.CurrentSelectSkillId)}`);
          imgui.same_line();
          imgui.push_id("技能");
          if (imgui.button("取消选择")) this.CurrentSelectSkillId = undefined;
          imgui.pop_id();
        } else imgui.text("没有选择技能");

        const TalismanList: TalismanData[] = [];
        for (let i = 0; i < WeaponArmorInventoryList_Count; i++) {
          const entry = WeaponArmorInventoryList.call<[number], REManagedObject>("get_Item", i);
          Debug.add_TypeDefinition(entry.get_type_definition());
          const type = entry.get_field<IdTypes>("_IdType");
          if (type == IdTypes.Talisman) {
            TalismanList.push(new TalismanData(entry));
          }
        }
        imgui_extra.tree_node("护石技能库", () => {
          const skillIdList: number[] = [];
          for (const talisman of TalismanList) {
            const skillDataList = talisman.getSkillDataList();
            for (const skillData of skillDataList) {
              if (!skillIdList.includes(skillData.Id)) {
                skillIdList.push(skillData.Id);
              }
            }
          }
          skillIdList.sort((a, b) => a - b);
          Components.table("技能表", skillIdList, TableConfigPresets.SkillId);
        });

        imgui_extra.tree_node("护石库", () => {
          Components.table("护石表", TalismanList, TableConfigPresets.TalismanData);
        });

        imgui_extra.tree_node("当前选择护石", () => {
          if (TalismanEdit.CurrentSelectTalisman != undefined) {
            const talisman = TalismanList[TalismanEdit.CurrentSelectTalisman];
            if (talisman != undefined) {
              const rarity = talisman.getRarity();
              if (rarity != TalismanRarity.Rarity10) {
                if (imgui.button("修改护石成稀有度10")) {
                  talisman.RawData.set_field("_IdVal", TalismanRarity.Rarity10);
                }
              }

              if (talisman.getDecoSlotNum()[3] != 3) {
                if (imgui.button("修改护石成3个4级槽位")) {
                  const capacity = talisman.DecoSlotNumList.getCapacity();
                  for (let i = 0; i < capacity; i++) {
                    talisman.DecoSlotNumList.set(i, 0);
                  }
                  talisman.DecoSlotNumList.set(3, 3);
                }
              }

              const maxSkillNum = talisman.getMaxSkillNum();
              const skillDataList = talisman.getSkillDataList();
              imgui.text(`技能数量: ${skillDataList.length}/${maxSkillNum}`);
              Components.table("护石技能表", skillDataList, TableConfigPresets.SkillData);
              if (
                skillDataList.length < maxSkillNum &&
                TalismanEdit.CurrentSelectSkillId != undefined &&
                !talisman.ContainsSkillId(TalismanEdit.CurrentSelectSkillId)
              ) {
                if (imgui.button(`添加技能(${SkillInfo.getName(TalismanEdit.CurrentSelectSkillId)})`)) {
                  for (let i = 0; i < maxSkillNum; i++) {
                    const id = talisman.SkillIdList.get(i);
                    if (id == 0) {
                      talisman.SkillIdList.set(i, TalismanEdit.CurrentSelectSkillId);
                      talisman.SkillLvList.set(i, 1);
                      break;
                    }
                  }
                }
              }
            }
          }
        });
      }
    });
  }
}
