const std = @import("std");
const ArrayList = std.ArrayList;
const Allocator = std.mem.Allocator;

const OpCode = @import("./opcode.zig").OpCode;

pub const Chunk = struct {
    code: ArrayList(u8),

    /// Equivalent to `initChunk` in the book.
    pub fn init(allocator: Allocator) Chunk {
        return Chunk{
            .code = ArrayList(u8).init(allocator),
        };
    }

    /// Equivalent to `freeChunk` in the book.
    pub fn deinit(self: *Chunk) void {
        self.code.deinit();
    }

    /// Equivalent to `writeChunk` in the book.
    pub fn write(self: *Chunk, byte: u8) !void {
        try self.code.append(byte);
    }

    /// Helper to write an opcode directly
    /// and avoid the need to cast to `u8`
    /// every time we call `write`.
    pub fn writeOp(self: *Chunk, op: OpCode) !void {
        try self.write(@intFromEnum(op));
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
        std.debug.print("{d} ", .{offset});

        const instruction = @as(OpCode, @enumFromInt(self.code.items[offset]));
        return switch (instruction) {
            OpCode.Return => self.simpleInstruction("OP_RETURN", offset),
        };
    }

    fn simpleInstruction(self: *Chunk, name: []const u8, offset: usize) usize {
        _ = self;

        std.debug.print("{s}\n", .{name});
        return offset + 1;
    }
};
