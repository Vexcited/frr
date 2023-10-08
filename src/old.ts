const src_path = "examples/hello.fr";
const src_file = Bun.file(src_path);
const src = await src_file.text();

const keywords = {
  PROGRAM: "programme",
  FUNCTION: "fonction",
  PROCEDURE: "procédure",

  END: "fin",
  START: "début",
  VARIABLES_DESCRIPTOR: "avec",
  COMMENT: "#",

  PRINT: "afficher",

  // chars
  SPACE: " ",
  NEWLINE: "\n"
};

let index = 0;
let state: (
  | "IDLE"
  | "IDENTIFIER"
  | "PROGRAM_NAME"
  | "START_SCOPE"
  | "VARIABLES_DESCRIPTOR"
  | "IN_VARIABLES_SCOPE"
  | "IN_SCOPE"
  | "COMMENT" // when inside a # comment
) = "IDLE";

const scope = {
  name: "",
  is_main: false
};

// Simply check if a string is between **double** quotes.
const isString = (str: string) => str[0] === "\"" && str[str.length - 1] === "\"";
const processString = (str: string) => str.slice(1, str.length - 1);
// Simply check if a string is between **single** quotes.
const isChar = (str: string) => str[0] === "'" && str[str.length - 1] === "'";
const processChar = (str: string) => {
  if (str.length > 3) {
    throw new Error(`Expected a char, got "${str}".`);
  }

  return str[1];
};

const processInstructionLine = (raw_instruction: string) => {
  raw_instruction = raw_instruction.trim();
  let [instruction, ...rest] = raw_instruction.split("#");

  // Check if there's a comment.
  if (rest.length > 0) {
    const comment = rest.join(" ").trim();
    if (comment[0] === keywords.COMMENT) {
      ast.comments.push({
        value: comment,
        // TODO: Allow comments inlined to be correctly positioned.
        start_position: index,
        end_position: index
      });
    }
  }

  // TODO: Handle the indentation.
  instruction = instruction.trim();

  if (instruction.startsWith(keywords.PRINT)) {
    const keyword_length = keywords.PRINT.length;
    let raw_args: string[];

    // `afficher ...`
    // `afficher (...)`
    if (instruction[keyword_length] === keywords.SPACE) {
      if (instruction[keyword_length + 1] === "(") {
        // Strict: we check if there's a ")" at the end.
        if (instruction[instruction.length - 1] !== ")") {
          throw new Error(`Expected ")" at the end of "${instruction}"`);
        }

        // Arguments are between the parenthesis.
        raw_args = instruction.slice(keyword_length + 2, instruction.length - 1).split(",");
      }
      else {
        // Arguments are separated by a comma.
        raw_args = instruction.slice(keyword_length + 1).split(",");
      }
    }
    else if (instruction[keyword_length] === "(") {
      // Strict: we check if there's a ")" at the end.
      if (instruction[instruction.length - 1] !== ")") {
        throw new Error(`Expected ")" at the end of "${instruction}"`);
      }

      // Arguments are between the parenthesis.
      raw_args = instruction.slice(keyword_length + 1, instruction.length - 1).split(",");
    }
    else {
      throw new Error(`Unexpected token "${instruction[keyword_length]}" after "${keywords.PRINT}"`);
    }

    const args = raw_args.map(arg => {
      arg = arg.trim();

      let operation = "";

      /**
       * A char ('a') can only be added or subtracted to a number, eg: 1 + 'a' => 'b'
       * A string ("hello") can only be added to another string.
       * A number (1) can support all kind of operation to another number.
       */
      if (isString(arg)) {
        operation = processString(arg);
      }
      else if (isChar(arg)) {
        operation = processChar(arg);
      }
      else {
        operation = arg;
      }




      return operation;
      // if (isString(arg)) return processString(arg)
      // else if (isChar(arg)) return processChar(arg)
      // else return arg;
    });

    console.log(...args);
  }
};

const ast = {
  program: {
    name: "",
    path: src_path,
    length: src.length
  },

  comments: [] as Comment[],
  body: [] as any[]
};

