import { imgui_extra } from "./Tools/imgui_extra";
import { Utils } from "./Utils";
import TableConfig = imgui_extra.Components.TableConfig;

const t_data_shortcut = sdk.find_type_definition("snow.data.DataShortcut");

enum OtVariation {
  OtAirou = 0,
  OtDog = 1,
}

const otVariation = [OtVariation.OtAirou, OtVariation.OtDog];

class SkillData {
  private static getSkillIconColor: REMethodDefinition = t_data_shortcut.get_method(
    "getIconColor(snow.otomo.OtomoDef.OtVariation, snow.data.DataDef.OtSkillId)",
  );
  private static getSkillName: REMethodDefinition = t_data_shortcut.get_method("getName(snow.data.DataDef.OtSkillId)");
  private static getSkillExplain: REMethodDefinition = t_data_shortcut.get_method(
    "getExplain(snow.data.DataDef.OtSkillId)",
  );
  private static getSkillUnlockLv: REMethodDefinition = t_data_shortcut.get_method(
    "getUnlockLv(snow.otomo.OtomoDef.OtVariation, snow.data.DataDef.OtSkillId)",
  );
  private static getSkillSlotNum: REMethodDefinition = t_data_shortcut.get_method(
    "getSlotNum(snow.otomo.OtomoDef.OtVariation, snow.data.DataDef.OtSkillId)",
  );

  Id: number;
  OtVariation: OtVariation;
  IconColor: number;
  Name: string;
  Explain: string;
  UnlockLv: number;
  SlotNum: number;

