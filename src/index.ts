import { Lexer } from "./lexer";
import { Parser } from "./ast";
import { Interpreter } from "./interpreter";

const text = `
programme HelloWorld
début
  a <- 6
  b <- b + 9
fin HelloWorld
`.trim();

const lexer = new Lexer(text);
const parser = new Parser(lexer);
const interpreter = new Interpreter(parser);
const result = interpreter.interpret();
console.log(result);