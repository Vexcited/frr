export class UndeclaredVariableError extends Error {
  constructor (name: string) {
    super(`UndeclaredVariableError: La variable "${name}" n'est pas déclarée.`);
  }
}