import { imgui_extra } from "./Tools/imgui_extra";
import TableConfig = imgui_extra.Components.TableConfig;

class SkillData {
  private static t_data_shortcut = sdk.find_type_definition("snow.data.DataShortcut");
  private static getSkillIconColor: REMethodDefinition = SkillData.t_data_shortcut.get_method(
    "getIconColor(snow.otomo.OtomoDef.OtVariation, snow.data.DataDef.OtSkillId)",
  );
  private static getSkillName: REMethodDefinition = SkillData.t_data_shortcut.get_method(
    "getName(snow.data.DataDef.OtSkillId)",
  );
  private static getSkillExplain: REMethodDefinition = SkillData.t_data_shortcut.get_method(
    "getExplain(snow.data.DataDef.OtSkillId)",
  );
  private static getSkillUnlockLv: REMethodDefinition = SkillData.t_data_shortcut.get_method(
    "getUnlockLv(snow.otomo.OtomoDef.OtVariation, snow.data.DataDef.OtSkillId)",
  );
  private static getSkillSlotNum: REMethodDefinition = SkillData.t_data_shortcut.get_method(
    "getSlotNum(snow.otomo.OtomoDef.OtVariation, snow.data.DataDef.OtSkillId)",
  );

  Id: number;
  OtomoVariation: number;
  IconColor: number;
  Name: string;
  Explain: string;
  UnlockLv: number;
  SlotNum: number;

  constructor(Id: number, OtomoVariation: number) {
    this.Id = Id;
    this.OtomoVariation = OtomoVariation;
    this.IconColor = SkillData.getSkillIconColor.call(null, OtomoVariation, Id);
    this.Name = SkillData.getSkillName.call(null, Id);
    this.Explain = SkillData.getSkillExplain.call(null, Id);
    this.UnlockLv = SkillData.getSkillUnlockLv.call(null, OtomoVariation, Id);
    this.SlotNum = SkillData.getSkillSlotNum.call(null, OtomoVariation, Id);
  }
}

interface SkillDataEx extends SkillData {
  OwnerNames: string[];
}

class SkillList {
  readonly Owner: OtomoData;
  readonly RawData: REManagedObject;

  constructor(owner: OtomoData, OtSkillIdList: REManagedObject) {
    this.Owner = owner;
    this.RawData = OtSkillIdList;
  }

  getCapacity(): number {
    return this.RawData.call("get_Capacity");
  }

  getCount(): number {
    return this.RawData.call("get_Count");
  }

  getDataList(): SkillData[] {
    const SkillDataList: SkillData[] = [];
    for (let Index = 0; Index < this.getCount(); Index++) {
      const Id: number = this.RawData.call("get_Item", Index);
      SkillDataList.push(new SkillData(Id, this.Owner.getVariation()));
    }
    return SkillDataList;
  }

  ContainsId(Id: number): boolean {
    const DataList = this.getDataList();
    for (const data of DataList) {
      if (data.Id == Id) {
        return true;
      }
    }
    return false;
  }
}

class OtomoData {
  readonly RawData: REManagedObject;
  AllSkill: SkillList;
  EnableSkill: SkillList;

  constructor(Otomo: REManagedObject) {
    this.RawData = Otomo;
    this.AllSkill = new SkillList(this, Otomo.get_field("_OtSkillIdList"));
    this.EnableSkill = new SkillList(this, Otomo.get_field("_EnableOtSkillIdList"));
  }

  getName(): string {
    return this.RawData.call("getName");
  }

  getVariation(): number {
    return this.RawData.call("getVariation");
  }

  ClearEnableSkill() {
    this.EnableSkill.RawData.call("Clear");
  }
}

type OtVariationResult<T> = { cat: T; dog: T };

