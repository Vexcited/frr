import { Lexer } from "../lexer";

import {
  type Token, TokenType,

  IntegerConstToken,
  PlusToken,
  MinusToken,
  DivToken,
  MulToken,
  IDToken,
  AssignToken
} from "../lexer/tokens";

import { IntegerNumber, BinaryOperation, UnaryOperation, type AST, Compound, NoOp, Variable, Assign, Program, Type, VariableDeclaration } from "./nodes";

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

  /** program: programme `variable` compound_statement `variable` */
  private program () {
    this.eat(TokenType.PROGRAM);
    const variable_node = this.variable();
    const program_name = variable_node.value;
    this.eat(TokenType.LINE_BREAK);

    // Handles `début\n` and `fin` tokens.
    // Also handles the variable declarations.
    const node = this.compound_statement();

    // Check if the program name matches.
    // Otherwise raise an exception.
    const end_variable_node = this.variable();
    if (end_variable_node.value !== program_name) {
      throw new Error(`Le nom du programme principal ne correspond pas à celui assigné au début (${program_name}).\nVérifiez que vous avez bien écrit "fin ${program_name}".\nValeur reçu: "fin ${end_variable_node.value}"`);
    }

    const program_node = new Program(program_name, node);
    return program_node;
  }

  private skip_newlines (): void {
    while (this.current_token?.type === TokenType.LINE_BREAK) {
      this.eat(TokenType.LINE_BREAK);
    }
  }

  private declarations () {
    // Handles `avec` token.
    this.eat(TokenType.VARIABLE_DECLARATION_BLOCK);
    this.skip_newlines();

    const declarations = this.variable_declaration();

    let is_in_declaration_block = true;
    while (is_in_declaration_block) {
      const current_pos = this.lexer.pos;
      const current_token = this.current_token;
      this.skip_newlines();

      try {
        declarations.push(...this.variable_declaration());
      }
      catch {
        this.lexer.goto(current_pos);
        this.current_token = current_token;
        is_in_declaration_block = false;
      }
    }

    return declarations;
  }

  private variable_declaration () {
    const var_nodes = [this.variable()];

    while (this.current_token?.type === TokenType.COMMA) {
      this.eat(TokenType.COMMA);
      var_nodes.push(this.variable());
    }

    this.eat(TokenType.COLON);

    const type_node = this.type_spec();
    const var_declarations = var_nodes.map((var_node) => new VariableDeclaration(var_node, type_node));
    return var_declarations;
  }

  private type_spec () {
    const token = this.current_token as IDToken;

    if (token.type === TokenType.INTEGER) {
      this.eat(TokenType.INTEGER);
    }
    else if (token.type === TokenType.REAL) {
      this.eat(TokenType.REAL);
    }
    else {
      throw new Error("Invalid type.");
    }

    return new Type(token);
  }

  /** compound_statement: début statement_list fin */
  private compound_statement () {
    this.eat(TokenType.BEGIN);
    this.eat(TokenType.LINE_BREAK);

    let declarations: VariableDeclaration[] = [];
    if (this.current_token?.type === TokenType.VARIABLE_DECLARATION_BLOCK) {
      declarations = this.declarations();
    }

    const nodes = this.statement_list();
    this.eat(TokenType.END);

    const root = new Compound();
    root.declared_variables = declarations;

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
      case TokenType.INTEGER_CONST:
        this.eat(TokenType.INTEGER_CONST);
        return new IntegerNumber(token as IntegerConstToken);
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
