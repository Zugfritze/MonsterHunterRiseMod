import { imgui_extra } from "./Tools/imgui_extra";
import ImGuiTableFlags = imgui_extra.ImGuiTableFlags;
import Components = imgui_extra.Components;

class FieldOptions {
  searchText: string = "";
  searchByName: boolean = true;
  searchByType: boolean = true;
}

class FieldCategoryOptions {
  static: FieldOptions = new FieldOptions();
  instance: FieldOptions = new FieldOptions();
}

class MethodOptions {
  searchText: string = "";
  searchByMethodName: boolean = true;
  searchByParamTypes: boolean = true;
  searchByReturnType: boolean = true;
}

class MethodCategoryOptions {
  static: MethodOptions = new MethodOptions();
  instance: MethodOptions = new MethodOptions();
}

class TypeOptions {
  field: FieldCategoryOptions = new FieldCategoryOptions();
  method: MethodCategoryOptions = new MethodCategoryOptions();
}

export class Debug {
  private static TypeDefinitions: Map<RETypeDefinition, TypeOptions> =
    new Map();

  static add_TypeDefinition(TypeDefinition: RETypeDefinition) {
    if (this.TypeDefinitions.has(TypeDefinition)) {
      return;
    }
    this.TypeDefinitions.set(TypeDefinition, new TypeOptions());
  }

  static ui() {
    if (imgui.tree_node("调试")) {
      for (const [TypeDefinition, TypeOptions] of this.TypeDefinitions) {
        if (imgui.tree_node(TypeDefinition.get_full_name())) {
          const fields = TypeDefinition.get_fields();
          const field_category_options = TypeOptions.field;
          if (fields.length > 0 && imgui.tree_node("字段")) {
            const [staticFieldArray, instanceFieldArray] =
              this.partitionByStatic(fields);
            if (staticFieldArray.length > 0 && imgui.tree_node("静态")) {
              this.fieldTableUI(
                staticFieldArray,
                field_category_options.static,
              );
              imgui.tree_pop();
            }
            if (instanceFieldArray.length > 0 && imgui.tree_node("非静态")) {
              this.fieldTableUI(
                instanceFieldArray,
                field_category_options.instance,
              );
              imgui.tree_pop();
            }
            imgui.tree_pop();
          }

          const methods = TypeDefinition.get_methods();
          const method_category_options = TypeOptions.method;
          if (methods.length > 0 && imgui.tree_node("方法")) {
            const [staticMethodArray, instanceMethodArray] =
              this.partitionByStatic(methods);
            if (staticMethodArray.length > 0 && imgui.tree_node("静态")) {
              this.methodTableUI(
                staticMethodArray,
                method_category_options.static,
              );
              imgui.tree_pop();
            }
            if (instanceMethodArray.length > 0 && imgui.tree_node("非静态")) {
              this.methodTableUI(
                instanceMethodArray,
                method_category_options.instance,
              );
              imgui.tree_pop();
            }
            imgui.tree_pop();
          }
          imgui.tree_pop();
        }
      }
      imgui.tree_pop();
    }
  }

  private static partitionByStatic<T extends { is_static(): boolean }>(
    param: T[],
  ): [T[], T[]] {
    const staticArray: T[] = [];
    const instanceArray: T[] = [];
    for (const method of param) {
      if (method.is_static()) {
        staticArray.push(method);
      } else {
        instanceArray.push(method);
      }
    }
    return [staticArray, instanceArray];
  }

  private static fieldTableUI(
    fieldList: REField[],
    field_Options: FieldOptions,
  ) {
    Components.searchAndCheckboxes("搜索", field_Options, [
      { key: "searchByName", label: "搜索字段名" },
      { key: "searchByType", label: "搜索字段类型", same_line: true },
    ]);

    if (imgui.begin_table("字段表", 2, ImGuiTableFlags.Borders)) {
      imgui.table_setup_column("字段名");
      imgui.table_setup_column("字段类型");

      imgui.table_headers_row();

      for (const field of fieldList) {
        const field_name = field.get_name();
        const field_type_names = field.get_type().get_full_name();

        if (
          field_Options.searchText == "" ||
          (field_Options.searchByName &&
            field_name.includes(field_Options.searchText)) ||
          (field_Options.searchByType &&
            field_type_names.includes(field_Options.searchText))
        ) {
          imgui.table_next_row();
          imgui.table_set_column_index(0);
          imgui.text(field_name);
          imgui.table_set_column_index(1);
          imgui.text(field_type_names);
        }
      }
      imgui.end_table();
    }
  }

  private static methodTableUI(
    methodList: REMethodDefinition[],
    method_Options: MethodOptions,
  ) {
    Components.searchAndCheckboxes("搜索", method_Options, [
      { key: "searchByMethodName", label: "搜索方法名" },
      { key: "searchByParamTypes", label: "搜索方法参数", same_line: true },
      { key: "searchByReturnType", label: "搜索方法返回值", same_line: true },
    ]);

    if (imgui.begin_table("方法表", 3, ImGuiTableFlags.Borders)) {
      imgui.table_setup_column("方法名");
      imgui.table_setup_column("方法参数");
      imgui.table_setup_column("方法返回值");

      imgui.table_headers_row();

      for (const method of methodList) {
        const method_name = method.get_name();
        const method_param_type_names = method
          .get_param_types()
          .map((param) => param.get_full_name())
          .join(", ");
        const method_return_type_name = method
          .get_return_type()
          .get_full_name();

        if (
          method_Options.searchText === "" ||
          (method_Options.searchByMethodName &&
            method_name.includes(method_Options.searchText)) ||
          (method_Options.searchByParamTypes &&
            method_param_type_names.includes(method_Options.searchText)) ||
          (method_Options.searchByReturnType &&
            method_return_type_name.includes(method_Options.searchText))
        ) {
          imgui.table_next_row();
          imgui.table_set_column_index(0);
          imgui.text(method_name);
          imgui.table_set_column_index(1);
          imgui.text(method_param_type_names);
          imgui.table_set_column_index(2);
          imgui.text(method_return_type_name);
        }
      }
      imgui.end_table();
    }
  }
}
