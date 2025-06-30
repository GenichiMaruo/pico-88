// /core/pico-88-cpu.ts (v2.3 UI連携強化版)

export class Pico88CPU {
  // --- CPU State ---
  registers = new Uint8Array(4);
  pc = 0;
  sp = 0;
  flags = { Z: 0, N: 0, C: 0 };
  isHalted = false;

  // --- Memory Architecture v2.2 ---
  mainMemory = new Uint8Array(1024);
  vram = new Uint8Array(128);
  framebuffer = new Uint8Array(128);
  sevenSegmentValue = 0;

  private nextBankPrefix: number | null = null;
  // ★追加点: UI表示用に、最後にメモリアクセスで使われたバンクを保持
  public lastAccessedBank = 0;

  constructor() {
    this.reset();
  }

  reset() {
    this.registers.fill(0);
    this.pc = 0;
    this.sp = 0xff;
    this.flags = { Z: 0, N: 0, C: 0 };
    this.isHalted = false;
    this.mainMemory.fill(0);
    this.vram.fill(0);
    this.framebuffer.fill(0);
    this.sevenSegmentValue = 0;
    this.nextBankPrefix = null;
    this.lastAccessedBank = 0; // ★追加点
  }

  loadProgram(program: Uint8Array) {
    this.reset();
    program.forEach((byte, index) => {
      if (index <= 0xfd) this.mainMemory[index] = byte;
    });
  }

  // --- メモリ・I/Oヘルパー (プレフィックスバンク対応) ---
  private _getBankToUse(): number {
    const bank = this.nextBankPrefix ?? 0; // プレフィックスがなければ常にバンク0
    this.lastAccessedBank = bank; // ★追加点: 使われたバンクを記録
    this.nextBankPrefix = null; // プレフィックスは1回使ったら消費する
    return bank;
  }

  private _getMem(addr: number): number {
    const bank = this._getBankToUse();
    if (addr === 0xff) return this.sevenSegmentValue;
    if (addr === 0xfe) return bank;
    return this.mainMemory[bank * 256 + addr];
  }

  private _setMem(addr: number, value: number) {
    const bank = this._getBankToUse();
    if (addr === 0xff) {
      this.sevenSegmentValue = value;
      return;
    }
    if (addr === 0xfe) {
      /* No-op */ return;
    }
    this.mainMemory[bank * 256 + addr] = value;
  }

