import { AST, Assign, BinaryOperation, Compound, Program, UnaryOperation, Variable, VariableDeclaration } from "../ast/nodes";
import { TypeOperationError, TypeOperationVariableError } from "../errors/math";
import { UndeclaredVariableTypeError } from "../errors/variables";
import { TokenType } from "../lexer/tokens";
import { VarSymbol } from "./builtins";
import SymbolTable from "./table";

class SymbolTableBuilder {
  public symbol_table = new SymbolTable();

  public visit (node: AST) {
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
      case "StringConstant":
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
    switch (node.operation.type) {
      /**
       * Concerning the "*", "/", "-" and "mod" operations, we can only
       * perform them on numbers.
       *
       * Performing them on strings should throw an error.
       */
      case TokenType.MUL:
      case TokenType.DIV:
      case TokenType.MOD:
      case TokenType.MINUS: {
        const operation = node.operation.type as (
          | TokenType.MUL
          | TokenType.DIV
          | TokenType.MOD
          | TokenType.MINUS
        );

        // When one of the operands is a string, we throw an error.
        if (node.left.type === "StringConstant" || node.right.type === "StringConstant") {
          throw new TypeOperationError(operation);
        }

        // We manually visit the variable to check if it's a string.
        if (node.left.type === "Variable") {
          const node_left = node.left as Variable;

          const var_symbol = this.visitVariable(node_left);
          if (var_symbol.type === "chaîne") {
            throw new TypeOperationVariableError(node_left, operation);
          }
        }
        // It's not a variable, we can visit it normally.
        else this.visit(node.left);

        // We manually visit the variable to check if it's a string.
        if (node.right.type === "Variable") {
          const node_right = node.right as Variable;

          const var_symbol = this.visitVariable(node_right);
          if (var_symbol.type === "chaîne") {
            throw new TypeOperationVariableError(node_right, operation);
          }
        }
        // It's not a variable, we can visit it normally.
        else this.visit(node.right);

        break;
      }
      /**
       * When it's a "+" operation, we can have
       * operations with every numbers but also strings.
       */
      case TokenType.PLUS:
        this.visit(node.left);
        this.visit(node.right);
    }
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
      throw new UndeclaredVariableTypeError(var_name);
    }

    this.visit(node.right);
  }

  /**
   * Returns the symbol of the variable.
   * Not handled when the variable is not declared.
   */
  private visitVariable (node: Variable) {
    const var_name = node.value;
    const var_symbol = this.symbol_table.lookup(var_name);

    if (!var_symbol) {
      throw new UndeclaredVariableTypeError(var_name);
    }

    return var_symbol;
  }
}

export default SymbolTableBuilder;