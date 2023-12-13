export enum TokenType {
  INTEGER_CONST = "INTEGER_CONST",
  REAL_CONST = "REAL_CONST",
  INTEGER = "INTEGER",
  REAL = "REAL",

  PLUS = "PLUS",
  MINUS = "MINUS",
  MUL = "MUL",
  DIV = "DIV",
  MOD = "MOD",
  NOT = "NOT",

  EQUAL = "EQUAL",
  NOT_EQUAL = "NOT_EQUAL",
  LESS_THAN = "LOWER_THAN",
  GREATER_THAN = "GREATER_THAN",
  LESS_THAN_OR_EQUAL = "LOWER_THAN_OR_EQUAL",
  GREATER_THAN_OR_EQUAL = "GREATER_THAN_OR_EQUAL",

  BOOLEAN = "BOOLEAN",
  BOOLEAN_CONST = "BOOLEAN_CONST",

  LPAREN = "LPAREN",
  RPAREN = "RPAREN",

  PROCEDURE = "PROCEDURE",
  PROGRAM = "PROGRAM",
  BEGIN = "BEGIN",
  END = "END",

  LINE_BREAK = "LINE_BREAK",
  COLON = "COLON",
  COMMA = "COMMA",

  STRING = "STRING",
  CHAR = "CHAR",
  STRING_CONST = "STRING_CONST",
  CHAR_CONST = "CHAR_CONST",

  ID = "ID",
  ASSIGN = "ASSIGN",
  VARIABLE_DECLARATION_BLOCK = "VARIABLE_DECLARATION_BLOCK",

  EOF = "EOF",
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

export class NotToken extends BaseToken<string> {
  constructor () {
    super(TokenType.NOT, "!");
  }
}

export class ModToken extends BaseToken<string> {
  constructor () {
    super(TokenType.MOD, "mod");
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

export class BooleanToken extends BaseToken<string> {
  constructor () {
    super(TokenType.BOOLEAN, "booléen");
  }
}

export class BooleanConstToken extends BaseToken<boolean> {
  constructor (value: boolean) {
    super(TokenType.BOOLEAN_CONST, value);
  }
}

export class CompareToken extends BaseToken<string> {
  constructor () {
    super(TokenType.EQUAL, "=");
  }
}

export class ProgramToken extends BaseToken<string> {
  constructor () {
    super(TokenType.PROGRAM, "programme");
  }
}

export class ProcedureToken extends BaseToken<string> {
  constructor () {
    super(TokenType.PROCEDURE, "procédure");
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
  constructor () {
    super(TokenType.CHAR, "caractère");
  }
}

export class EqualToken extends BaseToken<string> {
  constructor () {
    super(TokenType.EQUAL, "=");
  }
}

export class NotEqualToken extends BaseToken<string> {
  constructor () {
    super(TokenType.NOT_EQUAL, "!=");
  }
}

export class LessThanToken extends BaseToken<string> {
  constructor () {
    super(TokenType.LESS_THAN, "<");
  }
}

export class GreaterThanToken extends BaseToken<string> {
  constructor () {
    super(TokenType.GREATER_THAN, ">");
  }
}

export class LessThanOrEqualToken extends BaseToken<string> {
  constructor () {
    super(TokenType.LESS_THAN_OR_EQUAL, "<=");
  }
}

export class GreaterThanOrEqualToken extends BaseToken<string> {
  constructor () {
    super(TokenType.GREATER_THAN_OR_EQUAL, ">=");
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

export type BinaryOperationToken = PlusToken | MinusToken | MulToken | DivToken | ModToken | LParenToken | RParenToken;

export type Token = BinaryOperationToken | (
  | IntegerConstToken
  | BooleanConstToken
  | StringConstToken
  | CharConstToken
  | RealConstToken
  | EOFToken
  | LineBreakToken
);
