/** @noSelf **/
declare namespace fs {
  function glob(filter: string): LuaTable;

  function read(filename: string): string;

  function write(filename: string, data: string): void;
}
