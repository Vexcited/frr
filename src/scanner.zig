const std = @import("std");
pub const TokenType = enum {
    // Single character tokens.
    LEFT_PAREN, // (
    RIGHT_PAREN, // )
    COMMA, // ,
    DOT, // .
    MINUS, // -
    PLUS, // +
    SEMICOLON, // ;
    SLASH, // /
    STAR, // *
    EQUAL, // =
    LESS, // <
    GREATER, // >
    BANG, // !

    // Double character tokens.
    BANG_EQUAL, // !=
    LESS_EQUAL, // <=
    GREATER_EQUAL, // >=
    ASSIGN, // <-

    STRING, // Content is between double quotes.

    // Others.
    ERROR,
    EOF,
};

pub const Token = struct {
    type: TokenType,
    lexeme: []const u8,
    line: usize,
};

pub const Scanner = struct {
    start: []const u8,
    current: usize,
    line: usize,

    pub fn init(source: []const u8) Scanner {
        return Scanner{
            .start = source,
            .current = 0,
            .line = 1,
        };
    }

    pub fn scanToken(self: *Scanner) Token {
        self.skipWhitespaces();

        self.start = self.start[self.current..];
        self.current = 0;

        if (self.isAtEnd()) return self.makeToken(TokenType.EOF);

        const char = self.advance();
        return switch (char) {
            '(' => self.makeToken(TokenType.LEFT_PAREN),
            ')' => self.makeToken(TokenType.RIGHT_PAREN),
            ';' => self.makeToken(TokenType.SEMICOLON),
            ',' => self.makeToken(TokenType.COMMA),
            '.' => self.makeToken(TokenType.DOT),
            '-' => self.makeToken(TokenType.MINUS),
            '+' => self.makeToken(TokenType.PLUS),
            '/' => self.makeToken(TokenType.SLASH),
            '*' => self.makeToken(TokenType.STAR),

            // To handle comments, we just skip until we encounter a newline.
            // When this happens, make a new scan.
            '#' => {
                while (self.peek() != '\n' and !self.isAtEnd()) {
                    _ = self.advance();
                }

                return self.scanToken();
            },

            '!' => self.makeToken(if (self.match('=')) TokenType.BANG_EQUAL else TokenType.BANG),
            '<' => self.makeToken(if (self.match('=')) TokenType.LESS_EQUAL else if (self.match('-')) TokenType.ASSIGN else TokenType.LESS),
            '>' => self.makeToken(if (self.match('=')) TokenType.GREATER_EQUAL else TokenType.GREATER),
            '=' => self.makeToken(.EQUAL),

            '"' => self.string(),

            else => self.makeToken(TokenType.ERROR),
        };
    }

    fn advance(self: *Scanner) u8 {
        self.current += 1;

        if (self.isAtEnd()) return 0;
        return self.start[self.current - 1];
    }

    fn match(self: *Scanner, char: u8) bool {
        if (self.isAtEnd()) return false;
        if (self.peek() != char) return false;

        self.current += 1;
        return true;
    }

    /// Know whether we're at the end of the
    /// source code given or no.
    fn isAtEnd(self: *Scanner) bool {
        return self.current >= self.start.len;
    }

    fn makeToken(self: *Scanner, tokenType: TokenType) Token {
        return Token{
            .type = tokenType,
            .lexeme = self.start[0..self.current],
            .line = self.line,
        };
    }

    fn peek(self: *Scanner) u8 {
        return self.start[self.current];
    }

    fn peekNext(self: *Scanner) u8 {
        if (self.isAtEnd()) return 0;
        return self.start[self.current + 1];
    }

    fn skipWhitespaces(self: *Scanner) void {
        while (true) {
            // Prevent going out of bounds.
            if (self.isAtEnd()) return;

            const char = self.peek();
            switch (char) {
                ' ', '\r', '\t' => {
                    _ = self.advance();
                },
                '\n' => {
                    self.line += 1;
                    _ = self.advance();
                },

                else => return,
            }
        }
    }

    fn string(self: *Scanner) Token {
        while (!self.isAtEnd() and self.peek() != '"') {
            if (self.peek() == '\n') self.line += 1;
            _ = self.advance();
        }

        // Unterminated string
        if (self.isAtEnd()) {
            std.debug.print("uhhh??", .{});
            return self.makeToken(.ERROR);
        }

        // Skip the closing quote.
        _ = self.advance();
        return self.makeToken(.STRING);
    }
};
