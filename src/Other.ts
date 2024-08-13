import { REArray, Utils } from "./Utils";
import { ConfigManager } from "./ConfigManager";
import { imgui_extra } from "./Tools/imgui_extra";
import { Debug } from "./Debug";
import { KeysOfType } from "./Tools/Types";
import { t_DataShortcut } from "./Type";

enum DecorationEquipStatusTypes {
  OK = 0,
  LackLv = 1,
  OtherEquipmentUsing = 2,
  SameSlotUsing = 3,
  OtherSlotUsing = 4,
  NoSlot = 5,
  OtherType = 6,
  OtherWeapon = 7,
  Error = 8,
}

enum DecorationsSlotLvTypes {
  Lv1 = 1,
  Lv2 = 2,
  Lv3 = 3,
  Lv4 = 4,
}

const decorationsSlotLvTypes = [
  DecorationsSlotLvTypes.Lv1,
  DecorationsSlotLvTypes.Lv2,
  DecorationsSlotLvTypes.Lv3,
  DecorationsSlotLvTypes.Lv4,
];

enum HyakuryuDecorationsSlotLvTypes {
  Lv1 = 1,
  Lv2 = 2,
  Lv3 = 3,
}

const hyakuryuDecorationsSlotLvTypes = [
  HyakuryuDecorationsSlotLvTypes.Lv1,
  HyakuryuDecorationsSlotLvTypes.Lv2,
  HyakuryuDecorationsSlotLvTypes.Lv3,
];

// snow.data.weapon.WeaponTypes
enum WeaponTypes {
  GreatSword = 0,
  Hammer = 1,
  Lance = 2,
  ShortSword = 3,
  LightBowgun = 4,
  HeavyBowgun = 5,
  DualBlades = 6,
  LongSword = 7,
  Horn = 8,
  GunLance = 9,
  Bow = 10,
  SlashAxe = 11,
  ChargeAxe = 12,
  InsectGlaive = 13,
  Insect = 14,
}

const weaponTypes = [
  WeaponTypes.GreatSword,
  WeaponTypes.Hammer,
  WeaponTypes.Lance,
  WeaponTypes.ShortSword,
  WeaponTypes.LightBowgun,
  WeaponTypes.HeavyBowgun,
  WeaponTypes.DualBlades,
  WeaponTypes.LongSword,
  WeaponTypes.Horn,
  WeaponTypes.GunLance,
  WeaponTypes.Bow,
  WeaponTypes.SlashAxe,
  WeaponTypes.ChargeAxe,
  WeaponTypes.InsectGlaive,
  WeaponTypes.Insect,
];

class OtherConfig {
  autoSaveInterval: number = 0;
  ignoresDecorationsSlotLv: boolean = false;
  allDecorationRequiresSlotLvBecomeLv1: boolean = false;
  allDecorationSkillLvMax: boolean = false;
  allArmorDecoSlotsBecome3PcsLv4: boolean = false;
  allArmorSkillLvMax: boolean = false;
  allWeaponDecoSlotsBecome3PcsLv4: boolean = false;
  allWeaponHyakuryuDecoSlotLv3: boolean = false;
  specialSkewerDangoLvAllLv4: boolean = false;
  allDango100: boolean = false;
}

Debug.add_TypeDefinition(t_DataShortcut);
Debug.add_TypeDefinition(sdk.find_type_definition("snow.gui.fsm.deco.GuiDecoChange"));
Debug.add_TypeDefinition(sdk.find_type_definition("snow.data.DecorationsInventoryData"));
Debug.add_TypeDefinition(sdk.find_type_definition("snow.data.DecorationsData"));
Debug.add_TypeDefinition(sdk.find_type_definition("snow.data.DecorationBaseData"));
Debug.add_TypeDefinition(sdk.find_type_definition("snow.data.DecorationsBaseUserData"));
Debug.add_TypeDefinition(sdk.find_type_definition("snow.data.DecorationsBaseUserData.Param"));
Debug.add_TypeDefinition(sdk.find_type_definition("snow.data.DecorationsBaseUserData.ParamBase"));
Debug.add_TypeDefinition(sdk.find_type_definition("snow.data.EquipmentInventoryData"));
Debug.add_TypeDefinition(sdk.find_type_definition("snow.data.EquipData"));
Debug.add_TypeDefinition(sdk.find_type_definition("snow.data.ArmorData"));
Debug.add_TypeDefinition(sdk.find_type_definition("snow.data.ArmorBaseData"));
Debug.add_TypeDefinition(sdk.find_type_definition("snow.data.ArmorBaseUserData.Param"));
Debug.add_TypeDefinition(sdk.find_type_definition("snow.data.CloseRangeWeaponBaseData"));
Debug.add_TypeDefinition(sdk.find_type_definition("snow.data.BowWeaponBaseData"));
Debug.add_TypeDefinition(sdk.find_type_definition("snow.data.BulletWeaponBaseData"));
Debug.add_TypeDefinition(sdk.find_type_definition("snow.equip.MainWeaponBaseData"));
Debug.add_TypeDefinition(sdk.find_type_definition("snow.player.PlayerSkillList"));
Debug.add_TypeDefinition(
  sdk.find_type_definition("System.Collections.Generic.List`1<snow.data.equip.param.DecorationsSlotData>"),
);
const getMaxLv = t_DataShortcut.get_method("getMaxLv(snow.data.DataDef.PlEquipSkillId)");

