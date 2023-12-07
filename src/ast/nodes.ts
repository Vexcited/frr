import type { IntegerConstToken, RealConstToken, BinaryOperationToken, IDToken, AssignToken, StringConstToken } from "../lexer/tokens";

export class BinaryOperation {
  public type = "BinaryOperation";
  public token: BinaryOperationToken;

  constructor (
    public left: IntegerNumber | RealNumber | BinaryOperation | UnaryOperation | Variable,
    public operation: BinaryOperationToken,
    public right: IntegerNumber | RealNumber | BinaryOperation | UnaryOperation | Variable
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

export class Procedure {
  public type = "Procedure";
  public args: VariableDeclaration[] = [];

  constructor (
    public name: string,
    public compound: Compound
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

  constructor (public token: IDToken) {
    this.value = token.value;
  }
}

/** Used to represent an empty statement. */
export class NoOp {
  public type = "NoOp";
}

export type AST = BinaryOperation | IntegerNumber | RealNumber | Program | Type | VariableDeclaration | UnaryOperation | Compound | Variable | Assign | NoOp | StringConstant;