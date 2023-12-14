# `frr` : Frère

> `frr` also stands for **FR**ench **R**unner or **FR**ench interprete**R**. \
> But it's also the french word for "bro", so it's funny.

A french pseudo-code interpreter written in TypeScript. Because why not ?

![frr](./assets/logo.png)

## Install

### Windows

Those bundles aren't made with Bun since it's not supported on Windows yet.

Instead, I use `pkg` from Vercel to bundle the code with a Node.js binary.

#### Automated

You can also use the automated script to download the latest build and add it to your PATH.

Simply open a PowerShell terminal and run the following command:

```ps1
iwr -useb https://raw.githubusercontent.com/Vexcited/frr/main/scripts/install.ps1 | iex
```

#### Manual

You can download the latest build from GitHub Actions. It's a `.zip` file containing the `.exe` binary. Just add it to your PATH.

[Download the latest build](https://nightly.link/Vexcited/frr/workflows/binary/main/windows-latest.zip)

### Linux and macOS

Those binaries are compiled with Bun.

#### Automated

You can also use the automated script to download the latest build and add it to your PATH.

Simply open a terminal and run the following command:

```sh
curl -fsSL https://raw.githubusercontent.com/Vexcited/frr/main/scripts/install.sh | sh
```

#### Manual

You can download the latest build from GitHub Actions. It's a `.zip` file containing the binary as `frr-unix`.
Just add it to your PATH.

- [Linux latest build](https://nightly.link/Vexcited/frr/workflows/binary/main/ubuntu-latest.zip)
- [macOS latest build](https://nightly.link/Vexcited/frr/workflows/binary/main/macos-latest.zip)

## Usage

Running `frr` will give you the usage instructions.

```console
$ frr
Utilisation: frr <destination/fichier/script.fr>
```

## Examples

You can find examples in the [`examples`](./examples) directory.

## Documentation

Since this language is based on pseudo-code, and pseudo-code doesn't have any specification, we have to make sure we all use the same syntax.

Here, I used the syntax my school uses but yours may be different. If it slightly differs (like a builtin function name is named differently) you can [open an issue](https://github.com/Vexcited/french-pseudocode/issues) and explain what's different to help me implement aliases.

Let's start with a summary of the syntax. When it's checked in front of it means it's implemented.

- [x] [Comments](#comments)
- [x] [Variable types](#variable-types)
- [x] [Variable declaration](#variable-declaration)
- [ ] [Built-in functions](#built-in-functions)
  - [x] [afficher](#afficher)
  - [x] [saisir](#saisir)

### Comments

To write a comment, use the `#` character.
It'll make the rest of the line a comment.

```fr
# This is a comment.
afficher "Hello World" # This is also a comment.
```

This is the only way to make a comment.
There's no way to make a comment like `/* ... */`.

So multi-line comments should be written like this:

```fr
# Start to write your comment on a line
# then start a write another comment
# to continue your comment.
```

### Variable types

When you define a variable, you have to define its type. Here are the available types.

Those types are **case sensitive**, so always in lowercase.

| Type                       | Alias in C (or Python) |
| -------------------------- | ---------------------- |
| `entier`                   | `int`                  |
| `réel`                     | `float`                |
| `caractère` (alias: `car`) | `char`                 |
| `chaîne`                   | `str` in Python        |
| `booléen`                  | `bool` in Python       |

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
    # Same as above -> f, g, h : car 
fin Déclarations
```

**Note that if you're not using any variable in your program, you don't need to declare any.** And so, you don't need to use the `avec` keyword and you can just start writing your code.

### Built-in functions

#### `afficher`

To print something in the console, use the `afficher` keyword.

Note that **there's no newline at the end of the printed text**.
So if you want to print a newline, you have to do it manually.

```fr
# This is the "official" way to do it.
afficher "Hello, World!\n"

# Otherwise, those also work.
afficher("Hello, World!")
afficher ("Hello, World!")
```

You can pass multiple arguments to `afficher`.
Each argument will be printed with a space between them.

```fr
afficher "Hello", "World!" # >>> Hello World!
```

You can also pass variables, expressions.

```fr
username <- "Vexcited"
afficher "Hello " + username # >>> Hello Vexcited
afficher "Réponse:", 21 * 2  # >>> Réponse: 42
```

Passing a boolean will print `vrai` or `faux`.

```fr
afficher vrai # >>> vrai
afficher faux # >>> faux

# So you can print conditions like this:
afficher "Yes ?", vrai = vrai # >>> Yes ? vrai 
```

#### `saisir`

To get user input, use the `saisir` keyword.

```fr
avec username : chaîne
saisir username
```

`saisir` will **always cast the input to the type of the variable you're assigning it to**.
If the input can't be casted to the type of the variable, the interpreter will throw an error.

```fr
avec age : entier
saisir age
# If you enter "21", `age` will be equal to 21.
# If you enter "21.5", `age` will be equal to 21.
# If you enter "Hello", the interpreter will throw an error.
```

```fr
avec x : réel
saisir x
# If you enter "21", `x` will be equal to 21.0.
# If you enter "21.5", `x` will be equal to 21.5.
# If you enter "Hello", the interpreter will throw an error.
```

## Development

### Requirements

- [Bun](https://bun.sh) (when building for Linux or macOS)
- [Node.js](https://nodejs.org) (when building for Windows)
- [pnpm](https://pnpm.io) (managing dependencies)

## Getting started

```sh
# Clone the repository locally
git clone https://github.com/Vexcited/frr && cd frr

# Install dependencies
`pnpm install` with Node.js
```

## Resources

- [How to build a simple interpreter](https://ruslanspivak.com/lsbasi-part1/)
- [Crafting Interpreters](https://craftinginterpreters.com/)
- [Algorithm Lessons from `cril.univ-artois.fr`](http://www.cril.univ-artois.fr/~koriche/Algorithmique-2012-Partie7.pdf)
