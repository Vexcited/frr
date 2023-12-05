import { Lexer } from "./lexer";
import { Parser } from "./ast";
import Interpreter from "./interpreter";
import SymbolTableBuilder from "./symbols/visitor";

const code = `
programme HelloWorld
début # ceci est le début du programme
  avec
    a, b : entier

  a <- 6
  b <- a + 1
fin HelloWorld
`.trim();

try {
  const lexer = new Lexer(code);
  const parser = new Parser(lexer);
  const tree = parser.parse();

  // We check the code for any syntax errors.
  const symbol_table_builder = new SymbolTableBuilder();
  symbol_table_builder.visit(tree);

  console.log(symbol_table_builder.symbol_table);

  // We interpret the code.
  const interpreter = new Interpreter();
  const global_scope = interpreter.interpret(tree);

  console.log(global_scope);
}
catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  }
  else {
    console.error("UnknownError:", error);
  }
}