import type { BuiltinProcedure } from ".";

export const afficher: BuiltinProcedure = {
  name: "afficher",
  call: async (scope, args) => {
    // Write to stdout instead of using `console.log` to avoid
    // - the newline at the end of the output
    // - format from "node:util"
    process.stdout.write(args.map(arg => arg.value).join(" "));
  }
};