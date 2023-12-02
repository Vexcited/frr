import { Lexer } from "../lexer";

import {
  type Token, TokenType,

  EntierToken,
  PlusToken,
  MinusToken,
  DivToken,
  MulToken,
  IDToken,
  AssignToken
} from "../lexer/tokens";

import { IntegerNumber, BinaryOperation, UnaryOperation, type AST, Compound, NoOp, Variable, Assign } from "./nodes";

export class Parser {
  /** Current token instance. */
  private current_token: Token | null = null;

  constructor (private lexer: Lexer) {
    this.current_token = this.lexer.get_next_token();
  }

  /**
   * Eat a token of a specific type and advance the
   * `this.current_token` to the next token.
   *
   * @param token_type - The type of token to eat, e.g. `TokenType.PLUS`.
   * @throws when the current token does not match the passed token type.
   */
  private eat (token_type: TokenType): void {
    // Compare the current token type with the passed token type.
    if (this.current_token?.type === token_type) {
      // If they match, then "eat" the current token and assign the next token to `this.current_token`.
      this.current_token = this.lexer.get_next_token();
    }
    // Otherwise raise an exception.
    else {
      throw new Error("Invalid syntax.");
    }
  }

  /** program: programme `program_name` compound_statement `program_name` */
  private program () {
    this.eat(TokenType.PROGRAM);
    this.eat(TokenType.ID);
    this.eat(TokenType.LINE_BREAK);

    // Handles `début\n` and `fin` tokens.
    const node = this.compound_statement();
    this.eat(TokenType.ID);

    return node;
  }

  /** compound_statement: début statement_list fin */
  private compound_statement () {
    this.eat(TokenType.BEGIN);
    this.eat(TokenType.LINE_BREAK);

    const nodes = this.statement_list();

    this.eat(TokenType.END);

    const root = new Compound();
    for (const node of nodes) {
      root.children.push(node);
    }

    return root;
  }

  /** statement_list : statement | statement \n statement_list */
  private statement_list (): Array<AST> {
    const node = this.statement();
    const results = [node];

    // After the first statement, we expect the token to be a line break.
    // So we can loop on every statement until we reach the end of the program.

    while (this.current_token?.type === TokenType.LINE_BREAK) {
      // Eat the line break and move to next token.
      this.eat(TokenType.LINE_BREAK);

      // @ts-expect-error -> We moved to next token.
      if (this.current_token?.type === TokenType.END) break;

      results.push(this.statement());
    }

    if (this.current_token?.type !== TokenType.END) {
      throw new Error("Invalid syntax.");
    }

    return results;
  }

  private statement (): AST {
    if (this.current_token?.type === TokenType.ID) {
      return this.assignment_statement();
    }
    else {
      return this.empty();
    }
  }

  private assignment_statement (): Assign {
    const left = this.variable();
    // We keep the variable ID token to pass it in `Assign` node.
    const token = this.current_token as AssignToken;

    // Assign sign `<-`.
    this.eat(TokenType.ASSIGN);

    // Value of the variable.
    const right = this.expr();

    return new Assign(left, token, right);
  }

  private variable (): Variable {
    const node = new Variable(this.current_token as IDToken);
    this.eat(TokenType.ID);
    return node;
  }

  private empty (): AST {
    return new NoOp();
  }


  /**
   * factor : (PLUS | MINUS) factor | INTEGER | LPAREN expr RPAREN | variable
   */
  private factor (): BinaryOperation | IntegerNumber | UnaryOperation | Variable {
    const token = this.current_token!;

    switch (token.type) {
      case TokenType.PLUS:
        this.eat(TokenType.PLUS);
        return new UnaryOperation(token as PlusToken, this.factor() as IntegerNumber | BinaryOperation | UnaryOperation);
      case TokenType.MINUS:
        this.eat(TokenType.MINUS);
        return new UnaryOperation(token as MinusToken, this.factor() as IntegerNumber | BinaryOperation | UnaryOperation);
      case TokenType.INTEGER:
        this.eat(TokenType.INTEGER);
        return new IntegerNumber(token as EntierToken);
      case TokenType.LPAREN: {
        this.eat(TokenType.LPAREN);
        const node = this.expr();
        this.eat(TokenType.RPAREN);
        return node;
      }
    }

    // If the token is not one of the above types, it must be a variable.
    return this.variable();
  }

  /** term : factor ((MUL | DIV) factor)* */
  private term (): BinaryOperation | IntegerNumber | UnaryOperation | Variable {
    let node = this.factor();

    while (this.current_token?.type && [TokenType.MUL, TokenType.DIV].includes(this.current_token.type)) {
      const token = this.current_token as MulToken | DivToken;

      if (token.type === TokenType.MUL) {
        this.eat(TokenType.MUL);
      }
      else if (token.type === TokenType.DIV) {
        this.eat(TokenType.DIV);
      }

      node = new BinaryOperation(node, token, this.factor());
    }

    return node;
  }

  /**
   * Arithmetic expression parser / interpreter.
   *
   * expr   : term ((PLUS | MINUS) term)*
   * term   : factor ((MUL | DIV) factor)*
   * factor : INTEGER | LPAREN expr RPAREN
   */
  private expr (): BinaryOperation | IntegerNumber | UnaryOperation | Variable {
    let node = this.term();

    while (this.current_token?.type && [TokenType.PLUS, TokenType.MINUS].includes(this.current_token.type)) {
      const token = this.current_token as PlusToken | MinusToken;

      if (token.type === TokenType.PLUS) {
        this.eat(TokenType.PLUS);
      }
      else if (token.type === TokenType.MINUS) {
        this.eat(TokenType.MINUS);
      }

      node = new BinaryOperation(node, token, this.term());
    }

    return node;
  }

  public parse (): AST {
    return this.program();
  }
}
