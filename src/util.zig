pub fn isAlphanumeric(c: u8) bool {
    return switch (c) {
        '0'...'9', 'A'...'Z', 'a'...'z', 'À'...'Ö', 'Ø'...'ö', 'ø'...'ÿ', '_' => true,
        else => false,
    };
}

pub fn isAlphabetic(c: u8) bool {
    return switch (c) {
        'A'...'Z', 'a'...'z', 'À'...'Ö', 'Ø'...'ö', 'ø'...'ÿ', '_' => true,
        else => false,
    };
}

pub fn isSpace(c: u8) bool {
    return c == ' ';
}

pub fn isNewline(c: u8) bool {
    return c == '\n';
}

pub fn isDigit(c: u8) bool {
    return switch (c) {
        '0'...'9' => true,
        else => false,
    };
}