export class Other {
  static lastSaveAt = 0;
  private static config = new ConfigManager("BPQSMHRMod/other.json", new OtherConfig());
  private static uiCheckboxConfigItems: {
    label: string;
    key: KeysOfType<OtherConfig, boolean>;
  }[] = [
    { label: "忽略装饰品槽位等级限制", key: "ignoresDecorationsSlotLv" },
    { label: "所有装饰品的槽位等级需求变为1级(需重启)", key: "allDecorationRequiresSlotLvBecomeLv1" },
    { label: "所有装饰品的技能等级变成最大值(需重启)", key: "allDecorationSkillLvMax" },
    { label: "所有防具的装饰品槽位变成3个4级槽位(需重启)", key: "allArmorDecoSlotsBecome3PcsLv4" },
    { label: "所有防具的技能等级变成最大值(需重启)", key: "allArmorSkillLvMax" },
    { label: "所有武器的装饰品槽位变成3个4级槽位(需重启)", key: "allWeaponDecoSlotsBecome3PcsLv4" },
    { label: "所有武器的百龙装饰品槽位变成3级(需重启)", key: "allWeaponHyakuryuDecoSlotLv3" },
    { label: "使用曙光新签时团子技能全部变成4级(需重启)", key: "specialSkewerDangoLvAllLv4" },
    { label: "所有团子技能概率100%", key: "allDango100" },
  ];

  static ui() {
    imgui_extra.tree_node("其他", () => {
      const [aSI_Changed, aSI_Value] = imgui_extra.input_number("自动保存间隔", this.config.get("autoSaveInterval"));
      if (aSI_Changed) {
        this.config.set("autoSaveInterval", aSI_Value);
      }
      for (const uiCheckboxConfigItem of this.uiCheckboxConfigItems) {
        const [changed, value] = imgui.checkbox(uiCheckboxConfigItem.label, this.config.get(uiCheckboxConfigItem.key));
        if (changed) {
          this.config.set(uiCheckboxConfigItem.key, value);
        }
      }
    });
  }

