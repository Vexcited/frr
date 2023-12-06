import type { Variable } from "../ast/nodes";
import { TokenType } from "../lexer/tokens";

const getOperationName = (operation_type: TokenType) => {
  let operation_name = "";
  switch (operation_type) {
    case TokenType.MINUS:
      operation_name = "soustraction";
      break;
    case TokenType.MUL:
      operation_name = "multiplication";
      break;
    case TokenType.DIV:
      operation_name = "division";
      break;
    default:
      throw new Error("Opération invalide.");
  }

  return operation_name;
};

export class TypeOperationVariableError extends Error {
  constructor (variable: Variable, operation_type: TokenType) {
    const operation_name = getOperationName(operation_type);
    super(`TypeOperationVariableError: Une ${operation_name} a été effectué sur une chaîne de caractère contenue dans la variable "${variable.value}".`);
  }
}

export class TypeOperationError extends Error {
  constructor (operation_type: TokenType) {
    const operation_name = getOperationName(operation_type);
    super(`TypeOperationError: Une ${operation_name} a été effectué sur une chaîne de caractère.`);
  }
}