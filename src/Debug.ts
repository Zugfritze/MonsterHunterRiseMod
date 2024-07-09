import { imgui_extra } from "./Tools/imgui_extra";
import Components = imgui_extra.Components;
import TableConfig = imgui_extra.Components.TableConfig;

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

interface MonitoringData {
  key: string;
  data: string;
  time: number;
}

export class Debug {
  private static MonitoringDataList: MonitoringData[] = [];
  private static TypeDefinitions: Map<RETypeDefinition, TypeOptions> = new Map();
  private static MonitoringTableConfig: TableConfig<MonitoringData> = [
    { key: "key", label: "Key", display: (_index, data) => imgui.text(data.key) },
    { key: "data", label: "数据", display: (_index, data) => imgui.text(data.data) },
    { key: "time", label: "时间", display: (_index, data) => imgui.text(os.date("%X", data.time)) },
  ];
  private static FieldTableConfig: TableConfig<REField> = [
    {
      key: "field_name",
      label: "字段名",
      display: (_index, data) => imgui.text(data.get_name()),
    },
    {
      key: "field_type",
      label: "字段类型",
      display: (_index, data) => imgui.text(data.get_type().get_full_name()),
    },
  ];
  private static MethodTableConfig: TableConfig<REMethodDefinition> = [
    {
      key: "method_name",
      label: "方法名",
      display: (_index, data) => imgui.text(data.get_name()),
    },
    {
      key: "method_param_type_names",
      label: "方法参数",
      display: (_index, data) => {
        imgui.text(
          data
            .get_param_types()
            .map((param) => param.get_full_name())
            .join(", "),
        );
      },
    },
    {
      key: "method_return_type_name",
      label: "方法返回值",
      display: (_index, data) => imgui.text(data.get_return_type().get_full_name()),
    },
    {
      key: "method_notes",
      label: "备注",
      display: (_index, data) => {
        switch (data.get_name()) {
          case ".cctor":
            imgui.text("静态构造函数");
            break;
          case ".ctor":
            imgui.text("构造函数");
            break;
          default:
            imgui.text("");
        }
      },
    },
  ];

  static Monitoring(key: string, data: string) {
    const index = this.MonitoringDataList.findIndex((item) => item.key == key);
    if (index == -1) {
      this.MonitoringDataList.push({ key, data, time: os.time() });
    } else {
      this.MonitoringDataList[index] = { key, data, time: os.time() };
    }
  }

  static add_TypeDefinition(TypeDefinition: RETypeDefinition) {
    if (this.TypeDefinitions.has(TypeDefinition)) {
      return;
    }
    this.TypeDefinitions.set(TypeDefinition, new TypeOptions());
  }

  static ui() {
    imgui_extra.tree_node("调试", () => {
      imgui_extra.tree_node("监视", () => {
        imgui.text(`当前时间: ${os.date("%X")}`);
        Components.table("监视表", this.MonitoringDataList, this.MonitoringTableConfig);
      });
      imgui_extra.tree_node("类型定义", () => {
        for (const [TypeDefinition, TypeOptions] of this.TypeDefinitions) {
          imgui_extra.tree_node(TypeDefinition.get_full_name(), () => {
            const fields = TypeDefinition.get_fields();
            const field_category_options = TypeOptions.field;
            if (fields.length > 0) {
              imgui_extra.tree_node("字段", () => {
                const [staticFieldArray, instanceFieldArray] = this.partitionByStatic(fields);
                if (staticFieldArray.length > 0) {
                  imgui_extra.tree_node("静态", () => {
                    this.fieldTableUI(staticFieldArray, field_category_options.static);
                  });
                }
                if (instanceFieldArray.length > 0) {
                  imgui_extra.tree_node("非静态", () => {
                    this.fieldTableUI(instanceFieldArray, field_category_options.instance);
                  });
                }
              });
            }

            const methods = TypeDefinition.get_methods();
            const method_category_options = TypeOptions.method;
            if (methods.length > 0) {
              imgui_extra.tree_node("方法", () => {
                const [staticMethodArray, instanceMethodArray] = this.partitionByStatic(methods);

                if (staticMethodArray.length > 0) {
                  imgui_extra.tree_node("静态", () => {
                    this.methodTableUI(staticMethodArray, method_category_options.static);
                  });
                }
                if (instanceMethodArray.length > 0) {
                  imgui_extra.tree_node("非静态", () => {
                    this.methodTableUI(instanceMethodArray, method_category_options.instance);
                  });
                }
              });
            }
          });
        }
      });
    });
  }

  private static partitionByStatic<T extends { is_static(): boolean }>(param: T[]): [T[], T[]] {
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

  private static fieldTableUI(fieldList: REField[], field_Options: FieldOptions) {
    Components.searchAndCheckboxes("搜索", field_Options, [
      { key: "searchByName", label: "搜索字段名" },
      { key: "searchByType", label: "搜索字段类型", same_line: true },
    ]);
    const filterFieldList = fieldList.filter((field) => {
      const field_name = field.get_name();
      const field_type_names = field.get_type().get_full_name();
      return (
        field_Options.searchText == "" ||
        (field_Options.searchByName && field_name.includes(field_Options.searchText)) ||
        (field_Options.searchByType && field_type_names.includes(field_Options.searchText))
      );
    });
    Components.table("字段表", filterFieldList, this.FieldTableConfig);
  }

  private static methodTableUI(methodList: REMethodDefinition[], method_Options: MethodOptions) {
    Components.searchAndCheckboxes("搜索", method_Options, [
      { key: "searchByMethodName", label: "搜索方法名" },
      { key: "searchByParamTypes", label: "搜索方法参数", same_line: true },
      { key: "searchByReturnType", label: "搜索方法返回值", same_line: true },
    ]);
    const filterMethodList = methodList.filter((method) => {
      const method_name = method.get_name();
      const method_param_type_names = method
        .get_param_types()
        .map((param) => param.get_full_name())
        .join(", ");
      const method_return_type_name = method.get_return_type().get_full_name();
      return (
        method_Options.searchText === "" ||
        (method_Options.searchByMethodName && method_name.includes(method_Options.searchText)) ||
        (method_Options.searchByParamTypes && method_param_type_names.includes(method_Options.searchText)) ||
        (method_Options.searchByReturnType && method_return_type_name.includes(method_Options.searchText))
      );
    });
    Components.table("方法表", filterMethodList, this.MethodTableConfig);
  }
}
