import { AST, Assign, BinaryOperation, BooleanConstant, CharConstant, Compound, GlobalScope, If, IntegerNumber, ProcedureCall, Program, RealNumber, StringConstant, UnaryOperation, Variable } from "../ast/nodes";
import { TypeBooleanOperationError, TypeOperationError } from "../errors/math";
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
      case "If":
        return this.visitIf(node as If);
      case "Assign":
        return this.visitAssign(node as Assign);
      case "Variable":
        return this.visitVariable(node as Variable);
      case "StringConstant":
        return this.visitStringConstant(node as StringConstant);
      case "CharConstant":
        return this.visitCharConstant(node as CharConstant);
      case "BooleanConstant":
        return this.visitBooleanConstant(node as BooleanConstant);
      // All those are not handled by the interpreter.
      case "VariableDeclaration":
      case "Procedure":
      case "NoOp":
      case "Type":
        return;
      default:
        throw new Error(`Erreur<interpreter.visit> lors de l'exécution.\ndebug: ${node.type} is unknown node type.`);
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

  private async visitBinaryOperation (node: BinaryOperation): Promise<number | string | boolean> {
    const isChar = (node: BinaryOperation | IntegerNumber | UnaryOperation | Variable | RealNumber | StringConstant | CharConstant | BooleanConstant) => {
      if (node instanceof Variable) {
        const var_symbol = node.symbol_from_syntax_analyzer!;
        return var_symbol.type === "caractère";
      }

      return node.type === "CharConstant";
    };

    type HandledNode = { value: number, isTypeChar: true } | { value: number | string, isTypeChar: false }
    const handleNode = async (node: BinaryOperation | IntegerNumber | UnaryOperation | Variable | RealNumber | StringConstant | CharConstant | BooleanConstant): Promise<HandledNode> => {
      const node_value = (await this.visit(node)) as number | string;

      if (isChar(node) && typeof node_value === "string") {
        return {
          value: node_value.charCodeAt(0),
          isTypeChar: true
        };
      }

      return {
        value: node_value,
        isTypeChar: false
      };
    };

    /** Whether it's not a character AND its value is a string. */
    const isString = (handled_node: HandledNode) => {
      return !handled_node.isTypeChar && typeof handled_node.value === "string";
    };

    let node_left = await handleNode(node.left);
    let node_right = await handleNode(node.right);

    /**
     * Mostly made to handle character operations.
     */
    const handleOperation = (makeOperation: () => number | string | boolean) => {
      if (node_left.isTypeChar) {
        if (typeof node_right.value === "number") {
          // Here, left is char so value is number and right is number.
          const val = makeOperation();
          if (typeof val === "boolean") return val;
          return String.fromCharCode(val as number);
        }
        else {
          node_left = { // Not a char anymore.
            isTypeChar: false,
            value: String.fromCharCode(node_left.value)
          };
        }
      }
      else if (node_right.isTypeChar) {
        if (typeof node_left.value === "number") {
          const val = makeOperation();
          if (typeof val === "boolean") return val;
          return String.fromCharCode(val as number);
        }
        else {
          node_right = { // Not a char anymore.
            isTypeChar: false,
            value: String.fromCharCode(node_right.value)
          };
        }
      }

      // Force to run the operation again since
      // values of `node_left` and `node_right` may have changed.
      return makeOperation();
    };

    const handleErrorsOnStrings = () => {
      if (isString(node_left) || isString(node_right)) {
        throw new TypeOperationError(node.token.type);
      }
    };

    const handleErrorsOnBooleans = () => {
      if (typeof node_left.value === "boolean" || typeof node_right.value === "boolean") {
        throw new TypeBooleanOperationError(node.token.type);
      }
    };

    switch (node.token.type) {
      case TokenType.PLUS:
        handleErrorsOnBooleans();
        // @ts-expect-error : JS is able to add a string and a number.
        return handleOperation(() => node_left.value + node_right.value);
      case TokenType.MINUS:
        handleErrorsOnBooleans();
        handleErrorsOnStrings();
        // @ts-expect-error : Both should be numbers. Note that `caractère` is a number.
        return handleOperation(() => node_left.value - node_right.value);
      case TokenType.MUL:
        handleErrorsOnBooleans();
        handleErrorsOnStrings();
        // @ts-expect-error : Both should be numbers. Note that `caractère` is a number.
        return handleOperation(() => node_left.value * node_right.value);
      case TokenType.DIV:
        handleErrorsOnBooleans();
        handleErrorsOnStrings();
        // We use `Math.floor` to perform an integer division.
        // @ts-expect-error : Both should be numbers. Note that `caractère` is a number.
        return Math.floor(handleOperation(() => node_left.value / node_right.value));
      case TokenType.MOD:
        handleErrorsOnBooleans();
        handleErrorsOnStrings();
        // @ts-expect-error : Both should be numbers. Note that `caractère` is a number.
        return handleOperation(() => node_left.value % node_right.value);
      case TokenType.EQUAL:
        return handleOperation(() => node_left.value === node_right.value);
      case TokenType.NOT_EQUAL:
        return handleOperation(() => node_left.value !== node_right.value);
      case TokenType.GREATER_THAN:
        return handleOperation(() => node_left.value > node_right.value);
      case TokenType.GREATER_THAN_OR_EQUAL:
        return handleOperation(() => node_left.value >= node_right.value);
      case TokenType.LESS_THAN:
        return handleOperation(() => node_left.value < node_right.value);
      case TokenType.LESS_THAN_OR_EQUAL:
        return handleOperation(() => node_left.value <= node_right.value);
      default:
        throw new Error(`Erreur<interpreter.visitBinaryOperation> lors de l'exécution.\ndebug: ${node.token.type} is unknown operation node type.`);
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
   * - `non` (not or !)
   */
  private async visitUnaryOperation (node: UnaryOperation): Promise<number | boolean> {
    switch (node.token.type) {
      case TokenType.PLUS:
        return +((await this.visit(node.expr)) as number);
      case TokenType.MINUS:
        return -((await this.visit(node.expr)) as number);
      case TokenType.NOT:
        return !((await this.visit(node.expr)) as boolean);
      default:
        throw new Error("Erreur<interpreter.visitUnaryOperation> lors de l'exécution.\nToken unaire invalide.");
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

  private async visitIf (node: If): Promise<void> {
    const condition = await this.visit(node.condition);

    if (condition) {
      for (const statement of node.main_statements) {
        await this.visit(statement);
      }
    }
    else if (!condition && node.else_statements.length > 0) {
      for (const statement of node.else_statements) {
        await this.visit(statement);
      }
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

  private visitCharConstant (node: CharConstant): string {
    return node.value;
  }

  private visitBooleanConstant (node: BooleanConstant): boolean {
    return node.value;
  }

  public async interpret (tree: AST) {
    await this.visit(tree);
    return this.call_stack;
  }
}

export default Interpreter;
