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

import { IntegerNumber, BinaryOperation, UnaryOperation, type AST, Compound, NoOp, Variable, Assign, Program, Type, VariableDeclaration, RealNumber, StringConstant, GlobalScope, Procedure, ArgumentVariable, ProcedureCall } from "./nodes";

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

  private skip_newlines (): void {
    while (this.current_token?.type === TokenType.LINE_BREAK) {
      this.eat(TokenType.LINE_BREAK);
    }
  }

  /**
   * The global scope is the file/script itself.
   *
   * Can contain multiple functions and procedures,
   * but will also contain the main program.
   *
   * There can only be ONE program, but multiple functions and procedures.
   *
   * global_scope : program | function | procedure
   */
  private global_scope (): GlobalScope {
    if (!this.current_token) {
      throw new Error("Empty file");
    }

    let main_program: Program | undefined;
    const procedures: Procedure[] = [];

    this.skip_newlines(); // Skip every new lines before any scope token.

    const scope_tokens = [
      TokenType.PROCEDURE,
      TokenType.PROGRAM
    ];

    while (scope_tokens.includes(this.current_token.type)) {
      // Handle main program.
      if (this.current_token?.type === TokenType.PROGRAM) {
        if (main_program) {
          throw new Error("Il ne peut y avoir qu'un seul programme principal.");
        }

        main_program = this.program();
      }
      // Handle procedures.
      else if (this.current_token?.type === TokenType.PROCEDURE) {
        procedures.push(this.procedure());
      }
      else {
        throw new Error("Invalid scope token.");
      }

      // Skip new lines after the scope token.
      this.skip_newlines();
    }

    if (!main_program) {
      throw new Error("Il n'y a pas de programme principal.");
    }

    const node = new GlobalScope(main_program);
    node.procedures = procedures;
    return node;
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

  /** procedure: procédure `variable` ... */
  private procedure () {
    this.eat(TokenType.PROCEDURE);
    const variable_node = this.variable();
    const procedure_name = variable_node.value;
    let args: ArgumentVariable[] = [];

    this.eat(TokenType.LPAREN);
    // There's no arguments.
    if (this.current_token?.type === TokenType.RPAREN) {
      this.eat(TokenType.RPAREN);
    }
    // Parse every arguments.
    else {
      args = this.argument_variables();
      this.eat(TokenType.RPAREN);
    }

    // We expect a line break after the procedure definition.
    this.eat(TokenType.LINE_BREAK);

    const compound = this.compound_statement();

    // Check if the program name matches.
    // Otherwise raise an exception.
    const end_variable_node = this.variable();
    if (end_variable_node.value !== procedure_name) {
      throw new Error(`Le nom de la procédure ne correspond pas à celui assigné au début (${procedure_name}).\nVérifiez que vous avez bien écrit "fin ${procedure_name}".\nValeur reçu: "fin ${end_variable_node.value}"`);
    }

    const procedure_node = new Procedure(procedure_name, compound);
    procedure_node.args = args;

    return procedure_node;
  }

  /**
   * Any variable is done like "variable_name: type".
   * You can declare multiple variables at once like "a: entier, b: réel, c: entier".
   *
   * There can be a separator ";".
   * Everything before the separator is a COPY variable,
   * and everything after the separator is a REFERENCE variable.
   */
  private argument_variables (): Array<ArgumentVariable> {
    const current_method: "copy" | "reference" = "copy";
    const var_nodes = [this.argument_variable(current_method)];

    while (this.current_token?.type === TokenType.COMMA) {
      this.eat(TokenType.COMMA);
      var_nodes.push(this.argument_variable(current_method));
    }

    return var_nodes;
  }

  /** argument_variable: "VARIABLE : TYPE" */
  private argument_variable(current_method: "copy" | "reference"): ArgumentVariable {
    const var_node = this.variable();
    this.eat(TokenType.COLON);
    const type_node = this.type_spec();

    return new ArgumentVariable(var_node, type_node, current_method);
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

    // Skip any new lines after `début`.
    // Newlines may be inserted when writing a comment before
    // the variable declarations block.
    // Or people may just want to write their code on the next line.
    this.skip_newlines();

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
    if ( // Handle procedure calls.
      this.current_token?.type === TokenType.ID
      && this.lexer.current_char === "("
    ) {
      return this.procedure_call_statement();
    }
    else if (this.current_token?.type === TokenType.ID) {
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

  /** procedure_call_statement : ID LPAREN (expr (COMMA expr)*)? RPAREN */
  private procedure_call_statement (): ProcedureCall {
    const token = this.current_token as IDToken;

    const procedure_name = token.value;
    this.eat(TokenType.ID);
    this.eat(TokenType.LPAREN);

    const args: (
      BinaryOperation | IntegerNumber | UnaryOperation | Variable
    )[] = [];

    if (this.current_token?.type !== TokenType.RPAREN) {
      args.push(this.expr());
    }

    while (this.current_token?.type === TokenType.COMMA) {
      this.eat(TokenType.COMMA);
      args.push(this.expr());
    }

    this.eat(TokenType.RPAREN);

    const node = new ProcedureCall(procedure_name, args, token);
    return node;
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
    return this.global_scope();
  }
}
