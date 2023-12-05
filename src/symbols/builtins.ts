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
  constructor (name: string, type: string) {
    super(name, type);
  }

  public toString () {
    return `<${this.name}:${this.type}>`;
  }
}