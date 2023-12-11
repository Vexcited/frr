import { AST, Assign, BinaryOperation, Compound, GlobalScope, Procedure, ProcedureCall, Program, UnaryOperation, Variable, VariableDeclaration } from "../ast/nodes";
import { TypeOperationError, TypeOperationVariableError } from "../errors/math";
import { UndeclaredVariableTypeError } from "../errors/variables";
import { TokenType } from "../lexer/tokens";
import { BuiltinTypeSymbol, ProcedureSymbol, VarSymbol } from "./builtins";
import ScopedSymbolTable from "./table";

class SemanticAnalyzer {
  private global_scope = new ScopedSymbolTable("#global#");
  private current_scope: ScopedSymbolTable | null = null;

  /**
   * Analyze the syntax of the AST given in parameter.
   * Throws an error if, at some point, syntax is invalid.
   *
   * You can intercept the error by using a try/catch block.
   */
  public visit (node: AST): void {
    switch (node.type) {
      case "GlobalScope":
        return this.visitGlobalScope(<GlobalScope>node);
      case "Program":
        return this.visitProgram(<Program>node);
      case "Procedure":
        return this.visitProcedure(<Procedure>node);
      case "ProcedureCall":
        return this.visitProcedureCall(<ProcedureCall>node);
      case "BinaryOperation":
        return this.visitBinaryOperation(<BinaryOperation>node);
      case "UnaryOperation":
        return this.visitUnaryOperation(<UnaryOperation>node);
      case "Compound":
        return this.visitCompound(<Compound>node);
      case "VariableDeclaration":
        return this.visitVariableDeclaration(<VariableDeclaration>node);
      case "Assign":
        return this.visitAssign(<Assign>node);
      case "Variable":
        this.visitVariable(<Variable>node);
        // `visitVariable` returns a value but we don't want it here.
        return;

      // All those are not handled by the syntax analyzer.
      case "IntegerNumber":
      case "RealNumber":
      case "StringConstant":
      case "CharConstant":
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
    // Let's enter the program scope.
    const program_scope = new ScopedSymbolTable("#program#");
    this.current_scope = program_scope;

    // Check the semantic of the main program.
    this.visit(node.compound);

    // Exiting the main program scope.
    this.current_scope = null;
  }

  private visitProcedure (node: Procedure): void {
    const procedure_name = node.name;
    // We insert the procedure in the file scope.
    // So we know we can call it from everywhere in the file.
    const procedure_symbol = new ProcedureSymbol(procedure_name);
    this.global_scope.define(procedure_symbol);

    // Let's enter the procedure scope.
    const procedure_scope = new ScopedSymbolTable(procedure_name);
    this.current_scope = procedure_scope;

    // Define the arguments of the procedure.
    for (const arg of node.args) {
      const arg_name = arg.var_node.value;
      const arg_type = arg.type_node.value;
      const type_symbol: BuiltinTypeSymbol | undefined = this.current_scope.lookup(arg_type);

      if (!type_symbol) {
        throw new Error(`Type ${arg_type} not found.`);
      }

      const var_symbol = new VarSymbol(arg_name, type_symbol);
      this.current_scope.define(var_symbol);
      procedure_symbol.args.push(var_symbol);
    }

    // Check the semantic of the procedure.
    this.visit(node.compound);

    // Exiting the procedure scope.
    this.current_scope = null;

    // We set the compound of the procedure symbol,
    // so we can easily use it in the interpreter.
    procedure_symbol.compound_from_node = node.compound;
  }

  private visitProcedureCall (node: ProcedureCall): void {
    for (const arg of node.args) {
      this.visit(arg);
    }

    const procedure_symbol = this.global_scope.lookup(node.name) as ProcedureSymbol;
    node.symbol_from_syntax_analyzer = procedure_symbol;
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
        const operation = node.operation.type;

        // When one of the operands is a string, we throw an error.
        if (node.left.type === "StringConstant" || node.right.type === "StringConstant") {
          throw new TypeOperationError(operation);
        }

        // We manually visit the variable to check if it's a string.
        if (node.left instanceof Variable) {
          const var_symbol = this.visitVariable(node.left);
          if (var_symbol.type === "chaîne") {
            throw new TypeOperationVariableError(node.left, operation);
          }
        }
        // It's not a variable, we can visit it normally.
        else this.visit(node.left);

        // We manually visit the variable to check if it's a string.
        if (node.right instanceof Variable) {
          const var_symbol = this.visitVariable(node.right);
          if (var_symbol.type === "chaîne") {
            throw new TypeOperationVariableError(node.right, operation);
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
    const type_symbol: BuiltinTypeSymbol | undefined = this.current_scope!.lookup(type_name);

    if (!type_symbol) {
      throw new Error(`Type ${type_name} not found.`);
    }

    const var_name = node.var_node.value;
    const var_symbol = new VarSymbol(var_name, type_symbol);

    if (this.current_scope?.lookup(var_name)) {
      throw new Error(`Variable ${var_name} already defined.`);
    }

    this.current_scope!.define(var_symbol);
  }

  private visitAssign (node: Assign): void {
    const var_name = node.left.value;
    const var_symbol = this.current_scope!.lookup(var_name);

    if (!var_symbol) {
      throw new UndeclaredVariableTypeError(var_name);
    }

    this.visit(node.right);
  }

  /**
   * Returns the symbol of the variable.
   * Not handled when the variable is not declared.
   */
  private visitVariable (node: Variable): VarSymbol {
    const var_name = node.value;
    const var_symbol = this.current_scope!.lookup(var_name) as VarSymbol | undefined;

    if (!var_symbol) {
      throw new UndeclaredVariableTypeError(var_name);
    }

    node.symbol_from_syntax_analyzer = var_symbol;
    return var_symbol;
  }
}

export default SemanticAnalyzer;
