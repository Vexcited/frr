const std = @import("std");
const Allocator = std.mem.Allocator;

const Math = @import("./math.zig");
const Compiler = @import("./compiler.zig");

const Value = @import("./value.zig").Value;
const Chunk = @import("./chunk.zig").Chunk;
const OpCode = @import("./opcode.zig").OpCode;
const FixedCapacityStack = @import("./stack.zig").FixedCapacityStack;

pub const InterpretResult = enum(u8) {
    INTERPRET_OK,
    INTERPRET_COMPILE_ERROR,
    INTERPRET_RUNTIME_ERROR,
};

const FRAMES_MAX = 64;
const STACK_MAX = FRAMES_MAX * (std.math.maxInt(u8) + 1);

pub const VM = struct {
    chunk: Chunk,
    ip: usize,

    stack: FixedCapacityStack(Value),

    pub fn create() VM {
        return VM{
            .chunk = undefined,
            .ip = undefined,
            .stack = undefined,
        };
    }

    pub fn init(self: *VM, backingAllocator: Allocator) !void {
        self.stack = try FixedCapacityStack(Value).init(backingAllocator, STACK_MAX);
        errdefer self.resetStack() catch unreachable;
    }

    pub fn deinit(self: *VM) void {
        self.stack.deinit();
    }

    // pub fn interpret(self: *VM, chunk: *Chunk) InterpretResult {
    pub fn interpret(self: *VM, code: []const u8) InterpretResult {
        _ = self;
        Compiler.compile(code);

        return InterpretResult.INTERPRET_OK;

        // self.chunk = chunk.*;
        // self.ip = 0;

        // return self.run();
    }

    fn run(self: *VM) InterpretResult {
        while (self.ip <= self.chunk.code.items.len) {
            // Only for debugging purposes.
            _ = self.chunk.disassembleInstruction(self.ip);
            try self.printStack();

            const instruction = self.chunk.code.items[self.ip];
            const opcode = @as(OpCode, @enumFromInt(instruction));

            // Go into the next instruction for the next iteration.
            self.ip += 1;

            switch (opcode) {
                OpCode.Return => {
                    const last_value = self.pop();
                    std.debug.print("\nValue at the end of the main program : {d}\n", .{last_value});

                    return InterpretResult.INTERPRET_OK;
                },
                OpCode.Negate => {
                    const value = self.stack.items[self.stack.items.len - 1];
                    self.stack.items[self.stack.items.len - 1] = -value;
                },
                OpCode.Constant => {
                    // We read the constant index from the next byte.
                    const constant_index = self.chunk.code.items[self.ip];
                    const constant = self.chunk.constants.items[constant_index];
                    // Go into the next instruction for the next iteration.
                    self.ip += 1;

                    self.stack.append(constant);
                },

                // Binary operators.
                OpCode.Add => try self.binaryOperation(Math.add),
                OpCode.Substract => try self.binaryOperation(Math.sub),
                OpCode.Multiply => try self.binaryOperation(Math.mul),
                OpCode.Divide => try self.binaryOperation(Math.div),
            }
        }

        return InterpretResult.INTERPRET_OK;
    }

    pub fn push(self: *VM, value: Value) void {
        self.stack.append(value);
    }

    fn peek(self: *VM, back: usize) Value {
        return self.stack.items[self.stack.items.len - 1 - back];
    }

    pub fn pop(self: *VM) Value {
        return self.stack.pop();
    }

    fn resetStack(self: *VM) !void {
        try self.stack.resize(0);
    }

    fn printStack(self: *VM) !void {
        std.debug.print("vm.stack {s}", .{
            if (self.stack.items.len > 0) "=> " else "is empty",
        });

        for (self.stack.items) |value| {
            std.debug.print("[ {d} ]", .{value});
        }

        std.debug.print("\n", .{});
    }

    fn binaryOperation(self: *VM, comptime op: anytype) !void {
        const rhs = self.pop();
        const lhs = self.pop();

        self.push(op(lhs, rhs));
    }
};
