pub fn add(x: f64, y: f64) f64 {
    return x + y;
}

pub fn sub(x: f64, y: f64) f64 {
    return x - y;
}

pub fn mul(x: f64, y: f64) f64 {
    return x * y;
}

/// In pseudocode, divisions are always floored.
pub fn div(x: f64, y: f64) f64 {
    return @divFloor(x, y);
}
