import type { BuiltinProcedure } from ".";
import { RealNumber, Variable } from "../../ast/nodes";

/**
 * Force to keep the .0 decimal part of a real number
 * even if there's none.
 *
 * Example : 1.0 -> 1.0 (not 1)
 */
const readRealAsString = (value: number): string => {
  const valueAsString = value.toString();
  if (valueAsString.indexOf(".") === -1) {
    return `${valueAsString}.0`;
  }

  return valueAsString;
};

export const afficher: BuiltinProcedure = {
  name: "afficher",
  call: async (scope, args) => {
    const handleNodeValue = (arg: typeof args[number]) => {
      // Boolean values are printed as "vrai" or "faux".
      if (typeof arg.value === "boolean") {
        return arg.value ? "vrai" : "faux";
      }

      if (arg.node instanceof Variable || arg.node instanceof RealNumber) {
        return readRealAsString(arg.value as number);
      }

      return arg.value;
    };

    // Write to stdout instead of using `console.log` to avoid
    // - the newline at the end of the output
    // - format from "node:util"
    process.stdout.write(args.map(handleNodeValue).join(" "));
  }
};