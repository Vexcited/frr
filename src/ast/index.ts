import { Lexer } from "../lexer";

import {
  type Token, TokenType,

  IntegerConstToken,
  PlusToken,
  MinusToken,
  DivToken,
  MulToken,
  IDToken,
  AssignToken,
  RealConstToken,
  StringConstToken
} from "../lexer/tokens";

import { IntegerNumber, BinaryOperation, UnaryOperation, type AST, Compound, NoOp, Variable, Assign, Program, Type, VariableDeclaration, RealNumber, StringConstant } from "./nodes";

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
      throw new Error("Invalid syntax.\nCurrent token: " + this.current_token?.type + "\nExpected token: " + token_type);
    }
  }

  /** program: programme `variable` compound_statement `variable` */
  private program () {
    this.eat(TokenType.PROGRAM);
    const variable_node = this.variable();
    const program_name = variable_node.value;
    // We expect a line break after the program name.
    this.eat(TokenType.LINE_BREAK);

    const compound = this.compound_statement();

    // Check if the program name matches.
    // Otherwise raise an exception.
    const end_variable_node = this.variable();
    if (end_variable_node.value !== program_name) {
      throw new Error(`Le nom du programme principal ne correspond pas à celui assigné au début (${program_name}).\nVérifiez que vous avez bien écrit "fin ${program_name}".\nValeur reçu: "fin ${end_variable_node.value}"`);
    }

    const program_node = new Program(program_name, compound);
    return program_node;
  }

  private skip_newlines (): void {
    while (this.current_token?.type === TokenType.LINE_BREAK) {
      this.eat(TokenType.LINE_BREAK);
    }
  }

  /**
   * Handles variable declarations.
   * declarations : avec variable_declaration (variable_declaration)*
   */
  private declarations () {
    // Handles `avec` token.
    this.eat(TokenType.VARIABLE_DECLARATION_BLOCK);
    this.skip_newlines(); // It can be on same line as `avec`, but also on next line.

    // When an "avec" is used, we expect at least one variable declaration.
    const declarations = this.variable_declaration();

    let is_in_declaration_block = true;
    while (is_in_declaration_block) {
      const current_pos = this.lexer.pos;
      const current_token = this.current_token;

      // When we ended previous declaration, we expect one or multiple line breaks.
      this.skip_newlines();

      try {
        // Get every new variable declaration.
        declarations.push(...this.variable_declaration());
      }
      // Whenever we don't use a colon after an ID, we're not in a declaration block anymore.
      // So we need to go back to the previous token (end of declaration) and stop the loop.
      catch {
        this.lexer.goto(current_pos);
        this.current_token = current_token;
        is_in_declaration_block = false;
      }
    }

    return declarations;
  }

  /**
   * Handles variable declarations.
   * variable_declaration : ID (COMMA ID)* COLON type_spec
   */
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

  /**
   * Handles the type of a variable in the declaration block.
   * type_spec : entier | réel | chaîne
   */
  private type_spec () {
    const token = this.current_token as IDToken;

    if (token.type === TokenType.INTEGER) {
      this.eat(TokenType.INTEGER);
    }
    else if (token.type === TokenType.REAL) {
      this.eat(TokenType.REAL);
    }
    else if (token.type === TokenType.STRING) {
      this.eat(TokenType.STRING);
    }
    else {
      throw new Error("Invalid type.");
    }

    return new Type(token);
  }

  /**
   * Handles a compound statement.
   * compound_statement : avec statement_list fin
   */
  private compound_statement () {
    this.eat(TokenType.BEGIN);
    // Requires a line break after `début`.
    this.eat(TokenType.LINE_BREAK);

    // Handle the variable declarations if there are any.
    let declarations: VariableDeclaration[] = [];
    if (this.current_token?.type === TokenType.VARIABLE_DECLARATION_BLOCK) {
      declarations = this.declarations();
    }

    const nodes = this.statement_list();
    this.eat(TokenType.END);

    const root = new Compound();
    root.declared_variables = declarations;
    root.children = nodes;

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

      // @ts-expect-error : We moved to next token.
      // Check if the next token is the end of the program.
      if (this.current_token?.type === TokenType.END) break;

      results.push(this.statement());
    }

    if (this.current_token?.type !== TokenType.END) {
      throw new Error("Expected \"fin\".");
    }

    return results;
  }

  /**
   * Handles a statement in a program (TODO: or a function or procedure).
   */
  private statement (): AST {
    if (this.current_token?.type === TokenType.ID) {
      return this.assignment_statement();
    }
    else {
      return this.empty();
    }
  }

  /** assignment_statement : variable <- expr */
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

  /**
   * Handles the variable node.
   * variable: ID
   */
  private variable (): Variable {
    const node = new Variable(this.current_token as IDToken);
    this.eat(TokenType.ID);
    return node;
  }

  /** empty : <no_op> */
  private empty (): AST {
    return new NoOp();
  }

  /**
   * factor : PLUS factor
   *        | MINUS factor
   *        | INTEGER_CONST
   *        | REAL_CONST
   *        | LPAREN expr RPAREN
   *        | variable
   */
  private factor (): BinaryOperation | IntegerNumber | RealNumber | UnaryOperation | Variable {
    const token = this.current_token!;

    switch (token.type) {
      // PLUS factor
      case TokenType.PLUS:
        this.eat(TokenType.PLUS);
        return new UnaryOperation(token as PlusToken, this.factor() as IntegerNumber | RealNumber | BinaryOperation | UnaryOperation);
      // MINUS factor
      case TokenType.MINUS:
        this.eat(TokenType.MINUS);
        return new UnaryOperation(token as MinusToken, this.factor() as IntegerNumber | RealNumber | BinaryOperation | UnaryOperation);

      // INTEGER_CONST | REAL_CONST
      case TokenType.INTEGER_CONST:
        this.eat(TokenType.INTEGER_CONST);
        return new IntegerNumber(token as IntegerConstToken);
      case TokenType.REAL_CONST:
        this.eat(TokenType.REAL_CONST);
        return new RealNumber(token as RealConstToken);

      // LPAREN expr RPAREN
      case TokenType.LPAREN: {
        this.eat(TokenType.LPAREN);
        const node = this.expr();
        this.eat(TokenType.RPAREN);
        return node;
      }

      case TokenType.STRING_CONST:
        this.eat(TokenType.STRING_CONST);
        return new StringConstant(token as StringConstToken);
    }

    // If the token is not one of the above types, it must be a variable.
    return this.variable();
  }

  /** term : factor ((MUL | DIV | MOD) factor)* */
  private term (): BinaryOperation | IntegerNumber | UnaryOperation | Variable {
    let node = this.factor();

    while (this.current_token?.type && [TokenType.MUL, TokenType.DIV, TokenType.MOD].includes(this.current_token.type)) {
      const token = this.current_token as MulToken | DivToken;

      // Handle multiplications in the expression.
      if (token.type === TokenType.MUL) {
        this.eat(TokenType.MUL);
      }
      // Handle integer divisions in the expression.
      else if (token.type === TokenType.DIV) {
        this.eat(TokenType.DIV);
      }
      // Handle modulo in the expression.
      else if (token.type === TokenType.MOD)  {
        this.eat(TokenType.MOD);
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
