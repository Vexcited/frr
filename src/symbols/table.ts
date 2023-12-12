import { BaseSymbol, BuiltinTypeSymbol, BuiltinProcedureSymbol } from "./builtins";
import { builtinProcedures } from "../interpreter/builtins";

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
    this.define(new BuiltinTypeSymbol("caractère"));
    this.define(new BuiltinTypeSymbol("car")); // Alias for "caractère".
    this.define(new BuiltinTypeSymbol("booléen"));

    for (const builtinProcedureName of Object.keys(builtinProcedures)) {
      this.define(new BuiltinProcedureSymbol(builtinProcedureName));
    }
  }

  public define (symbol: BaseSymbol) {
    this.symbols.set(symbol.name, symbol);
  }

  public lookup (name: string): BaseSymbol | undefined {
    return this.symbols.get(name);
  }
}

export default ScopedSymbolTable;