class EmployedOtSkillList {
  static get(DataManager: REManagedObject): OtVariationResult<SkillDataEx[]> {
    const EmployedOtomoList: REManagedObject = DataManager.get_field("<EmployedOtomoList>k__BackingField");
    const catEmployedOtomoDataListRaw: REManagedObject = EmployedOtomoList.call(
      "getEmployedOtomoDataList(snow.otomo.OtomoDef.OtVariation)",
      0,
    );
    const dogEmployedOtomoDataListRaw: REManagedObject = EmployedOtomoList.call(
      "getEmployedOtomoDataList(snow.otomo.OtomoDef.OtVariation)",
      1,
    );
    const getEmployedOtomoDataListResult = this.getEmployedOtomoDataList([
      { key: "cat", EmployedOtomoDataListRaw: catEmployedOtomoDataListRaw },
      { key: "dog", EmployedOtomoDataListRaw: dogEmployedOtomoDataListRaw },
    ]);
    return this.getSkillDataExList([
      { key: "cat", OtomoDataList: getEmployedOtomoDataListResult.cat },
      { key: "dog", OtomoDataList: getEmployedOtomoDataListResult.dog },
    ]);
  }

  private static getEmployedOtomoDataList(
    config: {
      key: keyof OtVariationResult<OtomoData[]>;
      EmployedOtomoDataListRaw: REManagedObject;
    }[],
  ): OtVariationResult<OtomoData[]> {
    const result: OtVariationResult<OtomoData[]> = {
      cat: [],
      dog: [],
    };
    for (const configItem of config) {
      const Count: number = configItem.EmployedOtomoDataListRaw.call("get_Count");
      for (let i = 0; i < Count; i++) {
        const EmployedOtomoData: REManagedObject = configItem.EmployedOtomoDataListRaw.call("get_Item", i);
        const OtomoDataRaw: REManagedObject = EmployedOtomoData.call("get_OtomoData");
        // EmployedOtomoDataListRaw(C#类型:List<snow.data.EmployedOtomoData>)里是固定的35个EmployedOtomoData但是EmployedOtomoData里面不一定有OtomoData
        if (OtomoDataRaw != undefined) {
          result[configItem.key].push(new OtomoData(OtomoDataRaw));
        }
      }
    }
    return result;
  }

  private static getSkillDataExList(
    config: {
      key: keyof OtVariationResult<SkillDataEx[]>;
      OtomoDataList: OtomoData[];
    }[],
  ): OtVariationResult<SkillDataEx[]> {
    const result: OtVariationResult<SkillDataEx[]> = {
      cat: [],
      dog: [],
    };
    for (const configItem of config) {
      const mergedMap = new Map<number, SkillDataEx>();
      for (const otomoData of configItem.OtomoDataList) {
        const dataList = otomoData.AllSkill.getDataList();
        for (const data of dataList) {
          const existingSkillData = mergedMap.get(data.Id);
          if (existingSkillData == undefined) {
            mergedMap.set(data.Id, { ...data, OwnerNames: [otomoData.getName()] });
          } else {
            const ownerName = otomoData.getName();
            if (!existingSkillData.OwnerNames.includes(ownerName)) {
              existingSkillData.OwnerNames.push(ownerName);
            }
          }
        }
      }
      result[configItem.key] = Array.from(mergedMap.values()).sort((a, b) => a.Id - b.Id);
    }
    return result;
  }
}

class OtSkillTable {
  private static OtSkillColorMap: { [key: number]: string } = {
    4: "黄色",
    7: "红色",
    11: "蓝色",
  };
  private static OtSkillExplainSkillIconTagMap = [
    ["<ICON Otomoskill_Red>", "红色技能"],
    ["<ICON Otomoskill_Blue>", "蓝色技能"],
  ];
  static DefaultConfig: TableConfig<SkillData> = [
    { key: "Id", label: "技能ID", display: (_index: number, data: SkillData) => imgui.text(data.Id.toString()) },
    {
      key: "ColorName",
      label: "技能颜色",
      display: (_index, data) => imgui.text(OtSkillTable.OtSkillColorMap[data.IconColor] ?? data.IconColor.toString()),
    },
    { key: "Name", label: "技能名称", display: (_index, data) => imgui.text(data.Name) },
    {
      key: "Explain",
      label: "技能描述",
      display: (_index, data) => {
        let Explain: string = data.Explain;
        for (const [key, value] of OtSkillTable.OtSkillExplainSkillIconTagMap) {
          Explain = Explain.replace(key, value);
        }
        imgui.text(Explain);
      },
    },
    {
      key: "UnlockLv",
      label: "解锁等级",
      display: (_index, data) => imgui.text(data.UnlockLv.toString()),
    },
    {
      key: "SlotNum",
      label: "槽位消耗",
      display: (_index, data) => imgui.text(data.SlotNum.toString()),
    },
  ];

