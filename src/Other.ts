import { Utils } from "./Utils";
import { ConfigManager } from "./ConfigManager";
import { imgui_extra } from "./Tools/imgui_extra";
import { Debug } from "./Debug";
import { KeysOfType } from "./Tools/Types";

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

class OtherConfig {
  autoSaveInterval: number = 0;
  ignoresDecorationsSlotLv: boolean = false;
  allDecorationRequiresSlotLvBecomeLv1: boolean = false;
  allDecorationSkillLvMax: boolean = false;
  allArmorDecoSlotsBecome3PcsLv4: boolean = false;
}

const t_data_shortcut = sdk.find_type_definition("snow.data.DataShortcut");
Debug.add_TypeDefinition(t_data_shortcut);
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
const getMaxLv = t_data_shortcut.get_method("getMaxLv(snow.data.DataDef.PlEquipSkillId)");

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
          const SkillIdList = Param.get_field<REManagedObject>("_SkillIdList");
          const SkillIdList_Count = SkillIdList.call<[], number>("get_Count");
          const SkillLvList = Param.get_field<REManagedObject>("_SkillLvList");
          for (let i = 0; i < SkillIdList_Count; i++) {
            const SkillId = SkillIdList.call<[number], number>("Get", i);
            if (SkillId != 0) {
              SkillLvList.call("Set", i, getMaxLv.call<null, [number], number>(null, SkillId));
            }
          }
        }
        return sdk.PreHookResult.CALL_ORIGINAL;
      },
    );

    Utils.hookMethod("snow.data.ArmorBaseData", ".ctor(snow.data.ArmorBaseUserData.Param)", (args) => {
      if (this.config.get("allArmorDecoSlotsBecome3PcsLv4")) {
        const Param = sdk.to_managed_object(args[3]);
        const DecorationsNumList = Param.get_field<REManagedObject>("_DecorationsNumList");
        for (const slotLvType of decorationsSlotLvTypes) {
          const index = slotLvType - 1;
          if (slotLvType != DecorationsSlotLvTypes.Lv4) {
            DecorationsNumList.call("Set", index, 0);
          } else {
            DecorationsNumList.call("Set", index, 3);
          }
        }
      }
    });
  }
}
