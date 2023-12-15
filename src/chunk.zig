const std = @import("std");
const ArrayList = std.ArrayList;
const Allocator = std.mem.Allocator;

const OpCode = @import("./opcode.zig").OpCode;
const Value = @import("./value.zig").Value;

pub const Chunk = struct {
    code: ArrayList(u8),
    lines: ArrayList(usize),
    constants: ArrayList(Value),

    /// Equivalent to `initChunk` in the book.
    pub fn init(allocator: Allocator) Chunk {
        return Chunk{
            .code = ArrayList(u8).init(allocator),
            .lines = ArrayList(usize).init(allocator),
            .constants = ArrayList(Value).init(allocator),
        };
    }

    /// Equivalent to `freeChunk` in the book.
    pub fn deinit(self: *Chunk) void {
        self.code.deinit();
        self.lines.deinit();
        self.constants.deinit();
    }

    /// Equivalent to `writeChunk` in the book.
    pub fn write(self: *Chunk, byte: u8, line: usize) !void {
        try self.code.append(byte);
        try self.lines.append(line);
    }

    /// Helper to write an opcode directly
    /// and avoid the need to cast to `u8`
    /// every time we call `write`.
    pub fn writeOp(self: *Chunk, op: OpCode, line: usize) !void {
        try self.write(@intFromEnum(op), line);
    }

    pub fn addConstant(self: *Chunk, value: Value) !u8 {
        const index = @as(u8, @intCast(self.constants.items.len));
        try self.constants.append(value);
        return index;
    }

    /// Equivalent to `disassembleChunk` in the book.
    pub fn disassemble(self: *Chunk, name: []const u8) void {
        std.debug.print("=== debug: disassembling chunk '{s}'\n", .{name});

        var i: usize = 0;
        while (i < self.code.items.len) {
            i = self.disassembleInstruction(i);
        }
    }

    pub fn disassembleInstruction(self: *Chunk, offset: usize) usize {
        std.debug.print("{d} : {d} => ", .{ offset, self.lines.items[offset] });

        const instruction = @as(OpCode, @enumFromInt(self.code.items[offset]));
        return switch (instruction) {
            OpCode.Return => self.simpleInstruction("OP_RETURN", offset),
            OpCode.Negate => self.simpleInstruction("OP_NEGATE", offset),
            OpCode.Constant => self.constantInstruction("OP_CONSTANT", offset),
        };
    }

    fn simpleInstruction(self: *Chunk, name: []const u8, offset: usize) usize {
        _ = self;

        std.debug.print("{s}\n", .{name});
        return offset + 1;
    }

    fn constantInstruction(self: *Chunk, name: []const u8, offset: usize) usize {
        // The value of the constant is located next to the opcode.
        const constant = self.code.items[offset + 1];

        std.debug.print("{s}<{d}>\n", .{ name, self.constants.items[constant] });
        return offset + 2;
    }
};
