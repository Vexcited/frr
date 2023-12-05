import { BaseSymbol, BuiltinTypeSymbol } from "./builtins";

class SymbolTable {
  private symbols: Map<string, BaseSymbol>;

  constructor () {
    this.symbols = new Map();
    this.initBuiltins();
  }

  private initBuiltins () {
    this.define(new BuiltinTypeSymbol("entier"));
    this.define(new BuiltinTypeSymbol("réel"));
  }

  public define (symbol: BaseSymbol) {
    this.symbols.set(symbol.name, symbol);
  }

  public lookup (name: string): BaseSymbol | undefined {
    return this.symbols.get(name);
  }
}

export default SymbolTable;
