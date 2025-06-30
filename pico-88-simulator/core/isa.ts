// /core/isa.ts (v2.1)

export enum FormatType {
  R, // Register-to-Register
  I, // Immediate
  M, // Memory (Register Indirect)
  J, // Jump
  U, // Unary (one register)
  S, // System / No operand
  A, // Absolute Address
}

export const ISA = {
  'MOV_RR': { op: 0x0, sub: 0x0, format: FormatType.R },
  'MOV_RI': { op: 0x1, sub: 0x0, format: FormatType.I },
  'ADD':    { op: 0x2, sub: 0x0, format: FormatType.R },
  'SUB':    { op: 0x2, sub: 0x1, format: FormatType.R },
  'MUL':    { op: 0x2, sub: 0x2, format: FormatType.R },
  'DIV':    { op: 0x2, sub: 0x3, format: FormatType.R },
  'AND':    { op: 0x3, sub: 0x0, format: FormatType.R },
  'OR':     { op: 0x3, sub: 0x1, format: FormatType.R },
  'XOR':    { op: 0x3, sub: 0x2, format: FormatType.R },
  'NOT':    { op: 0x3, sub: 0x3, format: FormatType.U },
  'SHL':    { op: 0x3, sub: 0x4, format: FormatType.U },
  'SHR':    { op: 0x3, sub: 0x5, format: FormatType.U },
  'ROL':    { op: 0x3, sub: 0x6, format: FormatType.U },
  'ROR':    { op: 0x3, sub: 0x7, format: FormatType.U },
  'LD_INDIRECT':  { op: 0x4, sub: 0x0, format: FormatType.M }, // LD Rd, [Ra]
  'LD_ABSOLUTE':  { op: 0x4, sub: 0x1, format: FormatType.A }, // LD Rd, [addr]
  'ST_INDIRECT':  { op: 0x5, sub: 0x0, format: FormatType.M }, // ST Rs, [Ra]
  'ST_ABSOLUTE':  { op: 0x5, sub: 0x1, format: FormatType.A }, // ST Rs, [addr]
  'CMP_RR': { op: 0x6, sub: 0x0, format: FormatType.R },
  'CMP_RI': { op: 0x7, sub: 0x0, format: FormatType.I },
  'JMP':    { op: 0x8, sub: 0x0, format: FormatType.J },
  'JZ':     { op: 0x9, sub: 0x0, format: FormatType.J },
  'JC':     { op: 0x9, sub: 0x1, format: FormatType.J },
  'JNZ':    { op: 0xA, sub: 0x0, format: FormatType.J },
  'CALL':   { op: 0xB, sub: 0x0, format: FormatType.J },
  'PUSH':   { op: 0xC, sub: 0x0, format: FormatType.U },
  'POP':    { op: 0xC, sub: 0x1, format: FormatType.U },
  'PUSHALL':{ op: 0xC, sub: 0xF0, format: FormatType.S },
  'POPALL': { op: 0xC, sub: 0xF1, format: FormatType.S },
  'INC':    { op: 0xD, sub: 0x0, format: FormatType.U },
  'DEC':    { op: 0xD, sub: 0x1, format: FormatType.U },
  'BANK':   { op: 0xE, sub: 0x0, format: FormatType.I },
  // System/IO
  'NOP':    { op: 0xF, sub: 0x00, format: FormatType.S },
  'RET':    { op: 0xF, sub: 0x01, format: FormatType.S },
  'FLIP':   { op: 0xF, sub: 0x10, format: FormatType.S },
  'CLS':    { op: 0xF, sub: 0x11, format: FormatType.S },
  'BCLS':   { op: 0xF, sub: 0x12, format: FormatType.S },
  'PLOT':   { op: 0xF, sub: 0x18, format: FormatType.S },
  'BPLOT':  { op: 0xF, sub: 0x19, format: FormatType.S },
  'BLKCPY': { op: 0xF, sub: 0x20, format: FormatType.S },
  'VPOKE':  { op: 0xF, sub: 0x21, format: FormatType.S },
  'VPEEK':  { op: 0xF, sub: 0x22, format: FormatType.S },
  'HLT':    { op: 0xF, sub: 0xFF, format: FormatType.S },
} as const;
