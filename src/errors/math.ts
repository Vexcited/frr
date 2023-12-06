import type { Variable } from "../ast/nodes";
import { TokenType } from "../lexer/tokens";

/**
 * Get the full French name of the operation
 * from its token type.
 *
 * Useful for debugging in the error messages.
 *
 * When the given token type doesn't match any
 * operation, an error is thrown.
 *
 * TODO: Add a specific class error for the error thrown.
 */
const getOperationName = (operation_type: TokenType) => {
  switch (operation_type) {
    case TokenType.MINUS:
      return "soustraction";
    case TokenType.MUL:
      return "multiplication";
    case TokenType.DIV:
      return "division";
    case TokenType.MOD:
      return "modulo";
  }

  throw new Error("TypeOperation: Type d'opération non existante.");
};

export class TypeOperationVariableError extends Error {
  constructor (variable: Variable, operation_type: TokenType) {
    const operation_name = getOperationName(operation_type);
    super(`TypeOperationVariableError: Une opération illégale (${operation_name}) a été effectuée sur une chaîne de caractères contenue dans la variable « ${variable.value} ».`);
  }
}

export class TypeOperationError extends Error {
  constructor (operation_type: TokenType) {
    const operation_name = getOperationName(operation_type);
    super(`TypeOperationError: Une opération illégale (${operation_name}) a été effectuée sur une chaîne de caractères.`);
  }
}