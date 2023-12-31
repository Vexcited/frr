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
  StringConstToken,
  CharConstToken,
  BooleanConstToken,
  EqualToken,
  NotEqualToken,
  LessThanToken,
  GreaterThanToken,
  GreaterThanOrEqualToken,
  LessThanOrEqualToken,
  ModToken,
  NotToken
} from "../lexer/tokens";

import { IntegerNumber, BinaryOperation, UnaryOperation, type AST, Compound, NoOp, Variable, Assign, Program, Type, VariableDeclaration, RealNumber, StringConstant, GlobalScope, Procedure, ArgumentVariable, ProcedureCall, CharConstant, BooleanConstant, If, While, For, DoWhile, FunctionNode, Return, FunctionCall } from "./nodes";

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
      throw new Error(`Erreur de syntaxe (${this.lexer.pos_line}:${this.lexer.pos_column}).\nCurrent token: ` + this.current_token?.type + "\nExpected token: " + token_type);
    }
  }

  /**
   * Eats every new lines until it reaches a
   * token that is not a new line.
   */
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
    const functions: FunctionNode[] = [];

    this.skip_newlines(); // Skip every new lines before any scope token.

    const scope_tokens = [
      TokenType.PROCEDURE,
      TokenType.FUNCTION,
      TokenType.PROGRAM
    ];

    while (scope_tokens.includes(this.current_token.type)) {
      switch (this.current_token.type) {
        case TokenType.PROGRAM:
          if (main_program) {
            throw new Error("Il ne peut y avoir qu'un seul programme principal.");
          }

          main_program = this.program();
          break;
        case TokenType.FUNCTION:
          functions.push(this.function());
          break;
        case TokenType.PROCEDURE:
          procedures.push(this.procedure());
          break;
      }

      // Skip new lines after the scope token.
      this.skip_newlines();
    }

    if (!main_program) {
      throw new Error("Il n'y a pas de programme principal.");
    }

    const node = new GlobalScope(
      main_program,
      functions,
      procedures
    );

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

  /** function: fonction `variable` (...) retourne type_spec */
  private function () {
    this.eat(TokenType.FUNCTION);
    const variable_node = this.variable();
    const function_name = variable_node.value;

    this.eat(TokenType.LPAREN);
    // Parse every arguments.
    const args = this.argument_variables();
    this.eat(TokenType.RPAREN);

    this.eat(TokenType.RETURNS);
    const return_type = this.type_spec();

    // We expect a line break after the function definition.
    this.skip_newlines();

    const compound = this.compound_statement();

    // Check if the program name matches.
    // Otherwise raise an exception.
    const end_variable_node = this.variable();
    if (end_variable_node.value !== function_name) {
      throw new Error(`Le nom de la fonction ne correspond pas à celui assigné au début (${function_name}).\nVérifiez que vous avez bien écrit "fin ${function_name}".\nValeur reçu: "fin ${end_variable_node.value}"`);
    }

    const function_node = new FunctionNode(function_name, return_type, compound);
    function_node.args = args;

    return function_node;
  }

  /** procedure: procédure `variable` (...) */
  private procedure () {
    this.eat(TokenType.PROCEDURE);
    const variable_node = this.variable();
    const procedure_name = variable_node.value;

    this.eat(TokenType.LPAREN);
    // Parse every arguments.
    const args = this.argument_variables();
    this.eat(TokenType.RPAREN);

    // We expect a line break after the procedure definition.
    this.skip_newlines();

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
    const var_nodes: ArgumentVariable[] = [];

    const readArgumentsAndAppend = (method: "copy" | "reference", endToken: TokenType[]) => {
      if (!this.current_token) throw new Error("Unexpected end of file.");

      if (!endToken.includes(this.current_token.type)) {
        var_nodes.push(this.argument_variable(method));
      }

      while (this.current_token?.type === TokenType.COMMA) {
        this.eat(TokenType.COMMA);
        var_nodes.push(this.argument_variable(method));
      }
    };

    // SEMI_COLON can be an open token if there's no copy variables.
    readArgumentsAndAppend("copy", [
      TokenType.RPAREN,
      TokenType.SEMI_COLON
    ]);

    if (this.current_token?.type === TokenType.SEMI_COLON) {
      this.eat(TokenType.SEMI_COLON);
      readArgumentsAndAppend("reference", [
        TokenType.RPAREN
      ]);
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
   * type_spec : entier | réel | chaîne | (caractère | car)
   */
  private type_spec () {
    const token = this.current_token as IDToken;

    switch (token.type) {
      case TokenType.INTEGER:
        this.eat(TokenType.INTEGER);
        break;
      case TokenType.REAL:
        this.eat(TokenType.REAL);
        break;
      case TokenType.STRING:
        this.eat(TokenType.STRING);
        break;
      case TokenType.CHAR:
        this.eat(TokenType.CHAR);
        break;
      case TokenType.BOOLEAN:
        this.eat(TokenType.BOOLEAN);
        break;
      default:
        throw new Error(`Le type que vous avez fourni à votre variable est incorrecte.\nType à corriger : "${token.value}"`);
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

  /**
   * statement_list : (statement)*
   *
   * Handles statements until it reaches an END token or an
   * ELSE token (if it's inside an IF statement -> `insideIf === true`).
   */
  private statement_list (end = [TokenType.END]): Array<AST> {
    const results = [];

    // After the first statement, we expect the token to be a line break.
    // So we can loop on every statement until we reach the end of the program.
    const isStatementsEnd = () => {
      // If there's no current token, we reached the end of the program.
      if (!this.current_token) return true;
      return end.includes(this.current_token.type);
    };

    while (!isStatementsEnd()) {
      // Eat every newline token between statements.
      this.skip_newlines();

      // Check if the next token is the end of the statement list.
      if (isStatementsEnd()) break;

      results.push(this.statement());
    }

    return results;
  }

  /**
   * Handles a statement in a program. A statement can be:
   * - assignments
   * - procedure calls **with parenthesis**
   * - builtin procedure calls **that doesn't require parenthesis**
   * - a return statement
   */
  private statement (): AST {
    switch (this.current_token?.type) {
      case TokenType.ID:
        // We handle the assignment statement,
        // should be checked before the procedure call statement.
        if (this.lexer.peekAfterWhiteSpaces() === "<") {
          return this.assignment_statement();
        }

        // Only those two procedures don't require parenthesis.
        if (this.current_token.value === "afficher" || this.current_token.value === "saisir") {
          return this.procedure_call_statement();
        }

        // Otherwise, we expect parenthesis.
        if (this.lexer.peekAfterWhiteSpaces() === "(") {
          return this.procedure_call_statement();
        }

        break;
      case TokenType.IF:
        return this.if_statement();
      case TokenType.WHILE:
        return this.while_statement();
      case TokenType.FOR:
        return this.for_statement();
      case TokenType.REPEAT:
        return this.do_while_statement();
      case TokenType.RETURNS:
        return this.return_statement();
    }

    return this.empty();
  }

  /** assignment_statement : variable <- expr */
  private assignment_statement (): Assign {
    const left = this.variable();
    // We keep the variable ID token to pass it in `Assign` node.
    const assign_token = this.current_token as AssignToken;

    // Assign sign `<-`.
    this.eat(TokenType.ASSIGN);

    // Value of the variable.
    const right = this.expr();

    return new Assign(left, assign_token, right);
  }

  /** procedure_call_statement : ID LPAREN (expr (COMMA expr)*)? RPAREN */
  private procedure_call_statement (): ProcedureCall {
    const token = this.current_token as IDToken;

    const procedure_name = token.value;
    this.eat(TokenType.ID);

    /**
     * `afficher` and `saisir` are the only procedures
     * that don't require parenthesis.
     *
     * Even though, you can still use parenthesis with them.
     */
    const shouldSkipParenthesis = procedure_name === "saisir" || procedure_name === "afficher";

    if (!shouldSkipParenthesis || (shouldSkipParenthesis && this.current_token?.type === TokenType.LPAREN))
      this.eat(TokenType.LPAREN);

    const args: (
      BinaryOperation | IntegerNumber | UnaryOperation | Variable
      | CharConstant | StringConstant | BooleanConstant | FunctionCall
    )[] = [];

    const readArgumentsAndAppend = (additionalEndToken?: TokenType) => {
      if (!this.current_token) throw new Error("Unexpected end of file.");
      const endTokens = [];

      if (additionalEndToken) endTokens.push(additionalEndToken);
      if (!shouldSkipParenthesis) endTokens.push(TokenType.RPAREN);

      if (!endTokens.includes(this.current_token.type)) {
        args.push(this.expr());
      }

      while (this.current_token?.type === TokenType.COMMA) {
        this.eat(TokenType.COMMA);
        args.push(this.expr());
      }
    };

    readArgumentsAndAppend(TokenType.SEMI_COLON);

    if (this.current_token?.type === TokenType.SEMI_COLON) {
      this.eat(TokenType.SEMI_COLON);
      readArgumentsAndAppend();
    }

    if (!shouldSkipParenthesis || (shouldSkipParenthesis && this.current_token?.type === TokenType.RPAREN))
      this.eat(TokenType.RPAREN);

    const node = new ProcedureCall(procedure_name, args, token);
    return node;
  }

  private function_call_statement (variable_node: Variable): FunctionCall {
    const token = variable_node.token;
    const function_name = token.value;

    const args: (
      FunctionCall | BinaryOperation | IntegerNumber | UnaryOperation | Variable
      | CharConstant | StringConstant | BooleanConstant
    )[] = [];

    const readArgumentsAndAppend = (additionalEndToken?: TokenType) => {
      if (!this.current_token) throw new Error("Unexpected end of file.");
      const endTokens = [TokenType.RPAREN];

      if (additionalEndToken) endTokens.push(additionalEndToken);

      if (!endTokens.includes(this.current_token.type)) {
        args.push(this.expr());
      }

      while (this.current_token?.type === TokenType.COMMA) {
        this.eat(TokenType.COMMA);
        args.push(this.expr());
      }
    };

    readArgumentsAndAppend(TokenType.SEMI_COLON);

    if (this.current_token?.type === TokenType.SEMI_COLON) {
      this.eat(TokenType.SEMI_COLON);
      readArgumentsAndAppend();
    }

    if (this.current_token?.type === TokenType.RPAREN)
      this.eat(TokenType.RPAREN);

    const node = new FunctionCall(function_name, args, token);
    return node;
  }

  /**
   * if_statement : SI expr ALORS statement_list (SINON statement_list)? FIN SI
   */
  private if_statement (): If {
    this.eat(TokenType.IF);
    const condition = this.expr();

    // Possible to add a newline before the `then` token.
    this.skip_newlines();
    this.eat(TokenType.THEN);

    const main_statements = this.statement_list([
      TokenType.END, // If we see `fin si`, we stop the statement list.
      TokenType.ELSE // If we see `sinon`, we also stop the statement list.
    ]);

    let else_statements: AST[] | undefined;
    if (this.current_token?.type === TokenType.ELSE) {
      this.eat(TokenType.ELSE);
      else_statements = this.statement_list();
    }

    const node = new If(
      condition,
      main_statements,
      else_statements
    );

    this.eat(TokenType.END);
    this.eat(TokenType.IF);

    return node;
  }

  private for_statement (): For {
    this.eat(TokenType.FOR);
    const variable = this.variable();
    this.eat(TokenType.FROM);
    const from = this.expr();
    this.eat(TokenType.TO);
    const to = this.expr();

    let step: IntegerNumber | undefined;
    if (this.current_token?.type === TokenType.STEP) {
      this.eat(TokenType.STEP);
      step = this.expr() as IntegerNumber;
    }

    this.eat(TokenType.DO);

    const statements = this.statement_list();

    this.eat(TokenType.END);
    this.eat(TokenType.DO);

    // Prevent booleans.
    if (from instanceof BooleanConstant || to instanceof BooleanConstant) {
      throw new Error("Les booléens ne sont pas autorisés dans une boucle POUR.");
    }
    // Prevent strings.
    else if (from instanceof StringConstant || to instanceof StringConstant) {
      throw new Error("Les chaînes de caractères ne sont pas autorisés dans une boucle POUR.");
    }

    const node = new For(
      variable,
      from,
      to,
      step,
      statements
    );

    return node;
  }

  private while_statement (): While {
    this.eat(TokenType.WHILE);

    const condition = this.expr();

    // Possible to add a newline before the `then` token.
    this.skip_newlines();
    this.eat(TokenType.DO);

    const statements = this.statement_list();

    this.eat(TokenType.END);
    this.eat(TokenType.DO);

    const node = new While(condition, statements);
    return node;
  }

  private do_while_statement (): DoWhile {
    this.eat(TokenType.REPEAT);
    const statements = this.statement_list([
      TokenType.WHILE // End the statement when we see "tant que".
    ]);

    this.eat(TokenType.WHILE);
    const condition = this.expr();

    const node = new DoWhile(condition, statements);
    return node;
  }

  private return_statement (): Return {
    this.eat(TokenType.RETURNS);
    const expr = this.expr();

    const node = new Return(expr);
    return node;
  }

  /**
   * Handles the variable node.
   * variable: ID
   */
  private variable (): Variable {
    if (this.current_token?.type !== TokenType.ID) {
      throw new Error(`Erreur<ast.variable> de syntaxe.\ndebug: ID != ${this.current_token?.type} ?`);
    }

    const node = new Variable(this.current_token as IDToken);
    this.eat(TokenType.ID);
    return node;
  }

  /** empty : <no_op> */
  private empty (): AST {
    return new NoOp();
  }

  /**
   * Handles the factor of an expression.
   * Such as unary operations, numbers, parenthesis, etc.
   */
  private factor (): FunctionCall | BinaryOperation | IntegerNumber | RealNumber | UnaryOperation | Variable | CharConstant | StringConstant | BooleanConstant {
    this.skip_newlines();
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

      case TokenType.NOT:
        this.eat(TokenType.NOT);
        return new UnaryOperation(token as NotToken, this.factor() as IntegerNumber | RealNumber | BinaryOperation | UnaryOperation);

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

        // Possible to add a newline before the closing parenthesis.
        this.skip_newlines();

        this.eat(TokenType.RPAREN);
        return node;
      }

      // STRING_CONST
      case TokenType.STRING_CONST:
        this.eat(TokenType.STRING_CONST);
        return new StringConstant(token as StringConstToken);

      // CHAR_CONST
      case TokenType.CHAR_CONST:
        this.eat(TokenType.CHAR_CONST);
        return new CharConstant(token as CharConstToken);

      // BOOLEAN_CONST
      case TokenType.BOOLEAN_CONST:
        this.eat(TokenType.BOOLEAN_CONST);
        return new BooleanConstant(token as BooleanConstToken);
    }

    const identifier = this.variable();

    // Handle function call assignments.
    if (this.current_token?.type === TokenType.LPAREN) {
      this.eat(TokenType.LPAREN);
      return this.function_call_statement(identifier);
    }

    return identifier;
  }

  /** term : factor ((MUL | DIV | MOD) factor)* */
  private term (): FunctionCall | BinaryOperation | IntegerNumber | UnaryOperation | Variable | CharConstant | StringConstant | BooleanConstant {
    let node = this.factor();

    while (this.current_token?.type && [
      // Arithmetic operations.
      TokenType.MUL,                   // 1 * 2
      TokenType.DIV,                   // 1 / 2
      TokenType.MOD,                   // 1 % 2
      // Comparison operations.
      TokenType.EQUAL,                 // 1 = 2
      TokenType.NOT_EQUAL,             // 1 != 2
      TokenType.GREATER_THAN,          // 1 > 2
      TokenType.LESS_THAN,             // 1 < 2
      TokenType.GREATER_THAN_OR_EQUAL, // 1 >= 2
      TokenType.LESS_THAN_OR_EQUAL     // 1 <= 2
      // TODO: TokenType.AND,          // 1 et 2
      // TODO: TokenType.OR,           // 1 ou 2
    ].includes(this.current_token.type)) {
      const token = this.current_token as (
        MulToken | DivToken | ModToken
        | EqualToken | NotEqualToken | LessThanToken | GreaterThanToken
        | LessThanOrEqualToken | GreaterThanOrEqualToken
      );

      this.eat(token.type);
      node = new BinaryOperation(node, token, this.factor());
    }

    return node;
  }

  /**
   * Handle any expression.
   */
  private expr (): BinaryOperation | IntegerNumber | UnaryOperation | Variable | CharConstant | StringConstant | BooleanConstant | FunctionCall {
    let node = this.term();

    while (this.current_token?.type && [TokenType.PLUS, TokenType.MINUS].includes(this.current_token.type)) {
      const token = this.current_token as PlusToken | MinusToken;

      this.eat(token.type);
      node = new BinaryOperation(node, token, this.term());
    }

    return node;
  }

  public parse (): AST {
    return this.global_scope();
  }
}
