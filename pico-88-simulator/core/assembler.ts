// /core/assembler.ts (v2.2 絶対アドレス対応版)
import { ISA, FormatType } from "./isa";

export interface AssembleResult {
  bytecode: Uint8Array;
  sourceMap: Map<number, number>;
  error?: string;
  errorLine?: number;
}

const parseRegister = (reg: string): number | null => {
  if (!reg || !/^[Rr][0-3]$/.test(reg)) return null;
  return parseInt(reg.substring(1), 10);
};

const parseValue = (val: string): number | null => {
  if (!val) return null;
  const value = val.startsWith("#") ? val.substring(1) : val;
  if (value.toLowerCase().startsWith("0x"))
    return parseInt(value.substring(2), 16);
  if (/^\d+$/.test(value)) return parseInt(value, 10);
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

  // 1パス目: ラベルの位置を解決
  let currentAddress = 0;
  for (let i = 0; i < lines.length; i++) {
    const lineNumber = i + 1;
    const line = lines[i].split("//")[0].trim();
    if (!line) continue;
    if (line.endsWith(":")) {
      const label = line.slice(0, -1).trim().toUpperCase();
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
    currentAddress += 2;
  }

  // 2パス目: バイトコード生成
  currentAddress = 0;
  for (let i = 0; i < lines.length; i++) {
    const lineNumber = i + 1;
    const line = lines[i].split("//")[0].trim();
    if (!line || line.endsWith(":")) continue;

    const mnemonic = line.split(/\s+/)[0];
    const operandStr = line.substring(mnemonic.length).trim();

    let instruction;
    let operands = operandStr
      .replace(/,/g, " ")
      .split(/\s+/)
      .filter((s) => s);

    // LD/ST命令を特別に解決
    if (mnemonic.toUpperCase() === "LD" || mnemonic.toUpperCase() === "ST") {
      const addrPart = operandStr.match(/\[(.*?)\]/);
      if (addrPart) {
        const content = addrPart[1].trim();
        // 角括弧の中身がレジスタかどうかで分岐
        if (parseRegister(content) !== null) {
          instruction =
            mnemonic.toUpperCase() === "LD" ? ISA.LD_INDIRECT : ISA.ST_INDIRECT;
        } else {
          instruction =
            mnemonic.toUpperCase() === "LD" ? ISA.LD_ABSOLUTE : ISA.ST_ABSOLUTE;
        }
        // オペランドを再構築 [レジスタ, 角括弧の中身]
        operands = [operandStr.split(",")[0].trim(), content];
      }
    } else {
      // その他の命令
      let key = Object.keys(ISA).find(
        (k) => k.toUpperCase() === mnemonic.toUpperCase()
      );
      if (mnemonic.toUpperCase() === "JC") key = "JC"; // JCを優先
      if (key && !key.startsWith("LD_") && !key.startsWith("ST_")) {
        instruction = ISA[key as keyof typeof ISA];
      }
    }

    // MOV/CMPなどオペランドで決まる命令の解決
    if (!instruction) {
      if (mnemonic.toUpperCase() === "MOV") {
        if (operands.length < 2)
          return {
            bytecode: new Uint8Array(),
            sourceMap,
            error: `Insufficient operands for MOV`,
            errorLine: lineNumber,
          };
        instruction =
          operands[1].startsWith("#") || parseValue(operands[1]) !== null
            ? ISA.MOV_RI
            : ISA.MOV_RR;
      } else if (mnemonic.toUpperCase() === "CMP") {
        if (operands.length < 2)
          return {
            bytecode: new Uint8Array(),
            sourceMap,
            error: `Insufficient operands for CMP`,
            errorLine: lineNumber,
          };
        instruction =
          operands[1].startsWith("#") || parseValue(operands[1]) !== null
            ? ISA.CMP_RI
            : ISA.CMP_RR;
      }
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
          instruction.format === FormatType.R ? parseRegister(operands[1]) : 0;
        if (rd === null || (instruction.format === FormatType.R && rs === null))
          return {
            bytecode: new Uint8Array(),
            sourceMap,
            error: `Invalid register for ${mnemonic}`,
            errorLine: lineNumber,
          };
        highByte |= instruction.op === ISA.PUSH.op ? rd : rd << 2;
        if (instruction.format === FormatType.R && rs !== null) highByte |= rs;
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
        const value = parseValue(valueOperand);
        if (value === null) {
          if (valueOperand.startsWith("#"))
            return {
              bytecode: new Uint8Array(),
              sourceMap,
              error: `Invalid immediate value: ${valueOperand}`,
              errorLine: lineNumber,
            };
          patches.push({
            line: lineNumber,
            type: "I",
            label: valueOperand.toUpperCase(),
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
        // Indirect: ST Rs, [Ra]
        const rd_or_rs = parseRegister(operands[0]);
        const ra = parseRegister(operands[1]);
        if (rd_or_rs === null || ra === null)
          return {
            bytecode: new Uint8Array(),
            sourceMap,
            error: `Invalid register in indirect operand for ${mnemonic}`,
            errorLine: lineNumber,
          };
        highByte |=
          instruction.op === ISA.LD_INDIRECT.op
            ? (rd_or_rs << 2) | ra
            : (ra << 2) | rd_or_rs;
        lowByte = instruction.sub;
        break;
      }
      case FormatType.A: {
        // Absolute: ST Rs, [addr]
        const rd_or_rs = parseRegister(operands[0]);
        if (rd_or_rs === null)
          return {
            bytecode: new Uint8Array(),
            sourceMap,
            error: `Invalid register for ${mnemonic}`,
            errorLine: lineNumber,
          };
        highByte |= rd_or_rs << 2;
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
        // highByteのサブオペコード部分に、絶対アドレスモードを示す値をセット
        highByte |= instruction.sub & 0x3;
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
        if (mnemonic.toUpperCase() === "JC") highByte |= ISA.JC.sub << 2;
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

  // 最終パス
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
