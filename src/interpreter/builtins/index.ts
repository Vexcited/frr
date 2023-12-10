import type { ActivationRecord } from "../stack";

export type BuiltinProcedure = {
  name: string,
  call: (scope: ActivationRecord, args: Array<{ node: unknown, value: unknown }>) => Promise<void>
}

import { afficher } from "./afficher";
import { saisir } from "./saisir";

export const builtinProcedures: Record<string, BuiltinProcedure> = {
  afficher,
  saisir
};
