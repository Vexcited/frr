export enum TokenType {
  INTEGER_CONST = "INTEGER_CONST",
  REAL_CONST = "REAL_CONST",
  INTEGER = "INTEGER",
  REAL = "REAL",
  PLUS = "PLUS",
  MINUS = "MINUS",
  MUL = "MUL",
  DIV = "DIV",
  LPAREN = "LPAREN",
  RPAREN = "RPAREN",
  PROGRAM = "PROGRAM",
  BEGIN = "BEGIN",
  END = "END",
  ASSIGN = "ASSIGN",
  LINE_BREAK = "LINE_BREAK",
  COLON = "COLON",
  COMMA = "COMMA",
  STRING = "STRING",
  CHAR = "CHAR",
  STRING_CONST = "STRING_CONST",
  CHAR_CONST = "CHAR_CONST",
  ID = "ID",
  EOF = "EOF",
  VARIABLE_DECLARATION_BLOCK = "VARIABLE_DECLARATION_BLOCK"
}

class BaseToken<T> {
  constructor (
    public type: TokenType,
    public value: T
  ) {}
}

export class IntegerToken extends BaseToken<string> {
  constructor () {
    super(TokenType.INTEGER, "entier");
  }
}

export class RealToken extends BaseToken<string> {
  constructor () {
    super(TokenType.REAL, "réel");
  }
}

export class IntegerConstToken extends BaseToken<number> {
  constructor (value: number) {
    super(TokenType.INTEGER_CONST, value);
  }
}

export class RealConstToken extends BaseToken<number> {
  constructor (value: number) {
    super(TokenType.REAL_CONST, value);
  }
}

export class PlusToken extends BaseToken<string> {
  constructor () {
    super(TokenType.PLUS, "+");
  }
}

export class MinusToken extends BaseToken<string> {
  constructor () {
    super(TokenType.MINUS, "-");
  }
}

export class MulToken extends BaseToken<string> {
  constructor () {
    super(TokenType.MUL, "*");
  }
}

export class DivToken extends BaseToken<string> {
  constructor () {
    super(TokenType.DIV, "/");
  }
}

export class LParenToken extends BaseToken<string> {
  constructor () {
    super(TokenType.LPAREN, "(");
  }
}

export class RParenToken extends BaseToken<string> {
  constructor () {
    super(TokenType.RPAREN, ")");
  }
}

export class ProgramToken extends BaseToken<string> {
  constructor () {
    super(TokenType.PROGRAM, "programme");
  }
}

export class BeginToken extends BaseToken<string> {
  constructor () {
    super(TokenType.BEGIN, "début");
  }
}

export class EndToken extends BaseToken<string> {
  constructor () {
    super(TokenType.END, "fin");
  }
}

export class LineBreakToken extends BaseToken<string> {
  constructor () {
    super(TokenType.LINE_BREAK, "\n");
  }
}

export class ColonToken extends BaseToken<string> {
  constructor () {
    super(TokenType.COLON, ":");
  }
}

export class CommaToken extends BaseToken<string> {
  constructor () {
    super(TokenType.COMMA, ",");
  }
}

export class IDToken extends BaseToken<string> {
  constructor (value: string) {
    super(TokenType.ID, value);
  }
}

export class AssignToken extends BaseToken<string> {
  constructor () {
    super(TokenType.ASSIGN, "<-");
  }
}

export class StringConstToken extends BaseToken<string> {
  constructor (value: string) {
    super(TokenType.STRING_CONST, value);
  }
}

export class StringToken extends BaseToken<string> {
  constructor () {
    super(TokenType.STRING, "chaîne");
  }
}

export class CharConstToken extends BaseToken<string> {
  constructor (value: string) {
    super(TokenType.CHAR_CONST, value);
  }
}

export class CharToken extends BaseToken<string> {
  constructor (value: string) {
    super(TokenType.CHAR, value);
  }
}

/**
 * End of file/input token.
 */
export class EOFToken extends BaseToken<string> {
  constructor () {
    super(TokenType.EOF, "EOF");
  }
}

export class VariableDeclarationBlockToken extends BaseToken<string> {
  constructor () {
    super(TokenType.VARIABLE_DECLARATION_BLOCK, "avec");
  }
}

export type BinaryOperationToken = PlusToken | MinusToken | MulToken | DivToken | LParenToken | RParenToken;

export type Token = BinaryOperationToken | (
  | IntegerConstToken
  | RealConstToken
  | EOFToken
  | LineBreakToken
  | StringConstToken
  | CharConstToken
  | CharToken
);
