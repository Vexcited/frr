import fs from "node:fs";
import { Lexer, Parser, SemanticAnalyzer, Interpreter } from ".";

const USAGE_MESSAGE = "Utilisation: frr <destination/fichier/script.fr>";

if (process.argv.length > 3) {
  console.error("Seulement un paramètre peut être fourni.");
  console.log(USAGE_MESSAGE);
  process.exit(1);
}

const scriptPath = process.argv[2] as string | undefined;
if (!scriptPath) {
  console.log(USAGE_MESSAGE);
  process.exit(0); // This is not an error.
}

// Check if the path is correct.
if (!fs.existsSync(scriptPath)) {
  console.error(`Le fichier "${scriptPath}" n'existe pas.`);
  process.exit(2);
}

// Check if the given path is a file.
const fileStats = fs.statSync(scriptPath);
if (!fileStats.isFile()) {
  console.error(`"${scriptPath}" n'est pas un fichier.`);
  process.exit(3);
}

const code = fs.readFileSync(scriptPath, { encoding: "utf-8" });

try {
  const lexer = new Lexer(code);
  const parser = new Parser(lexer);
  const tree = parser.parse();

  // We check the code for any syntax errors.
  const symbol_table_builder = new SemanticAnalyzer();
  symbol_table_builder.visit(tree);

  // We interpret the code.
  const interpreter = new Interpreter();
  interpreter.interpret(tree)
    .catch((error) => {
      if (error instanceof Error) {
        console.error(error.message);
        process.exit(4);
      }
      else {
        console.error("UnknownError:", error);
        process.exit(5);
      }
    });
}
catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
    process.exit(4);
  }
  else {
    console.error("UnknownError:", error);
    process.exit(5);
  }
}
