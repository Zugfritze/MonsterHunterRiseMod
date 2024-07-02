/** @noSelf **/
declare namespace json {
  function load_string(json_str: string): LuaTable | undefined;

  function dump_string(value: object, indent?: number): string;

  function load_file(filepath: string): LuaTable<string> | undefined;

  function dump_file(filepath: string, value: object, indent?: number): boolean;
}
