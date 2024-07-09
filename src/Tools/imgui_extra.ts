import { KeysOfType } from "./Types";

export namespace imgui_extra {
  export function input_number(
    label: string,
    value: number,
    min_and_max?: [number, number],
    is_float: boolean = false,
    flags?: ImGuiInputTextFlags | number,
  ): [boolean, number] {
    const [changed, value_string] = imgui.input_text(label, value.toString(), flags);
    if (changed) {
      let value_number: number | undefined;
      if (is_float) {
        value_number = parseFloat(value_string);
      } else {
        value_number = parseInt(value_string, 10);
      }
      if (value_number != undefined) {
        if (min_and_max != undefined) {
          const [min, max] = min_and_max;
          value_number = Math.max(min, Math.min(max, value_number));
        }
        return [changed, value_number];
      }
    }
    return [false, value];
  }

  export function tree_node(label: string, nodeBody: () => void) {
    if (imgui.tree_node(label)) {
      nodeBody();
      imgui.tree_pop();
    }
  }

  export enum ImGuiInputTextFlags {
    None = 0,
    CharsDecimal = 1 << 0,
    CharsHexadecimal = 1 << 1,
    CharsUppercase = 1 << 2,
    CharsNoBlank = 1 << 3,
    AutoSelectAll = 1 << 4,
    EnterReturnsTrue = 1 << 5,
    CallbackCompletion = 1 << 6,
    CallbackHistory = 1 << 7,
    CallbackAlways = 1 << 8,
    CallbackCharFilter = 1 << 9,
    AllowTabInput = 1 << 10,
    CtrlEnterForNewLine = 1 << 11,
    NoHorizontalScroll = 1 << 12,
    AlwaysOverwrite = 1 << 13,
    ReadOnly = 1 << 14,
    Password = 1 << 15,
    NoUndoRedo = 1 << 16,
    CharsScientific = 1 << 17,
    CallbackResize = 1 << 18,
    CallbackEdit = 1 << 19,
    EscapeClearsAll = 1 << 20,
  }

  export enum ImGuiWindowFlags {
    None = 0,
    NoTitleBar = 1 << 0,
    NoResize = 1 << 1,
    NoMove = 1 << 2,
    NoScrollbar = 1 << 3,
    NoScrollWithMouse = 1 << 4,
    NoCollapse = 1 << 5,
    AlwaysAutoResize = 1 << 6,
    NoBackground = 1 << 7,
    NoSavedSettings = 1 << 8,
    NoMouseInputs = 1 << 9,
    MenuBar = 1 << 10,
    HorizontalScrollbar = 1 << 11,
    NoFocusOnAppearing = 1 << 12,
    NoBringToFrontOnFocus = 1 << 13,
    AlwaysVerticalScrollbar = 1 << 14,
    AlwaysHorizontalScrollbar = 1 << 15,
    AlwaysUseWindowPadding = 1 << 16,
    NoNavInputs = 1 << 18,
    NoNavFocus = 1 << 19,
    UnsavedDocument = 1 << 20,
    NoNav = NoNavInputs | NoNavFocus,
    NoDecoration = NoTitleBar | NoResize | NoScrollbar | NoCollapse,
    NoInputs = NoMouseInputs | NoNavInputs | NoNavFocus,

    // [Internal]
    NavFlattened = 1 << 23,
    ChildWindow = 1 << 24,
    Tooltip = 1 << 25,
    Popup = 1 << 26,
    Modal = 1 << 27,
    ChildMenu = 1 << 28,
  }

  export enum ImGuiTableFlags {
    None = 0,
    Resizable = 1 << 0,
    Reorderable = 1 << 1,
    Hideable = 1 << 2,
    Sortable = 1 << 3,
    NoSavedSettings = 1 << 4,
    ContextMenuInBody = 1 << 5,

    RowBg = 1 << 6,
    BordersInnerH = 1 << 7,
    BordersOuterH = 1 << 8,
    BordersInnerV = 1 << 9,
    BordersOuterV = 1 << 10,
    BordersH = BordersInnerH | BordersOuterH,
    BordersV = BordersInnerV | BordersOuterV,
    BordersInner = BordersInnerV | BordersInnerH,
    BordersOuter = BordersOuterV | BordersOuterH,
    Borders = BordersInnerV | BordersInnerH | BordersOuterV | BordersOuterH,
    NoBordersInBody = 1 << 11,
    NoBordersInBodyUntilResize = 1 << 12,

    SizingFixedFit = 1 << 13,
    SizingFixedSame = 2 << 13,
    SizingStretchProp = 3 << 13,
    SizingStretchSame = 4 << 13,

    NoHostExtendX = 1 << 16,
    NoHostExtendY = 1 << 17,
    NoKeepColumnsVisible = 1 << 18,
    PreciseWidths = 1 << 19,

    NoClip = 1 << 20,

    PadOuterX = 1 << 21,
    NoPadOuterX = 1 << 22,
    NoPadInnerX = 1 << 23,

    ScrollX = 1 << 24,
    ScrollY = 1 << 25,

    SortMulti = 1 << 26,
    SortTristate = 1 << 27,

    // Internal
    SizingMask_ = SizingFixedFit | SizingFixedSame | SizingStretchProp | SizingStretchSame,
  }

  export namespace Components {
    export function searchAndCheckboxes<T extends { searchText: string }>(
      searchLabel: string,
      options: T,
      checkboxOptions: {
        key: Extract<keyof T, KeysOfType<T, boolean>>;
        label: string;
        same_line?: boolean;
      }[],
    ) {
      options.searchText = imgui.input_text(searchLabel, options.searchText)[1];
      for (const { key, label, same_line } of checkboxOptions) {
        if (same_line != undefined && same_line) {
          imgui.same_line();
        }
        options[key] = imgui.checkbox(label, options[key] as boolean)[1] as T[typeof key];
      }
    }

    export type TableConfig<T> = { key: string; label: string; display: (data: T, index: number) => void }[];

    export function table<T>(tableId: string, data: T[], config: TableConfig<T>) {
      if (imgui.begin_table(tableId, config.length, ImGuiTableFlags.Borders)) {
        for (const configItem of config) {
          imgui.table_setup_column(configItem.label);
        }
        imgui.table_headers_row();

        for (let index = 0; index < data.length; index++) {
          const dataItem = data[index];
          imgui.table_next_row();

          for (let i = 0; i < config.length; i++) {
            const configItem = config[i];
            imgui.table_set_column_index(i);
            configItem.display(dataItem, index);
          }
        }
        imgui.end_table();
      }
    }
  }
}
