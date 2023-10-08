# French Pseudo-code

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
