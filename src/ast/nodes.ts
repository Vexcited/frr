import type { IntegerConstToken, RealConstToken, BinaryOperationToken, IDToken, AssignToken } from "../lexer/tokens";

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

export class UnaryOperation {
  public type = "UnaryOperation";
  public token: BinaryOperationToken;

  constructor (public operation: BinaryOperationToken, public expr: IntegerNumber | BinaryOperation | UnaryOperation | Variable) {
    this.token = operation;
  }
}

export class Program {
  public type = "Program";

  constructor (
    public name: string,
    public compound: Compound
  ) {}
}

export class Block {
  public type = "Block";

  constructor (
    public declarations: VariableDeclaration[],
    public compound_statement: Compound
  ) {}
}

export class VariableDeclaration {
  constructor (
    public var_node : Variable,
    public type_node : Type
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
  public children: Omit<AST, "Compound">[] = [];
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

export type AST = BinaryOperation | IntegerNumber | UnaryOperation | Compound | Variable | Assign | NoOp;