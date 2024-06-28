declare type FontIndex = number;

/** @noSelf **/
declare namespace imgui {
  function begin_window(name: string, open?: boolean, flags?: number): boolean;

  function end_window(): void;

  function button(label: string, size?: number): boolean;

  function text(text: string): void;

  function checkbox(
    label: string,
    value: boolean,
  ): LuaMultiReturn<[boolean, boolean]>;

  function input_text(
    label: string,
    value: string,
    flags?: number,
  ): LuaMultiReturn<[boolean, string, number, number]>;

  function tree_node(label: string): boolean;

  function tree_pop(): void;

  function same_line(): void;

  function load_font(
    filepath: string,
    size: number,
    ranges: [number, number, number],
  ): FontIndex;

  function push_font(font: FontIndex): void;

  function pop_font(): void;

  function push_id(id: string | number): void;

  function pop_id(): void;
}
