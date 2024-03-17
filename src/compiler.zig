const std = @import("std");
const Scanner = @import("./scanner.zig");

pub fn compile(code: []const u8) void {
    var scanner = Scanner.Scanner.init(code);
    var token = scanner.scanToken();

    while (token.type != .EOF and token.type != .ERROR) {
        std.debug.print("token: {s} at line {d}\n", .{ token.lexeme, token.line });
        token = scanner.scanToken();
    }

    if (token.type == .ERROR) {
        std.debug.print("An error was thrown during the compilation process.", .{});
    }
}
