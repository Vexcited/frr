import { is_alnum, is_alpha, is_digit, is_newline, is_space } from "../utils/strings";

import {
  DivToken,
  EOFToken,
  IntegerConstToken,
  RealConstToken,
  MinusToken,
  MulToken,
  PlusToken,
  LParenToken,
  RParenToken,
  BeginToken,
  ProgramToken,
  EndToken,
  LineBreakToken,
  VariableDeclarationBlockToken,
  IntegerToken,
  RealToken,
  ColonToken,
  StringConstToken,
  StringToken,

  type Token,
  IDToken,
  AssignToken,
  CommaToken,
  ModToken,
  ProcedureToken,
  BooleanToken,
  BooleanConstToken,
  CharConstToken,
  CharToken,
  LessThanOrEqualToken,
  LessThanToken,
  GreaterThanOrEqualToken,
  GreaterThanToken,
  EqualToken,
  NotToken,
  NotEqualToken
} from "./tokens";

const RESERVED_KEYWORDS = {
  // Keywords.
  "procédure": new ProcedureToken(),
  "programme": new ProgramToken(),
  "début": new BeginToken(),
  "avec": new VariableDeclarationBlockToken(),
  "fin": new EndToken(),

  // Operator.
  "mod": new ModToken(),
  "non": new NotToken(),

  // Types.
  "entier": new IntegerToken(),
  "réel": new RealToken(),
  "chaîne": new StringToken(),
  "booléen": new BooleanToken(),
  "caractère": new CharToken(),
  "car": new CharToken(), // Alias for "caractère".

  // Constants.
  "vrai": new BooleanConstToken(true),
  "faux": new BooleanConstToken(false)
} as const;

export class Lexer {
  /** Current position in `this.text`. */
  public pos = 0;
  public pos_line = 0;
  public pos_column = 1;
  /** Current character in `this.text`. */
  public current_char: string | null = null;

  constructor (private text: string) {
    this.text = text;
    this.current_char = this.text[this.pos];
  }

  /** Advance the 'pos' pointer and set the 'current_char' variable. */
  private advance(): void {
    if (this.current_char === "\n") {
      this.pos_line += 1;
      this.pos_column = 0;
    }

    this.pos += 1;
    if (this.pos > this.text.length - 1) {
      // Indicates end of input.
      this.current_char = null;
    }
    else {
      this.current_char = this.text[this.pos];
      this.pos_column += 1;
    }
  }

  /** Go back to a previous position in the text input. */
  public goto (pos: number): void {
    this.pos = pos;
    this.current_char = this.text[this.pos];
  }

  private skip_whitespace(): void {
    while (this.current_char !== null && is_space(this.current_char)) {
      this.advance();
    }
  }

  private skip_comment(): void {
    while (this.current_char !== null && !is_newline(this.current_char)) {
      this.advance();
    }

    // We don't skip the newline character
    // as it may be used as a line break token.
  }

  /** Return a (multi-digit) integer or float consumed from the input. */
  private handleNumber(): RealConstToken | IntegerConstToken {
    let result = "";

    while (this.current_char !== null && is_digit(this.current_char)) {
      // We concatenate the string representation of the current integer character.
      result += this.current_char;
      this.advance();
    }

    // Handle floating point numbers.
    if (this.current_char === ".") {
      // We concatenate the '.' character.
      result += this.current_char;
      this.advance();

      while (this.current_char !== null && is_digit(this.current_char)) {
        result += this.current_char;
        this.advance();
      }

      return new RealConstToken(parseFloat(result));
    }

    return new IntegerConstToken(parseInt(result));
  }

  private handleString(): StringConstToken {
    let result = "";

    // We skip the first quote.
    this.advance();

    while (this.current_char !== null) {
      // When `\` is encountered, we check the next character.
      if (this.current_char === "\\") {
        const next_char = this.text[this.pos + 1];

        // Check for common escape sequences
        if (next_char !== undefined) {
          if (next_char === "n") {
            result += "\n"; // newline
            this.advance(); // skip the 'n'
          }
          else if (next_char === "\"") {
            result += "\""; // escaped double quote
            this.advance(); // skip the '\"'
          }
          else {
            // Handle other escape sequences as needed
            // For simplicity, assuming that unknown escape sequences are treated as the literal character
            result += "\\";
          }
        }
        else {
          // Handle case where '\' is at the end of the string
          result += "\\";
        }
      }
      // When `"`, we check the previous character.
      else if (this.current_char === "\"") {
        const char_before = this.text[this.pos - 1];

        // Check for unescaped quote: end of the string
        if (char_before !== "\\") break;
        // If escaped, we add the quote to the result.
        else result += "\\\"";
      }

      // When regular character, add to result.
      else result += this.current_char;

      this.advance();
    }

    // We skip the last quote.
    this.advance();

    return new StringConstToken(result);
  }

