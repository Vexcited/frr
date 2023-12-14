import type { IntegerConstToken, RealConstToken, BinaryOperationToken, IDToken, AssignToken, StringConstToken, CharConstToken, BooleanConstToken } from "../lexer/tokens";
import { ProcedureSymbol, VarSymbol } from "../symbols/builtins";

export class BinaryOperation {
  public type = "BinaryOperation";
  public token: BinaryOperationToken;

  constructor (
    public left: IntegerNumber | RealNumber | BinaryOperation | UnaryOperation | Variable | StringConstant | CharConstant | BooleanConstant,
    public operation: BinaryOperationToken,
    public right: IntegerNumber | RealNumber | BinaryOperation | UnaryOperation | Variable | StringConstant | CharConstant | BooleanConstant
  ) {
    this.token = operation;
  }
}

export class IntegerNumber {
  public type = "IntegerNumber";
  public value: number;

  constructor (public token: IntegerConstToken) {
    this.value = token.value;
  }
}

export class RealNumber {
  public type = "RealNumber";
  public value: number;

  constructor (public token: RealConstToken) {
    this.value = token.value;
  }
}

export class StringConstant {
  public type = "StringConstant";
  public value: string;

  constructor (public token: StringConstToken) {
    this.value = token.value;
  }
}

export class CharConstant {
  public type = "CharConstant";
  public value: string;

  constructor (public token: CharConstToken) {
    this.value = token.value;
  }
}

export class BooleanConstant {
  public type = "BooleanConstant";
  public value: boolean;

  constructor (public token: BooleanConstToken) {
    this.value = token.value;
  }
}

export class UnaryOperation {
  public type = "UnaryOperation";
  public token: BinaryOperationToken;

  constructor (public operation: BinaryOperationToken, public expr: IntegerNumber | BinaryOperation | UnaryOperation | Variable) {
    this.token = operation;
  }
}

export class GlobalScope {
  public type = "GlobalScope";
  public functions: unknown[] = [];
  public procedures: Procedure[] = [];

  constructor (
    public program: Program
  ) {}
}

export class Program {
  public type = "Program";

  constructor (
    public name: string,
    public compound: Compound
  ) {}
}

export class If {
  public type = "If";

  constructor (
    public condition: BinaryOperation | IntegerNumber | UnaryOperation | Variable | CharConstant | StringConstant | BooleanConstant,
    public main_statements: AST[] = [],
    public else_statements: AST[] = []
  ) {}
}

export class Procedure {
  public type = "Procedure";
  public args: ArgumentVariable[] = [];

  constructor (
    public name: string,
    public compound: Compound
  ) {}
}

export class ProcedureCall {
  public type = "ProcedureCall";

  /** The symbol of the procedure being called. */
  public symbol_from_syntax_analyzer?: ProcedureSymbol;

  constructor (
    public name: string,
    public args: (BinaryOperation | IntegerNumber | UnaryOperation | Variable | CharConstant | StringConstant | BooleanConstant)[],
    public token: IDToken
  ) {}
}

export class ArgumentVariable {
  public type = "ArgumentVariable";

  constructor (
    public var_node: Variable,
    public type_node: Type,
    public method: "copy" | "reference"
  ) {}
}

export class VariableDeclaration {
  public type = "VariableDeclaration";

  constructor (
    public var_node: Variable,
    public type_node: Type
  ) {}
}

export class Type {
  public type = "Type";
  public value: string;

  constructor (public token: IDToken) {
    this.value = token.value;
  }
}

/**
 * Represents a "début" and "fin `scope_name`".
 */
export class Compound {
  public type = "Compound";
  public declared_variables: VariableDeclaration[] = [];
  public children: Omit<AST, "Compound" | "VariableDeclaration">[] = [];
}

export class Assign {
  public type = "Assign";
  public token: AssignToken;

  constructor (public left: Variable, public op: AssignToken, public right: AST) {
    this.token = op;
  }
}

export class Variable {
  public type = "Variable";
  public value: string;

  /** The symbol of the procedure being called. */
  public symbol_from_syntax_analyzer?: VarSymbol;

  constructor (public token: IDToken) {
    this.value = token.value;
  }
}

export class While {
  public type = "While";

  constructor (
    public condition: BinaryOperation | IntegerNumber | UnaryOperation | Variable | CharConstant | StringConstant | BooleanConstant,
    public statements: AST[] = []
  ) {}
}

export class For {
  public type = "For";

  constructor (
    public variable: Variable,
    public start: IntegerNumber | Variable | BinaryOperation | UnaryOperation | CharConstant,
    public end: IntegerNumber | Variable | BinaryOperation | UnaryOperation | CharConstant,
    public step?: IntegerNumber | Variable | BinaryOperation | UnaryOperation | CharConstant, // Defaults to 1 in interpreter.
    public statements: AST[] = []
  ) {}
}

export class DoWhile {
  public type = "DoWhile";

  constructor (
    public condition: BinaryOperation | IntegerNumber | UnaryOperation | Variable | CharConstant | StringConstant | BooleanConstant,
    public statements: AST[] = []
  ) {}
}

/** Used to represent an empty statement. */
export class NoOp {
  public type = "NoOp";
}

export type AST = BinaryOperation | IntegerNumber | RealNumber | Program | Type | VariableDeclaration | UnaryOperation | Compound | Variable | Assign | NoOp | StringConstant | CharConstant | BooleanConstant;