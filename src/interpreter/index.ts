import type { AST, Assign, BinaryOperation, Compound, IntegerNumber, Program, RealNumber, StringConstant, UnaryOperation, Variable } from "../ast/nodes";
import { TokenType } from "../lexer/tokens";

class Interpreter {
  public GLOBAL_SCOPE: Record<string, unknown> = {};

  public visit (node: AST) {
    switch (node.type) {
      case "Program":
        return this.visitProgram(node as Program);
      case "BinaryOperation":
        return this.visitBinaryOperation(node as BinaryOperation);
      case "IntegerNumber":
      case "RealNumber":
        return this.visitNumber(node as IntegerNumber | RealNumber);
      case "UnaryOperation":
        return this.visitUnaryOperation(node as UnaryOperation);
      case "Compound":
        return this.visitCompound(node as Compound);
      case "Assign":
        return this.visitAssign(node as Assign);
      case "Variable":
        return this.visitVariable(node as Variable);
      case "StringConstant":
        return this.visitStringConstant(node as StringConstant);
      // All those are not handled by the interpreter.
      case "VariableDeclaration":
      case "NoOp":
      case "Type":
        return;
      default:
        throw new Error("Invalid node type.\nNode received: " + node.type);
    }
  }

  protected visitProgram (node: Program): void {
    this.visit(node.compound);
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

  protected visitNumber (node: IntegerNumber | RealNumber): number {
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
    // Handle every variable declarations made.
    for (const declaration of node.declared_variables) {
      this.visit(declaration);
    }

    // Handle every statements made.
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

  private visitStringConstant (node: StringConstant): string {
    return node.value;
  }

  public interpret (tree: AST) {
    this.visit(tree);
    return this.GLOBAL_SCOPE;
  }
}

export default Interpreter;
