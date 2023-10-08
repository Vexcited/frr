import { is_alnum, is_alpha, is_digit, is_space } from "../utils/strings";

import {
  DivToken,
  EOFToken,
  EntierToken,
  MinusToken,
  MulToken,
  PlusToken,
  LParenToken,
  RParenToken,
  BeginToken,
  ProgramToken,

  type Token,
  IDToken,
  AssignToken
} from "./tokens";

const RESERVED_KEYWORDS = {
  "programme": new ProgramToken(),
  "début": new BeginToken()
} as const;

export class Lexer {
  /** Current position in `this.text`. */
  private pos = 0;
  /** Current character in `this.text`. */
  private current_char: string | null = null;

  constructor (private text: string) {
    this.text = text;
    this.current_char = this.text[this.pos];
  }

  /** Advance the 'pos' pointer and set the 'current_char' variable. */
  private advance (): void {
    this.pos += 1;
    if (this.pos > this.text.length - 1) {
      // Indicates end of input.
      this.current_char = null;
    }
    else {
      this.current_char = this.text[this.pos];
    }
  }

  private skip_whitespace (): void {
    while (this.current_char !== null && is_space(this.current_char)) {
      this.advance();
    }
  }

  /** Return a (multi-digit) integer consumed from the input. */
  private integer (): number {
    let result = "";

    while (this.current_char !== null && is_digit(this.current_char)) {
      // We concatenate the string representation of the current integer character.
      result += this.current_char;
      this.advance();
    }

    return parseInt(result);
  }

  private peek (): string | null {
    const peek_pos = this.pos + 1;
    if (peek_pos > this.text.length - 1) {
      return null;
    }
    else {
      return this.text[peek_pos];
    }
  }

  /** Handle identifiers and reserved keywords. */
  private _id (): typeof RESERVED_KEYWORDS[keyof typeof RESERVED_KEYWORDS] | IDToken {
    let result = "";

    while (this.current_char !== null && is_alnum(this.current_char)) {
      // We concatenate the string representation of the current integer character.
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
  public get_next_token (): Token {
    while (this.current_char !== null) {
      if (is_space(this.current_char)) {
        this.skip_whitespace();
        continue;
      }

      if (is_digit(this.current_char)) {
        return new EntierToken(this.integer());
      }

      if (is_alpha(this.current_char)) {
        return this._id();
      }

      if (this.current_char === "<" && this.peek() === "-") {
        this.advance();
        this.advance();
        return new AssignToken();
      }

      switch (this.current_char) {
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
        case "(":
          this.advance();
          return new LParenToken();
        case ")":
          this.advance();
          return new RParenToken();
      }

      throw new Error("Invalid character.");
    }

    return new EOFToken();
  }
}
