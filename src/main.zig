const std = @import("std");

const fs = std.fs;
const File = fs.File;

const io = std.io;
const process = std.process;

const Chunk = @import("./chunk.zig").Chunk;
const OpCode = @import("./opcode.zig").OpCode;
const VM = @import("./vm.zig").VM;

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

    // var chunk = Chunk.init(allocator);
    // defer chunk.deinit();

    // const constant1 = try chunk.addConstant(1);
    // try chunk.writeOp(OpCode.Constant, 1);
    // try chunk.write(constant1, 1);

    // const constant2 = try chunk.addConstant(3);
    // try chunk.writeOp(OpCode.Constant, 1);
    // try chunk.write(constant2, 1);

    // try chunk.writeOp(OpCode.Add, 1);

    // const constant3 = try chunk.addConstant(2);
    // try chunk.writeOp(OpCode.Constant, 1);
    // try chunk.write(constant3, 1);

    // try chunk.writeOp(OpCode.Divide, 1);
    // try chunk.writeOp(OpCode.Negate, 1);

    // try chunk.writeOp(OpCode.Return, 2);

    var vm = VM.create();
    try vm.init(allocator);
    defer vm.deinit();

    _ = vm.interpret(source);
}
