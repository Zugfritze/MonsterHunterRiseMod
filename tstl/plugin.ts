import { SourceNode } from "source-map";
import * as ts from "typescript";
import * as tstl from "typescript-to-lua";

class CustomPrinter extends tstl.LuaPrinter {
  public printNumericLiteral(expression: tstl.NumericLiteral): SourceNode {
    if (expression.value == 0.10001) {
      return this.createSourceNode(expression, ".0");
    }
    return this.createSourceNode(expression, expression.value.toString());
  }
}

const plugin: tstl.Plugin = {
  printer: (program: ts.Program, emitHost: tstl.EmitHost, fileName: string, file: tstl.File) =>
    new CustomPrinter(emitHost, program, fileName).print(file),
};

export default plugin;
