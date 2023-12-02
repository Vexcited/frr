import type { EntierToken, BinaryOperationToken, IDToken, AssignToken } from "../lexer/tokens";

export class BinaryOperation {
  public type = "BinaryOperation";
  public token: BinaryOperationToken;

  constructor (public left: IntegerNumber | BinaryOperation | UnaryOperation | Variable, public operation: BinaryOperationToken, public right: IntegerNumber | BinaryOperation | UnaryOperation | Variable) {
    this.token = operation;
  }
}

export class IntegerNumber {
  public type = "IntegerNumber";
  public value: number;

  constructor (public token: EntierToken) {
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

/**
 * Represents a "début" and "fin `scope`" of a program.
 */
export class Compound {
  public type = "Compound";
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