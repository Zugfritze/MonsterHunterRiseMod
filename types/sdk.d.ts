/// <reference path="types.d.ts" />

/** @noSelf **/
declare namespace sdk {
  function get_managed_singleton(name: string): REManagedObject;

  function find_type_definition(name: string): RETypeDefinition;

  function hook(
    method_definition: REMethodDefinition,
    pre_func?: (this: void, ...args: any[]) => any,
    post_func?: (this: void, ...args: any[]) => any,
    ignore_jmp?: boolean,
  ): void;

  function to_int64(value: any): number;

  enum PreHookResult {
    CALL_ORIGINAL,
    SKIP_ORIGINAL,
  }
}
