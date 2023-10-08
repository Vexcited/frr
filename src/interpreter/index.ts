import type { AST, BinaryOperation, IntegerNumber, UnaryOperation } from "../ast/nodes";
import type { Parser } from "../ast";

class NodeVisitor {
  public visit (node: AST): number {
    switch (node.type) {
      case "BinaryOperation":
        return this.visitBinaryOperation(node as BinaryOperation);
      case "IntegerNumber":
        return this.visitIntegerNumber(node as IntegerNumber);
      case "UnaryOperation":
        return this.visitUnaryOperation(node as UnaryOperation);
      default:
        throw new Error("Invalid node type.");
    }
  }

  protected visitBinaryOperation (node: BinaryOperation): number {
    switch (node.token.type) {
      case "PLUS":
        return this.visit(node.left) + this.visit(node.right);
      case "MINUS":
        return this.visit(node.left) - this.visit(node.right);
      case "MUL":
        return this.visit(node.left) * this.visit(node.right);
      case "DIV":
      // Integer division.
        return Math.floor(this.visit(node.left) / this.visit(node.right));
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
}

export class Interpreter extends NodeVisitor {
  constructor (private parser: Parser) {
    super();
  }

  public interpret (): number {
    const tree = this.parser.parse();
    return this.visit(tree);
  }
}
