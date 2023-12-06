export class UndeclaredVariableTypeError extends Error {
  constructor (name: string) {
    super(`UndeclaredVariableError: La variable "${name}" n'est pas typée dans la déclaration des variables ("avec").`);
  }
}

export class UndeclaredVariableUsedError extends Error {
  constructor (name: string) {
    super(`UndeclaredVariableUsedError: La variable "${name}" est utilisée avant qu'une valeur lui soit attribuée.`);
  }
}