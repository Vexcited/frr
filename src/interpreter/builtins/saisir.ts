import type { BuiltinProcedure } from ".";

import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { Variable } from "../../ast/nodes";

export let readline_interface: readline.Interface | null = null;

export const saisir: BuiltinProcedure = {
  name: "saisir",
  call: async (scope, args) => {
    if (args.length !== 1) {
      throw new Error("saisir takes exactly one argument.");
    }

    const variable = args[0].node;
    if (!(variable instanceof Variable)) {
      throw new Error("saisir takes an identifier as argument.");
    }

    const variable_name = variable.value;
    const variable_symbol = variable.symbol_from_syntax_analyzer!;

    if (!readline_interface) {
      readline_interface = readline.createInterface({ input, output, terminal: false });
    }

    const answer = await readline_interface.question("");
    // See <https://github.com/nodejs/node/issues/17495>.
    // rl.close();

    // Handle user input.
    switch (variable_symbol.type) {
      case "entier": {
        const answer_as_number = Number(answer);
        if (isNaN(answer_as_number)) {
          throw new Error("Expected a number.");
        }

        scope.set(variable_name, answer_as_number);
        break;
      }
      case "réel": {
        const answer_as_number = Number(answer);
        if (isNaN(answer_as_number)) {
          throw new Error("Expected a number.");
        }

        if (!Number.isInteger(answer_as_number)) {
          throw new Error("Expected an integer.");
        }

        scope.set(variable_name, answer_as_number);
        break;
      }
      case "chaîne": {
        scope.set(variable_name, answer);
        break;
      }
    }
  }
};