  constructor(Id: number, OtVariation: OtVariation) {
    this.Id = Id;
    this.OtVariation = OtVariation;
    this.IconColor = SkillData.getSkillIconColor.call(null, OtVariation, Id);
    this.Name = SkillData.getSkillName.call(null, Id);
    this.Explain = SkillData.getSkillExplain.call(null, Id);
    this.UnlockLv = SkillData.getSkillUnlockLv.call(null, OtVariation, Id);
    this.SlotNum = SkillData.getSkillSlotNum.call(null, OtVariation, Id);
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
      const Id = this.RawData.call<[number], number>("get_Item", Index);
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

enum OtSupportTypeId {
  Fight = 0,
  Assist = 1,
  Heal = 2,
  Bomber = 3,
  Collect = 4,
}

const otSupportTypeId = [
  OtSupportTypeId.Fight,
  OtSupportTypeId.Assist,
  OtSupportTypeId.Heal,
  OtSupportTypeId.Bomber,
  OtSupportTypeId.Collect,
];

class OtSupportTypeIdTool {
  private static getNameMD: REMethodDefinition = t_data_shortcut.get_method(
    "getName(snow.data.DataDef.OtSupportTypeId)",
  );
  private static getExplainMD: REMethodDefinition = t_data_shortcut.get_method(
    "getExplain(snow.data.DataDef.OtSupportTypeId)",
  );

  static getName(otSupportType: OtSupportTypeId): string {
    return this.getNameMD.call(null, otSupportType);
  }

  static getExplain(otSupportType: OtSupportTypeId): string {
    return this.getExplainMD.call(null, otSupportType);
  }
}

class SupportAction {
  private static getName: REMethodDefinition = t_data_shortcut.get_method(
    "getName(snow.data.DataDef.OtSupportActionId)",
  );
  private static getExplain: REMethodDefinition = t_data_shortcut.get_method(
    "getExplain(snow.data.DataDef.OtSupportActionId)",
  );
  private static getOpenLv: REMethodDefinition = t_data_shortcut.get_method(
    "getOpenLv(snow.data.DataDef.OtSupportActionId)",
  );

  Id: number;
  Name: string;
  Explain: string;
  OpenLv: number;

  constructor(Id: number) {
    this.Id = Id;
    this.Name = SupportAction.getName.call(null, Id);
    this.Explain = SupportAction.getExplain.call(null, Id);
    this.OpenLv = SupportAction.getOpenLv.call(null, Id);
  }
}

interface SupportActionEx extends SupportAction {
  OwnerNames: string[];
}

class SupportInfo {
  readonly Owner: OtomoData;
  readonly RawData: REManagedObject;

  constructor(owner: OtomoData, SupportInfo: REManagedObject) {
    this.Owner = owner;
    this.RawData = SupportInfo;
  }

  getSupportType(): OtSupportTypeId {
    return this.RawData.get_field("_SupportTypeId");
  }

  getSupportActionList(): SupportAction[] {
    const ActionIdList = this.RawData.get_field<REManagedObject>("_SupportActionIdList");
    const ActionIdList_Count = ActionIdList.call<[], number>("get_Count");
    const SupportActionList: SupportAction[] = [];
    for (let i = 0; i < ActionIdList_Count; i++) {
      const actionId = ActionIdList.call<[number], number | undefined>("Get", i);
      if (actionId != undefined) {
        SupportActionList.push(new SupportAction(actionId));
      }
    }
    return SupportActionList;
  }

  ContainsId(Id: number): boolean {
    const ActionList = this.getSupportActionList();
    for (const action of ActionList) {
      if (action.Id == Id) {
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
  SupportInfo?: SupportInfo;

  constructor(Otomo: REManagedObject) {
    this.RawData = Otomo;
    this.AllSkill = new SkillList(this, Otomo.get_field("_OtSkillIdList"));
    this.EnableSkill = new SkillList(this, Otomo.get_field("_EnableOtSkillIdList"));
    if (this.getVariation() == OtVariation.OtAirou) {
      this.SupportInfo = new SupportInfo(this, Otomo.get_field("_SupportInfo"));
    }
  }

  getName(): string {
    return this.RawData.call("getName");
  }

  getVariation(): OtVariation {
    return this.RawData.call("getVariation");
  }

  hasSupportInfo(): this is { SupportInfo: SupportInfo } {
    return this.SupportInfo != undefined;
  }
}

class OtomoTools {
  static getEmployedOtomoDataList(DataManager: REManagedObject, otVariation: OtVariation): OtomoData[] {
    const EmployedOtomoList = DataManager.get_field<REManagedObject>("<EmployedOtomoList>k__BackingField");
    const EmployedOtomoDataListRaw = EmployedOtomoList.call<[OtVariation], REManagedObject>(
      "getEmployedOtomoDataList(snow.otomo.OtomoDef.OtVariation)",
      otVariation,
    );
    const result: OtomoData[] = [];
    const Count = EmployedOtomoDataListRaw.call<[], number>("get_Count");
    for (let i = 0; i < Count; i++) {
      const EmployedOtomoData = EmployedOtomoDataListRaw.call<[number], REManagedObject>("get_Item", i);
      const OtomoDataRaw = EmployedOtomoData.call<[], REManagedObject>("get_OtomoData");
      // EmployedOtomoDataListRaw(C#类型:List<snow.data.EmployedOtomoData>)里是固定的35个EmployedOtomoData但是EmployedOtomoData里面不一定有OtomoData
      if (OtomoDataRaw != undefined) {
        result.push(new OtomoData(OtomoDataRaw));
      }
    }
    return result;
  }

  static getMergeSkillDataWithOwners(otomoDataList: OtomoData[]): SkillDataEx[] {
    const mergedMap = new Map<number, SkillDataEx>();
    for (const otomoData of otomoDataList) {
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
    return Array.from(mergedMap.values()).sort((a, b) => a.Id - b.Id);
  }

  static getMergeSupportActionWithOwners(catOtomoData: OtomoData[]): SupportActionEx[] {
    const mergedMap = new Map<number, SupportActionEx>();
    for (const otomoData of catOtomoData) {
      if (otomoData.hasSupportInfo()) {
        const dataList = otomoData.SupportInfo.getSupportActionList();
        for (const data of dataList) {
          const existingSupportAction = mergedMap.get(data.Id);
          if (existingSupportAction == undefined) {
            mergedMap.set(data.Id, { ...data, OwnerNames: [otomoData.getName()] });
          } else {
            const ownerName = otomoData.getName();
            if (!existingSupportAction.OwnerNames.includes(ownerName)) {
              existingSupportAction.OwnerNames.push(ownerName);
            }
          }
        }
      }
    }
    return Array.from(mergedMap.values()).sort((a, b) => a.Id - b.Id);
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
    { key: "Id", label: "技能ID", display: (data) => imgui.text(data.Id.toString()) },
    {
      key: "ColorName",
      label: "技能颜色",
      display: (data) => imgui.text(OtSkillTable.OtSkillColorMap[data.IconColor] ?? data.IconColor.toString()),
    },
    { key: "Name", label: "技能名称", display: (data) => imgui.text(data.Name) },
    {
      key: "Explain",
      label: "技能描述",
      display: (data) => {
        let Explain: string = data.Explain;
        for (const [key, value] of OtSkillTable.OtSkillExplainSkillIconTagMap) {
          Explain = Explain.replace(key, value);
        }
        imgui.text(Explain);
      },
    },
    { key: "UnlockLv", label: "解锁等级", display: (data) => imgui.text(data.UnlockLv.toString()) },
    { key: "SlotNum", label: "槽位消耗", display: (data) => imgui.text(data.SlotNum.toString()) },
  ];

  static UI<T extends SkillData>(data: T[], config: TableConfig<T> = OtSkillTable.DefaultConfig) {
    imgui_extra.Components.table("技能表", data, config);
  }
}

class OtSupportTable {
  static DefaultConfig: TableConfig<SupportAction> = [
    { key: "Id", label: "动作Id", display: (data) => imgui.text(data.Id.toString()) },
    { key: "Name", label: "动作名称", display: (data) => imgui.text(data.Name) },
    { key: "Explain", label: "动作描述", display: (data) => imgui.text(data.Explain) },
    { key: "OpenLv", label: "解锁等级", display: (data) => imgui.text(data.OpenLv.toString()) },
  ];

  static UI<T extends SupportAction>(data: T[], config: TableConfig<T> = OtSupportTable.DefaultConfig) {
    imgui_extra.Components.table("支援动作表", data, config);
  }
}

export class BuddySkillEdit {
  static CurSelectSkill: SkillData | undefined = undefined;
  static CurSelectSupportType: OtSupportTypeId | undefined = undefined;
  static CurSelectSupportAction: SupportAction | undefined = undefined;
  static SupportTypeIdTableConfig: TableConfig<OtSupportTypeId> = [
    { key: "Id", label: "类型Id", display: (data) => imgui.text(data.toString()) },
    { key: "Name", label: "类型名称", display: (data) => imgui.text(OtSupportTypeIdTool.getName(data)) },
    { key: "Explain", label: "类型描述", display: (data) => imgui.text(OtSupportTypeIdTool.getExplain(data)) },
    {
      key: "select",
      label: "",
      display: (data, index) => {
        imgui.push_id(`选择${index}`);
        if (imgui.button("选择")) BuddySkillEdit.CurSelectSupportType = data;
        imgui.pop_id();
      },
    },
  ];
  static EmployedOtSkillListTableConfig: TableConfig<SkillDataEx> = [
    ...OtSkillTable.DefaultConfig,
    { key: "ownerName", label: "拥有者", display: (data) => imgui.text(data.OwnerNames.join(",")) },
    {
      key: "select",
      label: "",
      display: (data, index) => {
        imgui.push_id(`选择${index}`);
        if (imgui.button("选择")) BuddySkillEdit.CurSelectSkill = data;
        imgui.pop_id();
      },
    },
  ];
  static EmployedOtSupportListTableConfig: TableConfig<SupportActionEx> = [
    ...OtSupportTable.DefaultConfig,
    { key: "ownerName", label: "拥有者", display: (data) => imgui.text(data.OwnerNames.join(",")) },
    {
      key: "select",
      label: "",
      display: (data, index) => {
        imgui.push_id(`选择${index}`);
        if (imgui.button("选择")) BuddySkillEdit.CurSelectSupportAction = data;
        imgui.pop_id();
      },
    },
  ];
  private static OtVariationMap = {
    [OtVariation.OtAirou]: "猫",
    [OtVariation.OtDog]: "狗",
  };

  static ui() {
    imgui_extra.tree_node("伙伴技能修改", () => {
      if (Utils.isInVillage()) {
        const DataManager = sdk.get_managed_singleton("snow.data.DataManager");
        if (DataManager == undefined) {
          return;
        }

        if (this.CurSelectSkill != undefined) {
          imgui.text(
            `当前选择技能: ${this.CurSelectSkill.Name}(${this.OtVariationMap[this.CurSelectSkill.OtVariation]})`,
          );
          imgui.same_line();
          imgui.push_id("技能");
          if (imgui.button("取消选择")) this.CurSelectSkill = undefined;
          imgui.pop_id();
        } else imgui.text("没有选择技能");

        if (this.CurSelectSupportType != undefined) {
          imgui.text(`当前选择支援类型: ${OtSupportTypeIdTool.getName(this.CurSelectSupportType)}`);
          imgui.same_line();
          imgui.push_id("支援类型");
          if (imgui.button("取消选择")) this.CurSelectSupportType = undefined;
          imgui.pop_id();
        } else imgui.text("没有选择支援类型");

        if (this.CurSelectSupportAction != undefined) {
          imgui.text(
            `当前选择支援动作: ${this.CurSelectSupportAction.Name}(Lv: ${this.CurSelectSupportAction.OpenLv})`,
          );
          imgui.same_line();
          imgui.push_id("支援动作");
          if (imgui.button("取消选择")) this.CurSelectSupportAction = undefined;
          imgui.pop_id();
        } else imgui.text("没有选择支援动作");

        imgui_extra.tree_node("库", () => {
          for (const variation of otVariation) {
            imgui_extra.tree_node(this.OtVariationMap[variation], () => {
              const employedOtomoDataList = OtomoTools.getEmployedOtomoDataList(DataManager, variation);
              imgui_extra.tree_node("已有技能", () => {
                const skillDataList = OtomoTools.getMergeSkillDataWithOwners(employedOtomoDataList);
                OtSkillTable.UI(skillDataList, this.EmployedOtSkillListTableConfig);
              });
              if (variation == OtVariation.OtAirou) {
                imgui_extra.tree_node("支援类型", () => {
                  imgui_extra.Components.table("支援类型表", otSupportTypeId, this.SupportTypeIdTableConfig);
                });
                imgui_extra.tree_node("已有支援动作", () => {
                  const supportActionList = OtomoTools.getMergeSupportActionWithOwners(employedOtomoDataList);
                  OtSupportTable.UI(supportActionList, this.EmployedOtSupportListTableConfig);
                });
              }
            });
          }
        });

        const Otomos = DataManager.get_field<REManagedObject>("<AttendantOtomoDataList>k__BackingField");
        const Otomos_Count = Otomos.call<[], number>("get_Count");
        for (let i = 0; i < Otomos_Count; i++) {
          const Otomo = Otomos.call<[number], REManagedObject | undefined>("Get", i);
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
                    display: (_data, index) => {
                      if (
                        this.CurSelectSkill != undefined &&
                        otomoData.getVariation() == this.CurSelectSkill.OtVariation
                      ) {
                        if (!otomoData.AllSkill.ContainsId(this.CurSelectSkill.Id)) {
                          imgui.push_id(`覆盖${index}`);
                          if (imgui.button("覆盖")) {
                            otomoData.EnableSkill.RawData.call("Clear");
                            otomoData.AllSkill.RawData.call("set_Item", index, this.CurSelectSkill.Id);
                            this.CurSelectSkill = undefined;
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

              if (otomoData.hasSupportInfo()) {
                imgui_extra.tree_node("支援动作列表", () => {
                  const supportType = otomoData.SupportInfo.getSupportType();
                  imgui.text(`当前支援类型: ${OtSupportTypeIdTool.getName(supportType)}`);
                  if (this.CurSelectSupportType != undefined && this.CurSelectSupportType != supportType) {
                    imgui.same_line();
                    if (imgui.button("覆盖")) {
                      otomoData.SupportInfo.RawData.set_field("_SupportTypeId", this.CurSelectSupportType);
                      this.CurSelectSupportType = undefined;
                    }
                  }
                  const supportActionList = otomoData.SupportInfo.getSupportActionList();
                  const EquippedTableConfig: TableConfig<SupportAction> = [
                    ...OtSupportTable.DefaultConfig,
                    {
                      key: "cover",
                      label: "",
                      display: (_data, index) => {
                        if (this.CurSelectSupportAction != undefined) {
                          if (!otomoData.SupportInfo.ContainsId(this.CurSelectSupportAction.Id)) {
                            imgui.push_id(`覆盖${index}`);
                            if (imgui.button("覆盖")) {
                              otomoData.SupportInfo.RawData.get_field<REManagedObject>("_SupportActionIdList").call(
                                "Set",
                                index,
                                this.CurSelectSupportAction.Id,
                              );
                              this.CurSelectSupportAction = undefined;
                            }
                            imgui.pop_id();
                          } else {
                            imgui.text("已有该支援动作");
                          }
                        }
                      },
                    },
                  ];
                  OtSupportTable.UI(supportActionList, EquippedTableConfig);
                });
              }
            });
          }
        }
      } else {
        imgui.text("不支持在村以为的地方使用");
      }
    });
  }
}
