declare class RETypeDefinition {
  get_full_name(): string;

  get_name(): string;

  get_namespace(): string;

  get_method(name: string): REMethodDefinition;

  get_methods(): REMethodDefinition[];

  get_field(name: string): REField;

  get_fields(): REField[];
}

declare class REField {
  get_name(): string;

  get_type(): RETypeDefinition;

  is_static(): boolean;
}

declare class REMethodDefinition {
  get_name(): string;

  get_return_type(): RETypeDefinition;

  get_function(): (...args: any[]) => any;

  get_declaring_type(): RETypeDefinition;

  get_num_params(): number;

  get_param_types(): RETypeDefinition[];

  get_param_names(): string[];

  is_static(): boolean;

  call(obj: any, ...args: any[]): any;
}

declare class REManagedObject {
  call(method_name: string, ...args: any[]): any;

  get_type_definition(): RETypeDefinition;

  get_field(name: string): any;

  set_field(name: string, value: any): void;

  get_address(): number;

  get_reference_count(): number;

  add_ref(): void;

  add_ref_permanent(): void;

  release(): void;

  force_release(): void;

  read_byte(offset: number): number;

  read_short(offset: number): number;

  read_dword(offset: number): number;

  read_qword(offset: number): number;

  read_float(offset: number): number;

  read_double(offset: number): number;

  write_byte(offset: number, value: number): void;

  write_short(offset: number, value: number): void;

  write_dword(offset: number, value: number): void;

  write_qword(offset: number, value: number): void;

  write_float(offset: number, value: number): void;

  write_double(offset: number, value: number): void;
}
