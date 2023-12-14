# `frr`

## Development

`frr` is made using the [Zig](https://ziglang.org/) programming language.
The version of Zig used in this project is `0.12.0-dev.1664+8ca4a5240`.

```bash
# Used to run the `HelloWorld.fr` script.
zig build run -- ./examples/HelloWorld.fr
```

## Resources

- [Crafting Interpreters](https://craftinginterpreters.com/chunks-of-bytecode.html), starting from the bytecode chapter.
- [`jwmerrill/zig-lox`](https://github.com/jwmerrill/zig-lox): An implementation of the Lox programming language (from Crafting Interpreters) in Zig. Since I am learning Zig at the same time, I used this repository as a reference.
- [Algorithm Lessons from `cril.univ-artois.fr`](http://www.cril.univ-artois.fr/~koriche/Algorithmique-2012-Partie7.pdf)
