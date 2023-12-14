export enum ActivationRecordType {
  PROGRAM   = "PROGRAM",
  PROCEDURE = "PROCEDURE"
}

export interface ActivationRecordEffect {
  set: (value: unknown) => void,
  get: () => unknown
}

export class ActivationRecord {
  private effects = new Map<string, ActivationRecordEffect>();
  constructor (
    public name: string,
    public type: ActivationRecordType,
    public members: Map<string, unknown> = new Map()
  ) {}

  public get (key: string): unknown {
    const effect = this.effects.get(key);

    if (effect) return effect.get();
    else return this.members.get(key);
  }

  public set (key: string, value: unknown): void {
    const effect = this.effects.get(key);

    if (effect) effect.set(value);
    else this.members.set(key, value);
  }

  /**
   * Used to pass references to update a
   * member in another activation record.
   */
  public defineEffect (key: string, effect: ActivationRecordEffect): void {
    this.effects.set(key, effect);
  }
}

export class CallStack {
  private activation_records: ActivationRecord[] = [];

  public push (ar: ActivationRecord): void {
    this.activation_records.push(ar);
  }

  public pop (): void {
    this.activation_records.pop();
  }

  /**
   * Returns the current activation record.
   */
  public peek (): ActivationRecord {
    return this.activation_records[this.activation_records.length - 1];
  }
}

/**
 * When a return was used in a function.
 * Return is only allowed in functions, so usage
 * inside procedures or main program will throw an error.
 */
export class Returned {
  constructor (public value: unknown) {}
}
