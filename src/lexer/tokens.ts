export enum TokenType {
  INTEGER = "INTEGER",
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
  ID = "ID",
  EOF = "EOF"
}

class BaseToken<T> {
  constructor (
    public type: TokenType,
    public value: T
  ) {}
}

/**
 * An integer token, named `entier` in French.
 *
 * Operations on that token are currently limited
 * to addition (PLUS) and subtraction (MINUS).
 */
export class EntierToken extends BaseToken<number> {
  constructor (value: number) {
    super(TokenType.INTEGER, value);
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

/**
 * End of file/input token.
 */
export class EOFToken extends BaseToken<string> {
  constructor () {
    super(TokenType.EOF, "EOF");
  }
}

export type BinaryOperationToken = PlusToken | MinusToken | MulToken | DivToken | LParenToken | RParenToken;

export type Token = (
  | EntierToken
  | PlusToken
  | MinusToken
  | MulToken
  | DivToken
  | LParenToken
  | RParenToken
  | EOFToken
);
