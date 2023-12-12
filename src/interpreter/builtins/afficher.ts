import type { BuiltinProcedure } from ".";

export const afficher: BuiltinProcedure = {
  name: "afficher",
  call: async (scope, args) => {
    const handleNodeValue = (value: unknown) => {
      // Boolean values are printed as "vrai" or "faux".
      if (typeof value === "boolean") {
        return value ? "vrai" : "faux";
      }

      return value;
    };

    // Write to stdout instead of using `console.log` to avoid
    // - the newline at the end of the output
    // - format from "node:util"
    process.stdout.write(args.map(arg => handleNodeValue(arg.value)).join(" "));
  }
};