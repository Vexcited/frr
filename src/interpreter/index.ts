import type { AST, Assign, BinaryOperation, Compound, IntegerNumber, UnaryOperation, Variable } from "../ast/nodes";
import type { Parser } from "../ast";
import { TokenType } from "../lexer/tokens";

class NodeVisitor {
  public GLOBAL_SCOPE: Record<string, unknown> = {};

  public visit (node: AST): number | void {
    switch (node.type) {
      case "BinaryOperation":
        return this.visitBinaryOperation(node as BinaryOperation);
      case "IntegerNumber":
        return this.visitIntegerNumber(node as IntegerNumber);
      case "UnaryOperation":
        return this.visitUnaryOperation(node as UnaryOperation);
      case "Compound":
        return this.visitCompound(node as Compound);
      case "NoOp":
        return this.visitNoOp();
      case "Assign":
        return this.visitAssign(node as Assign);
      case "Variable":
        return this.visitVariable(node as Variable);
      default:
        throw new Error("Invalid node type.");
    }
  }

  protected visitBinaryOperation (node: BinaryOperation): number {
    switch (node.token.type) {
      case TokenType.PLUS:
        return (this.visit(node.left) as number) + (this.visit(node.right) as number);
      case TokenType.MINUS:
        return (this.visit(node.left) as number) - (this.visit(node.right) as number);
      case TokenType.MUL:
        return (this.visit(node.left) as number) * (this.visit(node.right) as number);
      case TokenType.DIV:
        // Integer division.
        return Math.floor((this.visit(node.left) as number) / (this.visit(node.right) as number));
      default:
        throw new Error("Invalid token type.");
    }
  }

  protected visitIntegerNumber (node: IntegerNumber): number {
    return node.value;
  }

  protected visitUnaryOperation (node: UnaryOperation): number {
    switch (node.token.type) {
      case "PLUS":
        return +this.visit(node.expr);
      case "MINUS":
        return -this.visit(node.expr);
      default:
        throw new Error("Invalid token type.");
    }
  }

  protected visitCompound (node: Compound): void {
    for (const child of node.children) {
      this.visit(child);
    }
  }

  protected visitNoOp (): void {
    // Do nothing.
  }

  protected visitAssign (node: Assign): void {
    const variableName = node.left.value;
    this.GLOBAL_SCOPE[variableName] = this.visit(node.right);
  }

  protected visitVariable (node: Variable): number {
    const variableName = node.value;
    const value = this.GLOBAL_SCOPE[variableName];

    if (typeof value === "undefined") {
      throw new Error(`Variable ${variableName} is not defined.`);
    }

    return value as number;
  }
}

export class Interpreter extends NodeVisitor {
  constructor (private parser: Parser) {
    super();
  }

  public interpret () {
    const tree = this.parser.parse();
    this.visit(tree);

    return this.GLOBAL_SCOPE;
  }
}
