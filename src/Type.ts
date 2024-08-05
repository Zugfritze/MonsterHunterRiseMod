export const t_DataShortcut = sdk.find_type_definition("snow.data.DataShortcut");

export namespace SkillInfo {
  const m_getName = t_DataShortcut.get_method("getName(snow.data.DataDef.PlEquipSkillId)");
  const m_getExplain = t_DataShortcut.get_method("getExplain(snow.data.DataDef.PlEquipSkillId)");
  const m_getMaxLv = t_DataShortcut.get_method("getMaxLv(snow.data.DataDef.PlEquipSkillId)");

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

export class SkillData {
  readonly Id: number;
  readonly Lv: number;

  constructor(Id: number, Lv: number) {
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
