import { Lexer } from "./lexer";
import { Parser } from "./ast";
import { Interpreter } from "./interpreter";

const code = `
programme HelloWorld
début
  a <- 6
  b <- a + 9
fin HelloWorld
`.trim();

const lexer = new Lexer(code);
const parser = new Parser(lexer);
const interpreter = new Interpreter(parser);
const result = interpreter.interpret();
console.log("HelloWorld scope:", result);