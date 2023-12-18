const std = @import("std");
const Scanner = @import("./scanner.zig");

pub fn compile(code: []const u8) void {
    var scanner = Scanner.Scanner.init(code);
    var token = scanner.scanToken();

    while (token.type != Scanner.TokenType.EOF) {
        std.debug.print("{s} {d}\n", .{ token.lexeme, token.line });
        token = scanner.scanToken();
    }
}
