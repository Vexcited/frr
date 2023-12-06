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

You can find examples in the [`examples`](./examples) directory.

## Documentation

Since this language is just pseudo-code, and pseudo-code doesn't have any specification, we have to make sure we all use the same syntax.

Here, I used the syntax my school uses but yours may be different. If it slightly differs (like a builtin function name is named differently) you can [open an issue](https://github.com/Vexcited/french-pseudocode/issues) and explain what's different to help me implement aliases.

Let's start with a summary of the syntax. When it's checked in front of it means it's implemented.

- [x] [Comments](#comments) (since v0.1.0)
- [x] [Variable types](#variable-types) (since v0.1.0)
- [x] [Variable declaration](#variable-declaration) (since v0.1.0)
- [ ] [Built-in functions](#built-in-functions)
  - [ ] [afficher](#afficher)

### Comments

To write a comment, use the `#` character.
It'll make the rest of the line a comment.

```fr-pc
# This is a comment.
afficher "Hello World" # This is also a comment.
```

This is the only way to make a comment.
There's no way to make a comment like `/* ... */`.

So multi-line comments should be written like this:

```fr-pc
# Start to write your comment on a line
# then start a write another comment
# to continue your comment.
```

### Variable types

When you define a variable, you have to define its type. Here are the available types.

Those types are **case sensitive**, so always in lowercase.

| Type | Alias in C (or Python) | Since (version) |
| ---- | ---------- | --------------- |
| `entier` | `int` | v0.1.0 |
| `réel` | `float` | v0.1.0 |
| `caractère` | `char` | *Not implemented* |
| `chaîne` | `str` in Python | v0.1.0 |
| `booléen` | `bool` in Python | *Not implemented* |

### Variable declaration

When you're writing a function, a procedure or a program you **must** declare any variable you're going to use.

This is happening right after the `début` keyword. To initiate a "variable declaration block" using the `avec` keyword.

```fr
programme Déclarations
début
  # You can declare a variable on the same line as `avec`.
  avec in_line: entier
    a : entier
    # By the way, spacing is not important.
    b : réel
    # And indentation is not important either.
      c : chaîne # Works
d : chaîne # Also works
    e : booléen
    f, g, h : caractère # You can also declare multiple variables on the same line.
fin Déclarations
```

**Note that if you're not using any variable in your program, you don't need to declare any.** And so, you don't need to use the `avec` keyword and you can just start writing your code.

### Built-in functions

#### `afficher`

> **Note:** This is a built-in function not implemented yet.

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
afficher "Hello", " ", "World!"
```

You can also pass variables, expressions.

```fr-pc
afficher "Hello " + username
afficher "Réponse: ", 42 + 2
```

The following types are allowed in the arguments:

- `chaîne`
- `entier`
- `réel`

## Development

### Requirements

- [Bun](https://bun.sh)
- [WSL2](https://learn.microsoft.com/windows/wsl/install) (Windows only, since no Bun support for Windows yet)

## Getting started

```sh
# Clone the repository locally
git clone https://github.com/Vexcited/french-pseudocode && cd french-pseudocode

# Install dependencies
bun install # or `npm install` with Node.js
```

## Resources

- [How to build a simple interpreter](https://ruslanspivak.com/lsbasi-part1/)
- [Algorithm Lessons from `cril.univ-artois.fr`](http://www.cril.univ-artois.fr/~koriche/Algorithmique-2012-Partie7.pdf)
