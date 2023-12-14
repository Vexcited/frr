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

    // Handle user input.
    switch (variable_symbol.type) {
      case "entier": {
        const answer_as_number = Number(answer);
        if (Number.isNaN(answer_as_number)) {
          throw new Error("Vous devez entrer un entier.");
        }

        // We don't allow any decimal part.
        if (!Number.isInteger(answer_as_number)) {
          throw new Error("Vous devez entrer un entier.");
        }

        scope.set(variable_name, answer_as_number);
        break;
      }
      case "réel": {
        const answer_as_number = Number(answer);
        if (Number.isNaN(answer_as_number)) {
          throw new Error("Vous devez entrer un réel.");
        }

        // We require decimal parts.
        if (Number.isInteger(answer_as_number)) {
          throw new Error("Vous devez entrer un réel.");
        }

        scope.set(variable_name, answer_as_number);
        break;
      }
      case "chaîne": {
        scope.set(variable_name, answer);
        break;
      }
      case "caractère": {
        if (answer.length !== 1) {
          throw new Error("Vous devez entrer un caractère.");
        }

        scope.set(variable_name, answer);
        break;
      }
      case "booléen": {
        if (answer === "vrai") {
          scope.set(variable_name, true);
        }
        else if (answer === "faux") {
          scope.set(variable_name, false);
        }
        else {
          throw new Error("Vous devez entrer un booléen : (écrire vrai ou faux)");
        }

        break;
      }
    }
  }
};