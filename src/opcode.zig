pub const OpCode = enum(u8) {
    Constant,
    Return,

    // Unary
    Negate,

    // Binary operators
    Add,
    Substract,
    Multiply,
    Divide,
};
