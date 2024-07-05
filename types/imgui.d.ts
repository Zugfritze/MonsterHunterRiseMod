declare type FontIndex = number;

/** @noSelf **/
declare namespace imgui {
  function begin_window(name: string, open?: boolean, flags?: number): boolean;

  function end_window(): void;

  function begin_group(): void;

  function end_group(): void;

  function button(label: string, size?: number): boolean;

  function text(text: string): void;

  function checkbox(label: string, value: boolean): LuaMultiReturn<[boolean, boolean]>;

  function input_text(label: string, value: string, flags?: number): LuaMultiReturn<[boolean, string, number, number]>;

  function tree_node(label: string): boolean;

  function tree_pop(): void;

  function same_line(): void;

  function separator(): void;

  function load_font(filepath: string, size: number, ranges: [number, number, number]): FontIndex;

  function push_font(font: FontIndex): void;

  function pop_font(): void;

  function push_id(id: string | number): void;

  function pop_id(): void;

  // TableApi
  function begin_table(
    str_id: string,
    column: number,
    flags?: number,
    outer_size?: [number, number],
    inner_width?: number,
  ): boolean;

  function end_table(): void;

  function table_next_row(row_flags?: number, min_row_height?: number): void;

  function table_next_column(): boolean;

  function table_set_column_index(column_index: number): boolean;

  function table_setup_column(label: string, flags?: number, init_width_or_weight?: number, user_id?: number): void;

  function table_setup_scroll_freeze(cols: number, rows: number): void;

  function table_headers_row(): void;

  function table_header(label: string): void;

  function table_get_sort_specs(): any;

  function table_get_column_count(): number;

  function table_get_column_index(): number;

  function table_get_row_index(): number;

  function table_get_column_name(column: number): string;

  function table_get_column_flags(column: number): number;

  function table_set_bg_color(target: any, color: any, column: number): void;
}
