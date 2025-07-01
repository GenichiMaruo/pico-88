import { ISA, FormatType } from "./isa";

// 型定義: AssembleResult
export type AssembleResult = {
  bytecode: Uint8Array;
  sourceMap: Map<number, number>;
  error?: string;
  errorLine?: number;
};

// (parseRegister, parseValue関数は変更なし)
const parseRegister = (reg: string): number | null => {
  if (!reg || !/^[Rr][0-3]$/.test(reg)) return null;
  return parseInt(reg.substring(1), 10);
};
const parseValue = (val: string): number | null => {
  if (!val) return null;
  const v = val.startsWith("#") ? val.substring(1) : val;
  if (v.toLowerCase().startsWith("0x")) return parseInt(v.substring(2), 16);
  if (/^\d+$/.test(v)) return parseInt(v, 10);
  return null;
};

export function assemble(sourceCode: string): AssembleResult {
  const lines = sourceCode.split("\n");
  const bytecode: number[] = [];
  const sourceMap = new Map<number, number>();
  const labels = new Map<string, number>();
  const patches: {
    line: number;
    type: "J" | "I" | "A";
    label: string;
    offset: number;
  }[] = [];

  // 1パス目: ラベルを収集し、アドレスを計算
  let currentAddress = 0;
  for (let i = 0; i < lines.length; i++) {
    const lineNumber = i + 1;
    const line = lines[i].split("//")[0].trim();
    if (!line) continue;
    const commands = line
      .split(";")
      .map((cmd) => cmd.trim())
      .filter((cmd) => cmd);
    for (const command of commands) {
      if (command.endsWith(":")) {
        const label = command.slice(0, -1).trim().toUpperCase();
        if (!/^[A-Z_][A-Z0-9_]*$/i.test(label))
          return {
            bytecode: new Uint8Array(),
            sourceMap,
            error: `Invalid label name: "${label}"`,
            errorLine: lineNumber,
          };
        if (labels.has(label))
          return {
            bytecode: new Uint8Array(),
            sourceMap,
            error: `Duplicate label definition: "${label}"`,
            errorLine: lineNumber,
          };
        labels.set(label, currentAddress);
        continue;
      }
      const parts = command
        .replace(/,/g, " ")
        .split(/\s+/)
        .filter((s) => s);
      if (parts.length === 0) continue;

      if (parts[0].toUpperCase() === "DB") {
        currentAddress += parts.length - 1;
      } else {
        currentAddress += 2;
      }
    }
  }

  // 2パス目: バイトコードを生成
  currentAddress = 0;
  for (let i = 0; i < lines.length; i++) {
    const lineNumber = i + 1;
    const line = lines[i].split("//")[0].trim();
    if (!line) continue;
    const commands = line
      .split(";")
      .map((cmd) => cmd.trim())
      .filter((cmd) => cmd);
    for (const command of commands) {
      if (command.endsWith(":")) continue;
      const mnemonic = command.split(/\s+/)[0].toUpperCase();
      const operandStr = command.substring(mnemonic.length).trim();
      let operands = operandStr
        .replace(/,/g, " ")
        .split(/\s+/)
        .filter((s) => s);
      if (mnemonic === "DB") {
        for (const op of operands) {
          const value = parseValue(op);
          if (value === null || value < 0 || value > 255)
            return {
              bytecode: new Uint8Array(),
              sourceMap,
              error: `Invalid byte value in DB directive: ${op}`,
              errorLine: lineNumber,
            };
          bytecode.push(value);
          sourceMap.set(currentAddress, lineNumber);
          currentAddress++;
        }
        continue;
      }
      let instruction;
      const isRegToReg =
        operands.length > 1 && parseRegister(operands[1]) !== null;
      if (mnemonic === "MOV") {
        if (operands.length < 2)
          return {
            bytecode: new Uint8Array(),
            sourceMap,
            error: `Insufficient operands for MOV`,
            errorLine: lineNumber,
          };
        instruction = isRegToReg ? ISA.MOV_RR : ISA.MOV_RI;
      } else if (mnemonic === "CMP") {
        if (operands.length < 2)
          return {
            bytecode: new Uint8Array(),
            sourceMap,
            error: `Insufficient operands for CMP`,
            errorLine: lineNumber,
          };
        instruction = isRegToReg ? ISA.CMP_RR : ISA.CMP_RI;
      } else if (mnemonic === "AND") {
        if (operands.length < 2)
          return {
            bytecode: new Uint8Array(),
            sourceMap,
            error: `Insufficient operands for AND`,
            errorLine: lineNumber,
          };
        instruction = isRegToReg ? ISA.AND_RR : ISA.AND_RI;
      } else if (mnemonic === "OR") {
        if (operands.length < 2)
          return {
            bytecode: new Uint8Array(),
            sourceMap,
            error: `Insufficient operands for OR`,
            errorLine: lineNumber,
          };
        instruction = isRegToReg ? ISA.OR_RR : ISA.OR_RI;
      } else if (mnemonic === "XOR") {
        if (operands.length < 2)
          return {
            bytecode: new Uint8Array(),
            sourceMap,
            error: `Insufficient operands for XOR`,
            errorLine: lineNumber,
          };
        instruction = isRegToReg ? ISA.XOR_RR : ISA.XOR_RI;
      } else if (mnemonic === "LD" || mnemonic === "ST") {
        const addrPart = operandStr.match(/\[(.*?)\]/);
        if (addrPart) {
          const content = addrPart[1].trim();
          instruction =
            parseRegister(content) !== null
              ? mnemonic === "LD"
                ? ISA.LD_INDIRECT
                : ISA.ST_INDIRECT
              : mnemonic === "LD"
              ? ISA.LD_ABSOLUTE
              : ISA.ST_ABSOLUTE;
          const registerOperand = operandStr
            .replace(addrPart[0], "")
            .replace(/,/g, "")
            .trim();
          operands = [registerOperand, content];
        }
      } else {
        const key = Object.keys(ISA).find((k) => k === mnemonic);
        if (key) instruction = ISA[key as keyof typeof ISA];
      }
      if (!instruction)
        return {
          bytecode: new Uint8Array(),
          sourceMap,
          error: `Unknown mnemonic or invalid operands: "${mnemonic}"`,
          errorLine: lineNumber,
        };
      let highByte = instruction.op << 4;
      let lowByte = 0;
      sourceMap.set(currentAddress, lineNumber);
      switch (instruction.format) {
        case FormatType.R:
        case FormatType.U: {
          const rd = parseRegister(operands[0]);
          const rs =
            instruction.format === FormatType.R
              ? parseRegister(operands[1])
              : 0;
          if (
            rd === null ||
            (instruction.format === FormatType.R && rs === null)
          )
            return {
              bytecode: new Uint8Array(),
              sourceMap,
              error: `Invalid register for ${mnemonic}`,
              errorLine: lineNumber,
            };
          highByte |= instruction.op === ISA.PUSH.op ? rd : rd << 2;
          if (instruction.format === FormatType.R && rs !== null)
            highByte |= rs;
          lowByte = instruction.sub;
          break;
        }
        case FormatType.I: {
          const isBank = instruction.op === ISA.BANK.op;
          const rd = isBank ? 0 : parseRegister(operands[0]);
          const valueOperand = isBank ? operands[0] : operands[1];
          if (rd === null)
            return {
              bytecode: new Uint8Array(),
              sourceMap,
              error: `Invalid register for ${mnemonic}`,
              errorLine: lineNumber,
            };
          if (!valueOperand)
            return {
              bytecode: new Uint8Array(),
              sourceMap,
              error: `Missing immediate value for ${mnemonic}`,
              errorLine: lineNumber,
            };
          if (!isBank) highByte |= rd << 2;
          if (instruction.op === 0xd) highByte |= instruction.sub;
          const value = parseValue(valueOperand);
          if (value === null) {
            const labelName = valueOperand.startsWith("#")
              ? valueOperand.substring(1)
              : valueOperand;
            patches.push({
              line: lineNumber,
              type: "I",
              label: labelName.toUpperCase(),
              offset: currentAddress + 1,
            });
          } else {
            if (value < 0 || value > 255)
              return {
                bytecode: new Uint8Array(),
                sourceMap,
                error: `Immediate value out of range (0-255): ${value}`,
                errorLine: lineNumber,
              };
            lowByte = value;
          }
          break;
        }
        case FormatType.M: {
          const reg1 = parseRegister(operands[0]);
          const reg2 = parseRegister(operands[1]);
          if (reg1 === null || reg2 === null)
            return {
              bytecode: new Uint8Array(),
              sourceMap,
              error: `Invalid register in indirect operand for ${mnemonic}`,
              errorLine: lineNumber,
            };
          const rd_or_ra = mnemonic === "LD" ? reg1 : reg2;
          const rs_or_ra = mnemonic === "LD" ? reg2 : reg1;
          highByte |=
            instruction.op === ISA.LD_INDIRECT.op
              ? (rd_or_ra << 2) | rs_or_ra
              : (rs_or_ra << 2) | rd_or_ra;
          lowByte = instruction.sub;
          break;
        }
        case FormatType.A: {
          const rd_or_rs = parseRegister(operands[0]);
          if (rd_or_rs === null)
            return {
              bytecode: new Uint8Array(),
              sourceMap,
              error: `Invalid register for ${mnemonic}`,
              errorLine: lineNumber,
            };
          highByte |= rd_or_rs << 2;
          highByte |= instruction.sub & 0x3;
          const value = parseValue(operands[1]);
          if (value === null) {
            patches.push({
              line: lineNumber,
              type: "A",
              label: operands[1].toUpperCase(),
              offset: currentAddress + 1,
            });
          } else {
            if (value < 0 || value > 255)
              return {
                bytecode: new Uint8Array(),
                sourceMap,
                error: `Absolute address out of range (0-255): ${value}`,
                errorLine: lineNumber,
              };
            lowByte = value;
          }
          break;
        }
        case FormatType.J: {
          const label = operands[0];
          if (!label)
            return {
              bytecode: new Uint8Array(),
              sourceMap,
              error: `Missing label for ${mnemonic}`,
              errorLine: lineNumber,
            };
          if (mnemonic === "JC") highByte |= ISA.JC.sub << 2;
          const address = labels.get(label.toUpperCase());
          if (address === undefined) {
            patches.push({
              line: lineNumber,
              type: "J",
              label: label.toUpperCase(),
              offset: currentAddress + 1,
            });
          } else lowByte = address;
          break;
        }
        case FormatType.S:
          lowByte = instruction.sub;
          break;
      }
      bytecode.push(highByte, lowByte);
      currentAddress += 2;
    }
  }

  // ラベル解決の最終処理
  for (const patch of patches) {
    const address = labels.get(patch.label);
    if (address === undefined)
      return {
        bytecode: new Uint8Array(),
        sourceMap,
        error: `Label not found: "${patch.label}"`,
        errorLine: patch.line,
      };
    if (address < 0 || address > 255)
      return {
        bytecode: new Uint8Array(),
        sourceMap,
        error: `Label address out of range: ${address}`,
        errorLine: patch.line,
      };
    bytecode[patch.offset] = address;
  }
  return { bytecode: new Uint8Array(bytecode), sourceMap };
}