  static init_hook() {
    Utils.hookMethod("snow.data.EquipmentInventoryData", "updateCheatBitFlag", () => {
      return sdk.PreHookResult.SKIP_ORIGINAL;
    });
    Utils.hookMethod("snow.SnowSaveService", "saveCharaData", () => {
      this.lastSaveAt = os.time();
    });
    Utils.hookMethod("snow.SnowSaveService", "requestAutoSaveAll", () => {
      if (os.difftime(os.time(), this.lastSaveAt) < this.config.get("autoSaveInterval")) {
        return sdk.PreHookResult.SKIP_ORIGINAL;
      }
    });
    const checkEquipStatusPostFunction = (retval: any): any => {
      if (this.config.get("ignoresDecorationsSlotLv")) {
        const retval_Int = sdk.to_int64(retval);
        if (retval_Int == DecorationEquipStatusTypes.LackLv) {
          return sdk.to_ptr(DecorationEquipStatusTypes.OK);
        }
      }
      return retval;
    };
    Utils.hookMethod(
      "snow.data.EquipmentInventoryData",
      "checkEquipStatus(System.Int32, snow.data.DecorationsInventoryData)",
      undefined,
      checkEquipStatusPostFunction,
    );
    Utils.hookMethod(
      "snow.data.EquipmentInventoryData",
      "checkEquipStatus(System.Int32, snow.equip.DecorationsId)",
      undefined,
      checkEquipStatusPostFunction,
    );
    Utils.hookMethod(
      "snow.data.DecorationBaseData",
      "initSkillData(snow.data.DecorationsBaseUserData.Param)",
      (args) => {
        const Param = sdk.to_managed_object(args[3]);
        if (this.config.get("allDecorationRequiresSlotLvBecomeLv1")) {
          Param.set_field("_DecorationLv", DecorationsSlotLvTypes.Lv1);
        }
        if (this.config.get("allDecorationSkillLvMax")) {
          const SkillIdList = new REArray<number>(Param.get_field<REManagedObject>("_SkillIdList"));
          const SkillIdListCapacity = SkillIdList.getCapacity();
          const SkillLvList = new REArray<number>(Param.get_field<REManagedObject>("_SkillLvList"));
          for (let i = 0; i < SkillIdListCapacity; i++) {
            const SkillId = SkillIdList.get(i);
            if (SkillId != 0) {
              SkillLvList.set(i, getMaxLv.call<null, [number], number>(null, SkillId));
            }
          }
        }
        return sdk.PreHookResult.CALL_ORIGINAL;
      },
    );

    Utils.hookMethod("snow.data.ArmorBaseData", ".ctor(snow.data.ArmorBaseUserData.Param)", (args) => {
      const Param = sdk.to_managed_object(args[3]);

      if (this.config.get("allArmorDecoSlotsBecome3PcsLv4")) {
        const DecorationsNumList = new REArray<number>(Param.get_field<REManagedObject>("_DecorationsNumList"));
        for (const slotLvType of decorationsSlotLvTypes) {
          const index = slotLvType - 1;
          if (slotLvType != DecorationsSlotLvTypes.Lv4) {
            DecorationsNumList.set(index, 0);
          } else {
            DecorationsNumList.set(index, 3);
          }
        }
      }

      if (this.config.get("allArmorSkillLvMax")) {
        const SkillIdList = new REArray<number>(Param.get_field<REManagedObject>("_SkillList"));
        const SkillIdListCapacity = SkillIdList.getCapacity();
        const SkillLvList = new REArray<number>(Param.get_field<REManagedObject>("_SkillLvList"));
        for (let i = 0; i < SkillIdListCapacity; i++) {
          const SkillId = SkillIdList.get(i);
          if (SkillId != 0) {
            SkillLvList.set(i, getMaxLv.call<null, [number], number>(null, SkillId));
          }
        }
      }
    });

    if (this.config.get("specialSkewerDangoLvAllLv4")) {
      const types = [
        sdk.find_type_definition("snow.facility.kitchen.MealFunc"),
        sdk.find_type_definition("snow.gui.fsm.kitchen.GuiKitchen"),
      ];
      for (const type of types) {
        const SpecialSkewerDangoLvField = type.get_field("SpecialSkewerDangoLv");
        const SpecialSkewerDangoLv = new REArray<number>(SpecialSkewerDangoLvField.get_data(null));
        for (let i = 0; i < 3; i++) {
          SpecialSkewerDangoLv.set(i, 4);
        }
      }
    }

    Utils.hookMethod("snow.data.DangoData", "get_SkillActiveRate", undefined, (retval) => {
      if (this.config.get("allDango100")) {
        return sdk.to_ptr(200);
      }
      return retval;
    });

    let thisObj: REManagedObject | undefined;
    Utils.hookMethod(
      "snow.equip.WeaponIdModule",
      "initialize",
      (args) => {
        thisObj = sdk.to_managed_object(args[2]);
      },
      () => {
        if (thisObj != undefined) {
          const WeaponType = thisObj.get_field<WeaponTypes>("_WeaponType");
          if (WeaponType != WeaponTypes.Insect) {
            const BaseDataList = new REArray<REManagedObject | undefined>(
              thisObj.get_field<REManagedObject>("<BaseDataList>k__BackingField"),
            );
            const BaseDataListCapacity = BaseDataList.getCapacity();
            for (let i = 0; i < BaseDataListCapacity; i++) {
              const BaseData = BaseDataList.get(i);
              if (BaseData != undefined) {
                if (this.config.get("allWeaponDecoSlotsBecome3PcsLv4")) {
                  const SlotNumList = new REArray<number>(BaseData.get_field<REManagedObject>("_SlotNumList"));
                  for (const slotLvType of decorationsSlotLvTypes) {
                    const index = slotLvType - 1;
                    if (slotLvType != DecorationsSlotLvTypes.Lv4) {
                      SlotNumList.set(index, 0);
                    } else {
                      SlotNumList.set(index, 3);
                    }
                  }
                }

                if (this.config.get("allWeaponHyakuryuDecoSlotLv3")) {
                  const HyakuryuSlotNumList = new REArray<number>(
                    BaseData.get_field<REManagedObject>("_HyakuryuSlotNumList"),
                  );
                  let shouldModify = false;
                  for (const slotLvType of hyakuryuDecorationsSlotLvTypes) {
                    const index = slotLvType - 1;
                    if (HyakuryuSlotNumList.get(index) > 0) shouldModify = true;
                  }
                  if (shouldModify) {
                    for (const slotLvType of hyakuryuDecorationsSlotLvTypes) {
                      const index = slotLvType - 1;
                      if (slotLvType != HyakuryuDecorationsSlotLvTypes.Lv3) {
                        HyakuryuSlotNumList.set(index, 0);
                      } else {
                        HyakuryuSlotNumList.set(index, 1);
                      }
                    }
                  }
                }
              }
            }
          }
          thisObj = undefined;
        }
      },
    );
  }
}
