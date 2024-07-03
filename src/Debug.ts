export class Debug {
  private static TypeDefinitions: Array<RETypeDefinition> = [];
  private static Search: string = "";

  static add_TypeDefinition(TypeDefinition: RETypeDefinition) {
    if (this.TypeDefinitions.includes(TypeDefinition)) {
      return;
    }
    this.TypeDefinitions.push(TypeDefinition);
  }

  static ui() {
    if (imgui.tree_node("调试")) {
      this.Search = imgui.input_text("搜索", this.Search)[1];
      for (const TypeDefinition of this.TypeDefinitions) {
        if (imgui.tree_node(TypeDefinition.get_full_name())) {
          const fields = TypeDefinition.get_fields();
          if (fields.length > 0 && imgui.tree_node("字段")) {
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
                const taxt = this.getFieldSignature(field);
                if (this.Search == "" || taxt.includes(this.Search)) {
                  imgui.text(taxt);
                }
              }
              imgui.tree_pop();
            }
            if (noStaticFields.length > 0 && imgui.tree_node("非静态")) {
              for (const field of noStaticFields) {
                const taxt = this.getFieldSignature(field);
                if (this.Search == "" || taxt.includes(this.Search)) {
                  imgui.text(taxt);
                }
              }
              imgui.tree_pop();
            }
            imgui.tree_pop();
          }

          const methods = TypeDefinition.get_methods();
          if (methods.length > 0 && imgui.tree_node("方法")) {
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
                const taxt = this.getMethodSignature(method);
                if (this.Search == "" || taxt.includes(this.Search)) {
                  imgui.text(taxt);
                }
              }
              imgui.tree_pop();
            }
            if (noStaticMethods.length > 0 && imgui.tree_node("非静态")) {
              for (const method of noStaticMethods) {
                const taxt = this.getMethodSignature(method);
                if (this.Search == "" || taxt.includes(this.Search)) {
                  imgui.text(taxt);
                }
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

  static getMethodSignature(method: REMethodDefinition): string {
    const paramTypes = method
      .get_param_types()
      .map((param) => param.get_full_name())
      .join(", ");
    return `${method.get_name()}(${paramTypes}): ${method.get_return_type().get_full_name()}`;
  }

  static getFieldSignature(field: REField): string {
    return `${field.get_name()}: ${field.get_type().get_full_name()}`;
  }
}
