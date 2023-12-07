import { BaseSymbol, BuiltinTypeSymbol } from "./builtins";

class ScopedSymbolTable {
  private symbols: Map<string, BaseSymbol>;

  constructor (public scope_name: string) {
    this.symbols = new Map();
    this.initBuiltins();
  }

  private initBuiltins () {
    this.define(new BuiltinTypeSymbol("entier"));
    this.define(new BuiltinTypeSymbol("réel"));
    this.define(new BuiltinTypeSymbol("chaîne"));
  }

  public define (symbol: BaseSymbol) {
    this.symbols.set(symbol.name, symbol);
  }

  public lookup (name: string): BaseSymbol | undefined {
    return this.symbols.get(name);
  }
}

export default ScopedSymbolTable;