  step() {
    if (this.isHalted) return;

    // フェッチは常にバンク0から行う
    const pcAddr = this.pc;
    const highByte = this.mainMemory[pcAddr];
    const lowByte = this.mainMemory[pcAddr + 1];

    const op = (highByte >> 4) & 0x0f;

    if (op === 0xe) {
      // BANK #imm
      this.nextBankPrefix = lowByte & 0x03;
      this.pc = (this.pc + 2) & 0xff;
      return;
    }

    this.pc = (this.pc + 2) & 0xff;
    const rd = (highByte >> 2) & 0x03;
    const rs = highByte & 0x03;
    const immediate = lowByte;
    const address = lowByte;

    // (以降の命令セットはv2.1から変更ありません)
    switch (op) {
      case 0x0:
        this.registers[rd] = this.registers[rs];
        break;
      case 0x1:
        this.registers[rd] = immediate;
        break;
      case 0x2: {
        const subOp = lowByte & 0x0f;
        const val1 = this.registers[rd];
        const val2 = this.registers[rs];
        switch (subOp) {
          case 0x0: {
            const r = val1 + val2;
            this.registers[rd] = r & 0xff;
            this.flags.Z = !this.registers[rd] ? 1 : 0;
            this.flags.C = r > 0xff ? 1 : 0;
            break;
          }
          case 0x1: {
            const r = val1 - val2;
            this.registers[rd] = r & 0xff;
            this.flags.Z = !this.registers[rd] ? 1 : 0;
            this.flags.C = r < 0 ? 1 : 0;
            break;
          }
          case 0x2: {
            const r = val1 * val2;
            this.registers[0] = (r >> 8) & 0xff;
            this.registers[1] = r & 0xff;
            this.flags.Z = !r ? 1 : 0;
            this.flags.C = 0;
            break;
          }
          case 0x3: {
            if (val2 === 0) {
              this.flags.C = 1;
            } else {
              this.registers[0] = Math.floor(val1 / val2) & 0xff;
              this.registers[1] = val1 % val2 & 0xff;
              this.flags.Z = !this.registers[0] ? 1 : 0;
              this.flags.C = 0;
            }
            break;
          }
        }
        break;
      }
      case 0x3: {
        const subOp = lowByte & 0x0f;
        let v = this.registers[rd];
        switch (subOp) {
          case 0x0:
            v &= this.registers[rs];
            break;
          case 0x1:
            v |= this.registers[rs];
            break;
          case 0x2:
            v ^= this.registers[rs];
            break;
          case 0x3:
            v = ~v & 0xff;
            break;
          case 0x4: {
            this.flags.C = v & 0x80 ? 1 : 0;
            v = (v << 1) & 0xff;
            break;
          }
          case 0x5: {
            this.flags.C = v & 0x01 ? 1 : 0;
            v >>= 1;
            break;
          }
          case 0x6: {
            const c = v & 0x80 ? 1 : 0;
            v = ((v << 1) | c) & 0xff;
            this.flags.C = c;
            break;
          }
          case 0x7: {
            const c = v & 0x01 ? 1 : 0;
            v = (v >> 1) | (c << 7);
            this.flags.C = c;
            break;
          }
        }
        this.registers[rd] = v;
        this.flags.Z = !this.registers[rd] ? 1 : 0;
        break;
      }
      case 0x4:
      case 0x5: {
        const subOp = highByte & 0x3;
        if (subOp === 0) {
          if (op === 0x4) {
            this.registers[rd] = this._getMem(this.registers[rs]);
          } else {
            this._setMem(this.registers[rs], this.registers[rd]);
          }
        } else {
          if (op === 0x4) {
            this.registers[rd] = this._getMem(address);
          } else {
            this._setMem(address, this.registers[rd]);
          }
        }
        break;
      }
      case 0x6: {
        const r = this.registers[rd] - this.registers[rs];
        this.flags.Z = (r & 0xff) === 0 ? 1 : 0;
        this.flags.C = r < 0 ? 1 : 0;
        break;
      }
      case 0x7: {
        const r = this.registers[rd] - immediate;
        this.flags.Z = (r & 0xff) === 0 ? 1 : 0;
        this.flags.C = r < 0 ? 1 : 0;
        break;
      }
      case 0x8: {
        this.pc = address;
        break;
      }
      case 0x9: {
        const cbit = (highByte >> 2) & 0x1;
        if (
          (cbit === 0 && this.flags.Z === 1) ||
          (cbit === 1 && this.flags.C === 1)
        )
          this.pc = address;
        break;
      }
      case 0xa: {
        if (this.flags.Z === 0) this.pc = address;
        break;
      }
      case 0xb: {
        this._setMem(this.sp, this.pc & 0xff);
        this.sp = (this.sp - 1) & 0xff;
        this.pc = address;
        break;
      }
      case 0xc: {
        const s = lowByte;
        if (s === 0x0) {
          this._setMem(this.sp, this.registers[rs]);
          this.sp = (this.sp - 1) & 0xff;
        } else if (s === 0x1) {
          this.sp = (this.sp + 1) & 0xff;
          this.registers[rd] = this._getMem(this.sp);
        } else if (s === 0xf0) {
          for (let i = 3; i >= 0; i--) {
            this._setMem(this.sp, this.registers[i]);
            this.sp = (this.sp - 1) & 0xff;
          }
        } else if (s === 0xf1) {
          for (let i = 0; i <= 3; i++) {
            this.sp = (this.sp + 1) & 0xff;
            this.registers[i] = this._getMem(this.sp);
          }
        }
        break;
      }
      case 0xd: {
        const s = lowByte & 0x0f;
        if (s === 0x0) this.registers[rd] = (this.registers[rd] + 1) & 0xff;
        else if (s === 0x1)
          this.registers[rd] = (this.registers[rd] - 1) & 0xff;
        this.flags.Z = !this.registers[rd] ? 1 : 0;
        break;
      }
      case 0xf: {
        const s = lowByte;
        switch (s) {
          case 0x01: {
            this.sp = (this.sp + 1) & 0xff;
            this.pc = this._getMem(this.sp);
            break;
          }
          case 0x10:
            this.framebuffer.set(this.vram);
            break;
          case 0x11:
            this.framebuffer.fill(0);
            break;
          case 0x12:
            this.vram.fill(0);
            break;
          case 0x18:
            {
              const x = this.registers[1] & 0x0f,
                y = this.registers[2] & 0x0f,
                c = this.registers[3] & 0x0f,
                a = y * 8 + Math.floor(x / 2);
              if (a < 128 && x < 16 && y < 16) {
                if (x % 2 === 0) {
                  this.framebuffer[a] = (this.framebuffer[a] & 0x0f) | (c << 4);
                } else {
                  this.framebuffer[a] = (this.framebuffer[a] & 0xf0) | c;
                }
              }
            }
            break;
          case 0x19:
            {
              const x = this.registers[1] & 0x0f,
                y = this.registers[2] & 0x0f,
                c = this.registers[3] & 0x0f,
                a = y * 8 + Math.floor(x / 2);
              if (a < 128 && x < 16 && y < 16) {
                if (x % 2 === 0) {
                  this.vram[a] = (this.vram[a] & 0x0f) | (c << 4);
                } else {
                  this.vram[a] = (this.vram[a] & 0xf0) | c;
                }
              }
            }
            break;
          case 0x20: {
            const src = this.registers[0],
              dst = this.registers[1],
              len = this.registers[2];
            for (let i = 0; i < len; i++)
              this._setMem((dst + i) & 0xff, this._getMem((src + i) & 0xff));
            break;
          }
          case 0x21: {
            this.vram[this.registers[0] & 0x7f] = this.registers[1];
            break;
          }
          case 0x22: {
            this.registers[1] = this.vram[this.registers[0] & 0x7f];
            break;
          }
          case 0xff:
            this.isHalted = true;
            break;
          default:
            break;
        }
        break;
      }
    }
  }
}
