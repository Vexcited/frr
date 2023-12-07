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

  public toString () {
    return this.name;
  }
}

export class VarSymbol extends BaseSymbol {
  constructor (name: string, type: BuiltinTypeSymbol) {
    super(name, type.name);
  }

  public toString () {
    return `<${this.name}:${this.type}>`;
  }
}

export class ProcedureSymbol extends BaseSymbol {
  constructor (name: string, public args: VarSymbol[] = []) {
    super(name);
  }
}