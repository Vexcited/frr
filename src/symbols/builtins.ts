import { Compound } from "../ast/nodes";

export class BaseSymbol {
  constructor (
    public name: string,
    public type?: string
  ) {}
}

export class BuiltinTypeSymbol extends BaseSymbol {
  constructor (name: string) {
    super(name);
  }
}

export class VarSymbol extends BaseSymbol {
  constructor (name: string, type: BuiltinTypeSymbol) {
    super(name, type.name);
  }
}

export class ArgumentVarSymbol extends VarSymbol {
  constructor (name: string, type: BuiltinTypeSymbol, public method: "copy" | "reference") {
    super(name, type);
  }
}

export class ProcedureSymbol extends BaseSymbol {
  /**
   * Compound from the Procedure AST node.
   * Manually set by the syntax analyzer,
   * at the end of the `visitProcedure` method.
   *
   * When using in interpreter, this is ALWAYS set.
   */
  public compound_from_node?: Compound;

  constructor (name: string, public args: ArgumentVarSymbol[] = []) {
    super(name);
  }
}

export class BuiltinProcedureSymbol extends BaseSymbol {
  constructor (name: string, public args: VarSymbol[] = []) {
    super(name);
  }
}
