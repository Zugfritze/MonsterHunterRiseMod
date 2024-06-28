export class Debug {
  private static TypeDefinitions: Array<RETypeDefinition> = [];

  static add_TypeDefinition(TypeDefinition: RETypeDefinition) {
    if (this.TypeDefinitions.includes(TypeDefinition)) {
      return;
    }
    this.TypeDefinitions.push(TypeDefinition);
  }

  static ui() {
    if (imgui.tree_node("调试")) {
      for (let i = 0; i < this.TypeDefinitions.length; i++) {
        const TypeDefinition = this.TypeDefinitions[i];
        if (imgui.tree_node(i + "|" + TypeDefinition.get_full_name())) {
          if (imgui.tree_node("字段")) {
            const fields = TypeDefinition.get_fields();
            const staticFields: Array<REField> = [];
            const noStaticFields: Array<REField> = [];
            for (const field of fields) {
              if (field.is_static()) {
                staticFields.push(field);
              } else {
                noStaticFields.push(field);
              }
            }
            if (staticFields.length > 0 && imgui.tree_node("静态")) {
              for (const field of staticFields) {
                imgui.text(field.get_name());
              }
              imgui.tree_pop();
            }
            if (noStaticFields.length > 0 && imgui.tree_node("非静态")) {
              for (const field of noStaticFields) {
                imgui.text(field.get_name());
              }
              imgui.tree_pop();
            }
            imgui.tree_pop();
          }

          if (imgui.tree_node("方法")) {
            const methods = TypeDefinition.get_methods();
            const staticMethods: Array<REMethodDefinition> = [];
            const noStaticMethods: Array<REMethodDefinition> = [];
            for (const method of methods) {
              if (method.is_static()) {
                staticMethods.push(method);
              } else {
                noStaticMethods.push(method);
              }
            }
            if (staticMethods.length > 0 && imgui.tree_node("静态")) {
              for (const method of staticMethods) {
                imgui.text(method.get_name());
              }
              imgui.tree_pop();
            }
            if (noStaticMethods.length > 0 && imgui.tree_node("非静态")) {
              for (const method of noStaticMethods) {
                imgui.text(method.get_name());
              }
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
}
