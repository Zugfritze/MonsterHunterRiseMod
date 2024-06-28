/** @noSelf **/
declare namespace json {
  function load_file(filepath: string): LuaTable;

  function dump_file(filepath: string, value: object, indent?: number): boolean;
}
