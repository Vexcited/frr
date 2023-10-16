import { Lexer } from "../lexer";

import {
  type Token, TokenType,

  EntierToken,
  PlusToken,
  MinusToken,
  DivToken,
  MulToken
} from "../lexer/tokens";

import { IntegerNumber, BinaryOperation, UnaryOperation, type AST, Compound } from "./nodes";

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

  /** fin : "fin NOM_PROGRAMME" */
  private program () {
    const node = this.compound_statement();
    this.eat(TokenType.END);
    this.eat(TokenType.ID);
    return node;
  }

  /** compound_statement: BEGIN statement_list END */
  private compound_statement () {
    this.eat(TokenType.BEGIN);
    const nodes = this.statement_list();
    this.eat(TokenType.END);

    const root = new Compound();
    for (const node of nodes) {
      root.children.push(node);
    }

    return root;
  }

  /** statement_list : statement | statement SEMI statement_list */
  private statement_list (): AST[] {
    const node = this.statement();

    const results = [node];

    while (this.current_token?.type === TokenType.SEMI) {
      this.eat(TokenType.SEMI);
      results.push(this.statement());
    }

    if (this.current_token?.type === TokenType.ID) {
      throw new Error("Invalid syntax.");
    }

    return results;
  }


  /**
   * factor : (PLUS | MINUS) factor | INTEGER | LPAREN expr RPAREN
   */
  private factor (): BinaryOperation | IntegerNumber | UnaryOperation {
    const token = this.current_token!;

    switch (token.type) {
      case TokenType.PLUS:
        this.eat(TokenType.PLUS);
        return new UnaryOperation(token as PlusToken, this.factor());
      case TokenType.MINUS:
        this.eat(TokenType.MINUS);
        return new UnaryOperation(token as MinusToken, this.factor());
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

    throw new Error("Invalid syntax.");
  }

  /** term : factor ((MUL | DIV) factor)* */
  private term (): BinaryOperation | IntegerNumber | UnaryOperation {
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
  private expr (): BinaryOperation | IntegerNumber | UnaryOperation {
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
