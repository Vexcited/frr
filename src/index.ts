import { Lexer } from "./lexer";
import { Parser } from "./ast";
import { Interpreter } from "./interpreter";

const text = "(((2)+2))/4*2";

const lexer = new Lexer(text);
const parser = new Parser(lexer);
console.log(JSON.stringify(parser.parse(), null, 2));
// const interpreter = new Interpreter(parser);
// const result = interpreter.interpret();
// console.log(result);