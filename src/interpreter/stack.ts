export enum ActivationRecordType {
  PROGRAM   = "PROGRAM",
  PROCEDURE = "PROCEDURE"
}

export class ActivationRecord {
  constructor (
    public name: string,
    public type: ActivationRecordType,
    public members: Map<string, unknown> = new Map()
  ) {}

  public get (key: string) {
    return this.members.get(key);
  }

  public set (key: string, value: unknown) {
    this.members.set(key, value);
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
