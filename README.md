# `frr`

> `frr` stands for **FR**ench interprete**R**.

## Install

### Windows

<!-- #### Automated

You can also use the automated script to download the latest build and add it to your PATH.

Simply open a PowerShell terminal and run the following command:

```ps1
iwr -useb https://raw.githubusercontent.com/Vexcited/frr/main/scripts/install.ps1 | iex
``` -->

<!-- #### Manual

You can download the latest build from GitHub Actions. It's a `.zip` file containing the `.exe` binary. Just add it to your PATH.

[Download the latest build](https://nightly.link/Vexcited/frr/workflows/binary/main/windows-latest.zip) -->

No binary is released for now, please see the [BUILD](#build) section below.

### Linux and macOS

<!-- #### Automated

You can also use the automated script to download the latest build and add it to your PATH.

Simply open a terminal and run the following command:

```sh
curl -fsSL https://raw.githubusercontent.com/Vexcited/frr/main/scripts/install.sh | sh
```

#### Manual

You can download the latest build from GitHub Actions. It's a `.zip` file containing the binary as `frr-unix`.
Just add it to your PATH.

- [Linux latest build](https://nightly.link/Vexcited/frr/workflows/binary/main/ubuntu-latest.zip)
- [macOS latest build](https://nightly.link/Vexcited/frr/workflows/binary/main/macos-latest.zip) -->

No binary is released for now, please see the [BUILD](#build) section below.

## Usage

Running `frr` will give you the usage instructions.

```console
$ frr
Utilisation: frr <destination/fichier/script.fr>
```

You can find examples in the [`examples`](./examples) directory.

## Documentation

Since this language is based on pseudocode, and pseudocode doesn't have any specification, we have to make sure we all use the same syntax.

Here, I used the syntax my school uses but yours may be different. If it slightly differs (like a builtin function name is named differently) you can [open an issue](https://github.com/Vexcited/frr/issues) and explain what's different to help me implement aliases.

Let's start with a summary of the syntax. When it's checked in front of it means it's implemented.

- [ ] [Comments](#comments)
- [ ] [Variable types](#variable-types)
- [ ] [Variable declaration](#variable-declaration)
- [ ] [Built-in functions](#built-in-functions)
  - [ ] [afficher](#afficher)
  - [ ] [saisir](#saisir)

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

## Build

`frr` is made with [Zig](https://ziglang.org/). \
The version of Zig used in this project is `0.12.0-dev.2858+7230b68b3`.

```bash
# Clone the project if not already done.
git clone https://github.com/Vexcited/frr
cd frr

# Build and run the binary directly.
zig build run -- ./examples/hello-world.fr

# Or you can simply build...
zig build
# ...then execute the binary manually.
./zig-out/bin/frr ./examples/hello-world.fs
```

## Resources

- [Build a simple interpreter](https://ruslanspivak.com/lsbasi-part1/) : `frr` was written in TypeScript before using this guide as reference to understand how a language is made using AST ;
- [Crafting Interpreters](https://craftinginterpreters.com/chunks-of-bytecode.html) : a guide I used as reference to build the current version of `frr` where I learned how bytecode interpreters were made ;
- [`jwmerrill/zig-lox`](https://github.com/jwmerrill/zig-lox): an implementation of the Lox programming language (from Crafting Interpreters) in Zig. Very helpful to use as reference since I am learning Zig at the same time as writing this language ;
- [Algorithm Lessons from `cril.univ-artois.fr`](http://www.cril.univ-artois.fr/~koriche/Algorithmique-2012-Partie7.pdf) to know a bit more about how other universities are understanding pseudocode in their lessons.
