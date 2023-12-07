import type { AST, Assign, BinaryOperation, Compound, GlobalScope, IntegerNumber, ProcedureCall, Program, RealNumber, StringConstant, UnaryOperation, Variable } from "../ast/nodes";
import { TokenType } from "../lexer/tokens";
import { ActivationRecord, ActivationRecordType, CallStack } from "./stack";

class Interpreter {
  public call_stack = new CallStack();

  private visit (node: AST) {
    switch (node.type) {
      case "GlobalScope":
        return this.visitGlobalScope(node as GlobalScope);
      case "Program":
        return this.visitProgram(node as Program);
      case "ProcedureCall":
        return this.visitProcedureCall(node as ProcedureCall);
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
      case "Procedure":
      case "NoOp":
      case "Type":
        return;
      default:
        throw new Error("Invalid node type.\nNode received: " + node.type);
    }
  }

  private visitGlobalScope (node: GlobalScope): void {
    // Handle procedures declarations.
    for (const procedure of node.procedures) {
      this.visit(procedure);
    }

    // Finally, handle the main program.
    this.visit(node.program);
  }

  private visitProgram (node: Program): void {
    const program_name = node.name;

    const ar = new ActivationRecord(
      program_name,
      ActivationRecordType.PROGRAM
    );

    this.call_stack.push(ar);

    // Handle the main program.
    this.visit(node.compound);

    this.call_stack.pop();
  }

  private visitProcedureCall (node: ProcedureCall): void {
    const procedureName = node.name;
    // This property is set by the syntax analyzer.
    // It's set as optional, but it's not since the syntax analyzer
    // will always set it.
    const procedureSymbol = node.symbol_from_syntax_analyzer!;

    const ar = new ActivationRecord(
      procedureName,
      ActivationRecordType.PROCEDURE
    );

    /** Declaration of the arguments in the procedure. */
    const formal_args = procedureSymbol.args;
    /** Values passed in the procedure call. */
    const actual_args = node.args;

    // We iterate through every arguments defined in the procedure.
    for (let arg_index = 0; arg_index < formal_args.length; arg_index++) {
      const arg_symbol = formal_args[arg_index];
      const arg_value = this.visit(actual_args[arg_index]);

      ar.set(arg_symbol.name, arg_value);
    }

    this.call_stack.push(ar);

    // Handle the procedure.
    this.visit(procedureSymbol.compound_from_node!);

    this.call_stack.pop();
  }

  private visitBinaryOperation (node: BinaryOperation): number {
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
      case TokenType.MOD:
        return (this.visit(node.left) as number) % (this.visit(node.right) as number);
      default:
        throw new Error("Invalid token type.");
    }
  }

  private visitNumber (node: IntegerNumber | RealNumber): number {
    return node.value;
  }

  /**
   * Unary operations are operations that only require one operand.
   *
   * Includes:
   * - `+`
   * - `-`
   * - `non` (not or !) (TODO)
   */
  private visitUnaryOperation (node: UnaryOperation): number {
    switch (node.token.type) {
      case "PLUS":
        return +(this.visit(node.expr) as number);
      case "MINUS":
        return -(this.visit(node.expr) as number);
      default:
        throw new Error("Invalid unary token type.");
    }
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

  private visitAssign (node: Assign): void {
    const variableName = node.left.value;
    const newVariableValue = this.visit(node.right);

    // Assign the value to the variable
    // in the current activation record.
    const ar = this.call_stack.peek();
    ar.set(variableName, newVariableValue);
  }

  /**
   * Returns the value of the variable
   * in the current activation record.
   */
  private visitVariable (node: Variable): unknown {
    const variableName = node.value;

    const ar = this.call_stack.peek();
    const variableValue = ar.get(variableName);

    return variableValue;
  }

  private visitStringConstant (node: StringConstant): string {
    return node.value;
  }

  public interpret (tree: AST) {
    this.visit(tree);
    return this.call_stack;
  }
}

export default Interpreter;
