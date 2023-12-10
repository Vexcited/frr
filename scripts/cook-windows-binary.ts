import exe from "@angablue/exe";
import pkg from "../package.json";

await exe({
  entry: "./dist/cli.cjs",
  out: "./frr-win.exe",
  pkg: ["-C", "GZip"], // Specify extra pkg arguments
  version: pkg.version as `${number}.${number}.${number}`,
  target: "latest-win-x64",
  icon: "./assets/icon.ico", // Application icons must be in .ico format
  executionLevel: "asInvoker",
  properties: {
    FileDescription: "A TypeScript interpreter for pseudocode written in French. Why ? Well, why not.",
    ProductName: "frr",
    LegalCopyright: "Mikkel RINGAUD https://github.com/Vexcited",
    OriginalFilename: "frr-win.exe"
  }
});