const consumeUntil = (...targets: string[]): {
  value: string
} => {
  let value = "";
  const found = false;

  while (!found) {
    const currentChar = src[index];
    if (targets.includes(currentChar)) break;

    value += currentChar;
    index++;
  }

  return {
    value
  };
};

interface Comment {
  value: string
  start_position: number
  end_position: number
}

/**
 * procedure that adds a comment to the ast
 * and skips the comment in the source code (index)
 */
const processAndSkipComment = (): void => {
  // we get every char until the newline
  const { value } = consumeUntil(keywords.NEWLINE);

  ast.comments.push({
    value,
    start_position: (index - value.length) + 1,
    end_position: index + 1
  });
};

while (index < src.length) {
  const char = src[index];

  switch (state) {
    case "IDLE": {
      // We ignore spaces and newlines.
      // const { consumed } = consumeUntil(false, keywords.SPACE, keywords.NEWLINE);
      // if (consumed > 0) {
      //   index += consumed + 1;
      //   break;
      // }

      // Process comments we may encounter.
      if (char === keywords.COMMENT) {
        processAndSkipComment();
        index -= 1;
        break;
      }

      // Whenever we catch a character, we go to the IDENTIFIER state.
      // We set the value to the current char.
      state = "IDENTIFIER";

      break;
    }

    case "IDENTIFIER": {
      const { value } = consumeUntil(keywords.SPACE, keywords.NEWLINE);
      if (value === keywords.PROGRAM) {
        state = "PROGRAM_NAME";
        break;
      }

      throw new Error(`Unknown keyword "${value}"`);
    }

    // we got "programme", now let's get the program name
    case "PROGRAM_NAME": {
      /**
       * We only consume until a newline since we can put a
       * comment next to the program name.
       * Consuming until ' ' or '#' won't work.
       */
      const { value } = consumeUntil(keywords.NEWLINE);
      const [program_name, ...rest] = value.split(" ");

      // We set the current scope to the program.
      scope.name = program_name;
      scope.is_main = true;

      // We set the program name in our final AST.
      ast.program.name = program_name;

      // Check if `rest` is a comment.
      if (rest.length > 0) {
        const args = rest.join(" ").trim();
        if (args[0] === keywords.COMMENT) {
          processAndSkipComment();
        }

        // When there's something else than a comment, we throw an error.
        else throw new Error(`Unexpected identifiers after program name, got "${args}". Expected a comment.`);
      }

      state = "START_SCOPE";
      break;
    }

    case "START_SCOPE": {
      // Check if "début" keyword is right **BELOW** the program name.
      if (src[index - 1] !== "\n") {
        throw new Error(`Expected newline before "${keywords.START}"`);
      }

      const { value } = consumeUntil(keywords.NEWLINE);
      const [keyword, ...rest] = value.split(" ");

      if (keyword !== keywords.START) {
        throw new Error(`Expected "${keywords.START}", got "${keyword}"`);
      }

      // Check if `rest` is a comment.
      if (rest.length > 0) {
        const args = rest.join(" ").trim();
        if (args[0] === keywords.COMMENT) {
          processAndSkipComment();
        }

        // When there's something else than a comment, we throw an error.
        else throw new Error(`Unexpected identifiers after "${keywords.START}", got "${args}". Expected a comment.`);
      }

      state = "IN_SCOPE";
      break;
    }

    case "IN_SCOPE": {
      const { value } = consumeUntil(keywords.NEWLINE);

      if (value.trim()[0] === keywords.COMMENT) {
        processAndSkipComment();
        break;
      }

      // Check if it's the end of the scope.
      if (value.startsWith(`${keywords.END} ${scope.name}`)) {
        state = "IDLE";
        break;
      }

      // Process the instruction.
      processInstructionLine(value);
      break;
    }
  }

  // we always increment the index at the end of the switch,
  // so that we can get the next char.
  index++;
}

// print the result to the console.
// console.log(ast.body);