  private handleChar(): CharConstToken {
    let result = "";

    // Skip the first quote.
    this.advance();

    // If it is an escape sequence, we handle it.
    if (this.current_char === "\\") {
      // Skip the `\` character.
      this.advance();

      // We set as string because `this.advance()`
      // updated `this.current_char` variable.
      switch (this.current_char as string) {
        case "n":
          result = "\n";
          break;
        case "\"":
          result = "\"";
          break;
        default:
          // Just output the character as is.
          // Without the backslash, though.
          result = this.current_char!;
          break;
      }
    }
    // If it is a regular character, we just add it.
    else result = this.current_char!;

    // Skip the character.
    this.advance();

    // We skip the last quote.
    this.advance();

    return new CharConstToken(result);
  }

  private peek(into = 1): string | null {
    const peek_pos = this.pos + into;
    if (peek_pos > this.text.length - 1) {
      return null;
    }

    return this.text[peek_pos];
  }

  public peekAfterWhiteSpaces(): string | null {
    let peek_pos = this.pos;

    while (is_space(this.text[peek_pos])) {
      if (peek_pos > this.text.length - 1) {
        return null;
      }

      peek_pos++;
    }

    return this.text[peek_pos];
  }

  /** Handle identifiers and reserved keywords. */
  private identifier(): typeof RESERVED_KEYWORDS[keyof typeof RESERVED_KEYWORDS] | IDToken {
    let result = "";

    while (this.current_char !== null && is_alnum(this.current_char)) {
      // We concatenate the string representation of the current character.
      result += this.current_char;
      this.advance();
    }

    return RESERVED_KEYWORDS[result as keyof typeof RESERVED_KEYWORDS] ?? new IDToken(result);
  }

  /**
   * Lexical analyzer (also known as lexer or tokenizer)
   *
   * This method is responsible for breaking a sentence
   * apart into tokens.
   */
  public get_next_token(): Token {
    while (this.current_char !== null) {
      // Handle comments by skipping them.
      if (this.current_char === "#") {
        this.advance(); // Skip the '#'.
        this.skip_comment();
        continue;
      }

      // We don't really mind about spaces, so skip them.
      if (is_space(this.current_char)) {
        this.skip_whitespace();
        continue;
      }

      // Handle new lines as tokens too.
      if (is_newline(this.current_char)) {
        this.advance();
        return new LineBreakToken();
      }

      // If the current character is a digit.
      if (is_digit(this.current_char)) {
        return this.handleNumber();
      }

      // If the current character is a letter.
      if (is_alpha(this.current_char)) {
        return this.identifier();
      }

      // Handle every other single character token.
      switch (this.current_char) {
        case ",":
          this.advance();
          return new CommaToken();
        case ":":
          this.advance();
          return new ColonToken();
        case "+":
          this.advance();
          return new PlusToken();
        case "-":
          this.advance();
          return new MinusToken();
        case "*":
          this.advance();
          return new MulToken();
        case "/":
          this.advance();
          return new DivToken();
        case "%":
          this.advance();
          return new ModToken();
        case "(":
          this.advance();
          return new LParenToken();
        case ")":
          this.advance();
          return new RParenToken();
        case "\"":
          return this.handleString();
        case "'":
          return this.handleChar();
        case "=":
          this.advance();
          return new EqualToken();
        case "!": {
          const peek = this.peek();

          // Handle `!=` token.
          if (peek === "=") {
            this.advance();
            this.advance();
            return new NotEqualToken();
          }

          this.advance();
          return new NotToken();
        }
        case "<": {
          const peek = this.peek();

          // Handle `<=` token.
          if (peek === "=") {
            this.advance();
            this.advance();
            return new LessThanOrEqualToken();
          }
          // Handle `<-` token.
          else if (peek === "-") {
            this.advance();
            this.advance();
            return new AssignToken();
          }

          this.advance();
          return new LessThanToken();
        }
        case ">": {
          const peek = this.peek();

          // Handle `>=` token.
          if (peek === "=") {
            this.advance();
            this.advance();
            return new GreaterThanOrEqualToken();
          }

          this.advance();
          return new GreaterThanToken();
        }
      }

      throw new Error(`Erreur<lexer.next_token> de syntaxe.\nCaractère invalide (${this.pos_line}:${this.pos_column})`);
    }

    return new EOFToken();
  }
}
