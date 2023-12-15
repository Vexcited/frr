const std = @import("std");

const fs = std.fs;
const File = fs.File;

const io = std.io;
const process = std.process;

const Chunk = @import("./chunk.zig").Chunk;
const OpCode = @import("./opcode.zig").OpCode;

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    const allocator = gpa.allocator();
    defer _ = gpa.deinit();

    const args = try process.argsAlloc(allocator);
    defer process.argsFree(allocator, args);

    switch (args.len) {
        2 => try interpretFile(allocator, args[1]),

        else => {
            const stderr = io.getStdErr().writer();
            try stderr.print("Usage: {s} <path>\n", .{args[0]});
            process.exit(64);
        },
    }
}

fn interpretFile(allocator: std.mem.Allocator, path: []const u8) !void {
    var file = try fs.cwd().openFile(path, .{ .mode = File.OpenMode.read_only });
    defer file.close();

    const source: []u8 = try allocator.alloc(u8, try file.getEndPos());
    defer allocator.free(source);
    _ = try file.readAll(source);

    var chunk = Chunk.init(allocator);
    defer chunk.deinit();

    const constant = try chunk.addConstant(234567898765432);
    try chunk.writeOp(OpCode.Constant, 123);
    try chunk.write(constant, 123);

    try chunk.writeOp(OpCode.Return, 123);
    chunk.disassemble("test chunk");
}
