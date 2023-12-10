import { Lexer } from "./lexer";
import { Parser } from "./ast";
import Interpreter from "./interpreter";
import SemanticAnalyzer from "./symbols/visitor";

const code = `
programme HelloWorld
début # ceci est le début du programme
  avec
    mon_mod    : entier
    une_chaîne : chaîne

  afficher "mon_mod = "
  saisir (mon_mod)
  afficher "chaîne = "
  saisir une_chaîne

  afficher mon_mod, une_chaîne, "\n"
fin HelloWorld
`.trim();

try {
  const lexer = new Lexer(code);
  const parser = new Parser(lexer);
  const tree = parser.parse();

  // We check the code for any syntax errors.
  const symbol_table_builder = new SemanticAnalyzer();
  symbol_table_builder.visit(tree);

  // We interpret the code.
  const interpreter = new Interpreter();
  interpreter.interpret(tree);
}
catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  }
  else {
    console.error("UnknownError:", error);
  }
}