import { Lexer } from "./lexer";
import { Parser } from "./ast";
import Interpreter from "./interpreter";
import SymbolTableBuilder from "./symbols/visitor";

const code = `
procédure coucou (hey, ho)
début

fin coucou

programme HelloWorld
début # ceci est le début du programme
  avec
    mon_mod    : entier
    une_chaîne : chaîne

  une_chaîne <- "Hello"
  mon_mod    <- 9 mod 2
fin HelloWorld
`.trim();

try {
  const lexer = new Lexer(code);
  const parser = new Parser(lexer);
  const tree = parser.parse();

  // We check the code for any syntax errors.
  const symbol_table_builder = new SymbolTableBuilder();
  symbol_table_builder.visit(tree);

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