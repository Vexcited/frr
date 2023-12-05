import { AST, Assign, BinaryOperation, Compound, Program, UnaryOperation, Variable, VariableDeclaration } from "../ast/nodes";
import { UndeclaredVariableError } from "../errors/variables";
import { VarSymbol } from "./builtins";
import SymbolTable from "./table";

class SymbolTableBuilder {
  public symbol_table = new SymbolTable();

  public visit (node: AST): void {
    switch (node.type) {
      case "Program":
        return this.visitProgram(node as Program);
      case "BinaryOperation":
        return this.visitBinaryOperation(node as BinaryOperation);
      case "UnaryOperation":
        return this.visitUnaryOperation(node as UnaryOperation);
      case "Compound":
        return this.visitCompound(node as Compound);
      case "VariableDeclaration":
        return this.visitVariableDeclaration(node as VariableDeclaration);
      case "Assign":
        return this.visitAssign(node as Assign);
      case "Variable":
        return this.visitVariable(node as Variable);
      // All those are not handled by the symbol table.
      case "IntegerNumber":
      case "RealNumber":
      case "NoOp":
      case "Type":
        return;
      default:
        throw new Error("Invalid node type.\nNode received: " + node.type);
    }
  }

  private visitProgram (node: Program): void {
    this.visit(node.compound);
  }

  private visitBinaryOperation (node: BinaryOperation): void {
    this.visit(node.left);
    this.visit(node.right);
  }

  private visitUnaryOperation (node: UnaryOperation): void {
    this.visit(node.expr);
  }

  private visitCompound (node: Compound): void {
    // Handle every variable declarations made.
    for (const declaration of node.declared_variables) {
      this.visit(declaration);
    }

    // Handle every statements made.
    for (const child of node.children) {
      this.visit(child);
    }
  }

  private visitVariableDeclaration (node: VariableDeclaration): void {
    const type_name = node.type_node.value;
    const type_symbol = this.symbol_table.lookup(type_name);

    if (!type_symbol) {
      throw new Error(`Type ${type_name} not found.`);
    }

    const var_name = node.var_node.value;
    const var_symbol = new VarSymbol(var_name, type_name);

    this.symbol_table.define(var_symbol);
  }

  private visitAssign (node: Assign): void {
    const var_name = node.left.value;
    const var_symbol = this.symbol_table.lookup(var_name);

    if (!var_symbol) {
      throw new UndeclaredVariableError(var_name);
    }

    this.visit(node.right);
  }

  private visitVariable (node: Variable): void {
    const var_name = node.value;
    const var_symbol = this.symbol_table.lookup(var_name);

    if (!var_symbol) {
      throw new UndeclaredVariableError(var_name);
    }
  }
}

export default SymbolTableBuilder;