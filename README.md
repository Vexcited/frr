# French Pseudo-code

## Install

<!-- This will be a CLI tool, so you can install it with the provided binaries in the Releases section. -->

### Windows

Those bundles aren't made with Bun since it's not supported on Windows yet.

Instead, I use `pkg` from Vercel to bundle the code with a Node.js binary.

- TODO: Make Windows bundles

### Linux and macOS

Those binaries are compiled with Bun.

- TODO: Make Linux and macOS bundles

## Examples

### Hello World

The following code will print "Bonjour, Monde!" to the console.

```fr-pc
programme HelloWorld
début
  # Print "Bonjour, Monde!" to the console.
  afficher "Bonjour, Monde!"
fin HelloWorld
```

## Documentation

### Variable types

When you define a variable, you have to define its type. Here are the available types.
Those types are **case sensitive**, so always in lowercase.

- `entier` (integer)
- `réel` (float)
- `caractère` (character)
- `chaîne` (string)
- `booléen` (boolean)

### Variable declaration

When you're in a scope, so after the `début` keyword, you can start the variables declaration block using the `avec` keyword.

```fr
début
  avec in_line : entier # Can also be on the same line as `avec`.
    a : entier
    b : réel
    c : caractère
    d : chaîne
    e : booléen

  a <- 42
fin
```

To detect whether we're in the variable declaration section or not,
we can check if the `avec` keyword has been used. Then go through every line and check if the line contains a `:` character.

### Comments (`#`)

To write a comment, use the `#` character.

```fr-pc
# This is a comment.
afficher "Hello World" # This is also a comment.
```

### `afficher`, alternatively known as `print`

To print something in the console, use the `afficher` keyword.

```fr-pc
# This is the "official" way to do it.
afficher "Hello, World!"

# Otherwise, those also work.
afficher("Hello, World!")
afficher ("Hello, World!")
```

You can pass multiple arguments to `afficher`.

```fr-pc
afficher "Hello,", " ", "World!"
```

And you can also pass variables and expressions.

```fr-pc
afficher "Hello " + username
afficher "Réponse: ", 42 + 2 - 2 # Useless calculation but it's just to show you can do it.
```

## Development

### Requirements

- [Bun](https://bun.sh)
- [WSL2](https://learn.microsoft.com/windows/wsl/install) (Windows only, since no Bun support for Windows yet)

## Getting started

```sh
# Clone the repository locally
git clone https://github.com/Vexcited/french-pseudocode && cd french-pseudocode

# Install dependencies
bun install
```

## Resources

I learned how to do all this by reading the following resource(s).

- [How to build a simple interpreter](https://ruslanspivak.com/lsbasi-part1/)
