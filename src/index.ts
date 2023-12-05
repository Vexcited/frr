import { Lexer } from "./lexer";
import { Parser } from "./ast";
// import { Interpreter } from "./interpreter";

const code = `
programme HelloWorld
début # ceci est le début du programme
  avec
    a, c : entier
    b : entier
    d : réel

  a <- 6
  b <- a + 9
fin HelloWorld
`.trim();

const lexer = new Lexer(code);
// let token = lexer.get_next_token();
// while (token.type !== "EOF") {
//   console.log(token);
//   token = lexer.get_next_token();
// }

const parser = new Parser(lexer);
console.log(JSON.stringify(parser.parse(), null, 2));
// console.log(parser.parse());
// const interpreter = new Interpreter(parser);
// const result = interpreter.interpret();