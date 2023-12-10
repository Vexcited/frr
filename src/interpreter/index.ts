import type { AST, Assign, BinaryOperation, Compound, GlobalScope, IntegerNumber, ProcedureCall, Program, RealNumber, StringConstant, UnaryOperation, Variable } from "../ast/nodes";
import { TokenType } from "../lexer/tokens";
import { builtinProcedures } from "./builtins";
import { ActivationRecord, ActivationRecordType, CallStack } from "./stack";

class Interpreter {
  public call_stack = new CallStack();

  private async visit (node: AST) {
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

  private async visitGlobalScope (node: GlobalScope): Promise<void> {
    // Handle procedures declarations.
    for (const procedure of node.procedures) {
      await this.visit(procedure);
    }

    // Finally, handle the main program.
    await this.visit(node.program);
  }

  private async visitProgram (node: Program): Promise<void> {
    const program_name = node.name;

    const ar = new ActivationRecord(
      program_name,
      ActivationRecordType.PROGRAM
    );

    this.call_stack.push(ar);

    // Handle the main program.
    await this.visit(node.compound);

    this.call_stack.pop();
  }

  private async visitProcedureCall (node: ProcedureCall): Promise<void> {
    const procedureName = node.name;

    if (Object.keys(builtinProcedures).includes(procedureName)) {
      /** Values passed in the procedure call. */
      const actual_args = node.args;
      const parsed_args: Array<{ node: unknown, value: unknown }> = [];

      // We iterate through every arguments defined in the procedure.
      for (const arg of actual_args) {
        parsed_args.push({
          node: arg,
          value: await this.visit(arg)
        });
      }

      await builtinProcedures[procedureName].call(this.call_stack.peek(), parsed_args);
    }
    else {
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
        const arg_value = await this.visit(actual_args[arg_index]);
        ar.set(arg_symbol.name, arg_value);
      }

      this.call_stack.push(ar);

      // Handle the pseudocode procedure.
      await this.visit(procedureSymbol.compound_from_node!);

      this.call_stack.pop();
    }
  }

  private async visitBinaryOperation (node: BinaryOperation): Promise<number> {
    const node_left = (await this.visit(node.left)) as number;
    const node_right = (await this.visit(node.right)) as number;

    switch (node.token.type) {
      case TokenType.PLUS:
        return node_left + node_right;
      case TokenType.MINUS:
        return node_left - node_right;
      case TokenType.MUL:
        return node_left * node_right;
      case TokenType.DIV:
        // Integer division.
        return Math.floor(node_left / node_right);
      case TokenType.MOD:
        return node_left % node_right;
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
  private async visitUnaryOperation (node: UnaryOperation): Promise<number> {
    switch (node.token.type) {
      case "PLUS":
        return +((await this.visit(node.expr)) as number);
      case "MINUS":
        return -((await this.visit(node.expr)) as number);
      default:
        throw new Error("Invalid unary token type.");
    }
  }

  private async visitCompound (node: Compound): Promise<void> {
    // Handle every variable declarations made.
    for (const declaration of node.declared_variables) {
      await this.visit(declaration);
    }

    // Handle every statements made.
    for (const child of node.children) {
      await this.visit(child);
    }
  }

  private async visitAssign (node: Assign): Promise<void> {
    const variableName = node.left.value;
    const newVariableValue = await this.visit(node.right);

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

  public async interpret (tree: AST) {
    await this.visit(tree);
    return this.call_stack;
  }
}

export default Interpreter;