  static UI<T extends SkillData>(data: T[], config: TableConfig<T> = OtSkillTable.DefaultConfig) {
    imgui_extra.Components.table("技能表", data, config);
  }
}

export class BuddySkillEdit {
  static CurrentSelectionSkill: SkillData | undefined = undefined;
  static EmployedOtSkillListTableConfig: TableConfig<SkillDataEx> = [
    ...OtSkillTable.DefaultConfig,
    {
      key: "ownerName",
      label: "拥有者",
      display: (_index, data) => imgui.text(data.OwnerNames.join(",")),
    },
    {
      key: "select",
      label: "",
      display: (index, data) => {
        imgui.push_id(`选择${index}`);
        if (imgui.button("选择")) {
          BuddySkillEdit.CurrentSelectionSkill = data;
        }
        imgui.pop_id();
      },
    },
  ];
  private static OtVariationMap: { [key: number]: string } = {
    0: "猫",
    1: "狗",
  };

  static ui() {
    imgui_extra.tree_node("伙伴技能修改", () => {
      const DataManager = sdk.get_managed_singleton("snow.data.DataManager");
      if (DataManager == undefined) {
        return;
      }

      if (this.CurrentSelectionSkill != undefined) {
        imgui.text(
          `当前选择: ${this.CurrentSelectionSkill.Name}(${this.OtVariationMap[this.CurrentSelectionSkill.OtomoVariation]})`,
        );
        imgui.same_line();
        if (imgui.button("取消选择")) {
          this.CurrentSelectionSkill = undefined;
        }
      } else {
        imgui.text("没有选择技能");
      }

      imgui_extra.tree_node("已有技能库", () => {
        const employedOtSkillList = EmployedOtSkillList.get(DataManager);
        imgui_extra.tree_node("猫", () => {
          OtSkillTable.UI(employedOtSkillList.cat, this.EmployedOtSkillListTableConfig);
        });
        imgui_extra.tree_node("狗", () => {
          OtSkillTable.UI(employedOtSkillList.dog, this.EmployedOtSkillListTableConfig);
        });
      });

      const Otomos: REManagedObject = DataManager.get_field("<AttendantOtomoDataList>k__BackingField");
      const Otomos_Count: number = Otomos.call("get_Count");
      for (let i = 0; i < Otomos_Count; i++) {
        const Otomo: REManagedObject | undefined = Otomos.call("Get", i);
        if (Otomo != undefined) {
          const otomoData = new OtomoData(Otomo);
          imgui_extra.tree_node(`${otomoData.getName()} (${this.OtVariationMap[otomoData.getVariation()]})`, () => {
            imgui_extra.tree_node("技能列表", () => {
              const AllSkill = otomoData.AllSkill;
              imgui.text(`技能数量: ${AllSkill.getCapacity()}/${AllSkill.getCount()}`);
              const EquippedTableConfig: TableConfig<SkillData> = [
                ...OtSkillTable.DefaultConfig,
                {
                  key: "cover",
                  label: "",
                  display: (index) => {
                    if (
                      BuddySkillEdit.CurrentSelectionSkill != undefined &&
                      otomoData.getVariation() == BuddySkillEdit.CurrentSelectionSkill.OtomoVariation
                    ) {
                      if (!otomoData.AllSkill.ContainsId(BuddySkillEdit.CurrentSelectionSkill.Id)) {
                        imgui.push_id(`覆盖${index}`);
                        if (imgui.button("覆盖")) {
                          otomoData.ClearEnableSkill();
                          otomoData.AllSkill.RawData.call("set_Item", index, BuddySkillEdit.CurrentSelectionSkill.Id);
                          BuddySkillEdit.CurrentSelectionSkill = undefined;
                        }
                        imgui.pop_id();
                      } else {
                        imgui.text("已有该技能");
                      }
                    }
                  },
                },
              ];
              OtSkillTable.UI(AllSkill.getDataList(), EquippedTableConfig);
            });

            imgui_extra.tree_node("已启用技能列表", () => {
              const EnableSkill = otomoData.EnableSkill;
              imgui.text(`技能数量: ${EnableSkill.getCapacity()}/${EnableSkill.getCount()}`);
              OtSkillTable.UI(EnableSkill.getDataList());
            });
          });
        }
      }
    });
  }
}
