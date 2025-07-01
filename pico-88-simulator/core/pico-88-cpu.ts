// /core/pico-88-cpu.ts (機能拡張版)

export class Pico88CPU {
  // --- CPU State ---
  registers = new Uint8Array(4);
  pc = 0;
  sp = 0;
  flags = { Z: 0, N: 0, C: 0 };
  isHalted = false;

  // --- Memory Architecture ---
  mainMemory = new Uint8Array(1024);
  vram = new Uint8Array(128);
  framebuffer = new Uint8Array(128);
  sevenSegmentMemory = new Uint8Array(3);
  stackMemory = new Uint8Array(256);
  buttonState = 0;

  private nextBankPrefix: number | null = null;
  public lastAccessedBank = 0;

  private initialMainMemory = new Uint8Array(1024);

  constructor() {
    this.reset();
  }

  reset() {
    this.registers.fill(0);
    this.pc = 0;
    this.sp = 0xff;
    this.flags = { Z: 0, N: 0, C: 0 };
    this.isHalted = false;
    this.mainMemory.set(this.initialMainMemory);
    this.vram.fill(0);
    this.framebuffer.fill(0);
    this.sevenSegmentMemory.fill(0);
    this.stackMemory.fill(0);
    this.buttonState = 0;
    this.nextBankPrefix = null;
    this.lastAccessedBank = 0;
  }

  loadProgram(program: Uint8Array) {
    this.registers.fill(0);
    this.pc = 0;
    this.sp = 0xff;
    this.flags = { Z: 0, N: 0, C: 0 };
    this.isHalted = false;
    this.mainMemory.fill(0);
    this.vram.fill(0);
    this.framebuffer.fill(0);
    this.sevenSegmentMemory.fill(0);
    this.stackMemory.fill(0);
    this.buttonState = 0;
    this.nextBankPrefix = null;
    this.lastAccessedBank = 0;

    program.forEach((byte, index) => {
      if (index <= 0xfd) this.mainMemory[index] = byte;
    });

    this.initialMainMemory.set(this.mainMemory);
  }

  // ★追加点: UIからのボタン状態設定用メソッド
  setButtonState(buttonIndex: number, isPressed: boolean) {
    if (isPressed) {
      this.buttonState |= 1 << buttonIndex;
    } else {
      this.buttonState &= ~(1 << buttonIndex);
    }
  }

  // --- メモリ・I/Oヘルパー (I/Oポート対応) ---
  private _getBankToUse(): number {
    const bank = this.nextBankPrefix ?? 0;
    this.lastAccessedBank = bank;
    this.nextBankPrefix = null;
    return bank;
  }

  private _getMem(addr: number): number {
    // I/Oポートへの読み込みアクセス
    switch (addr) {
      case 0xf0:
        return this.sevenSegmentMemory[0];
      case 0xf1:
        return this.sevenSegmentMemory[1];
      case 0xf2:
        return this.sevenSegmentMemory[2];
      case 0xf3:
        return this.buttonState;
      case 0xf4:
        return new Date().getHours();
      case 0xf5:
        return new Date().getMinutes();
      case 0xf6:
        return new Date().getSeconds();
      case 0xfe:
        return this._getBankToUse();
    }

    const bank = this._getBankToUse();
    return this.mainMemory[bank * 256 + addr];
  }

  private _setMem(addr: number, value: number) {
    // I/Oポートへの書き込みアクセス
    switch (addr) {
      case 0xf0:
        this.sevenSegmentMemory[0] = value;
        return;
      case 0xf1:
        this.sevenSegmentMemory[1] = value;
        return;
      case 0xf2:
        this.sevenSegmentMemory[2] = value;
        return;
      case 0xf3:
        /* Read-only */ return;
      case 0xf4:
        /* Read-only */ return;
      case 0xf5:
        /* Read-only */ return;
      case 0xf6:
        /* Read-only */ return;
      case 0xfe:
        /* No-op */ return;
    }

    const bank = this._getBankToUse();
    this.mainMemory[bank * 256 + addr] = value;
  }

  step() {
    if (this.isHalted) return;

    this.lastAccessedBank = 0;

    const pcAddr = this.pc;
    const highByte = this.mainMemory[pcAddr];
    const lowByte = this.mainMemory[pcAddr + 1];

    const op = (highByte >> 4) & 0x0f;

    if (op === 0xe) {
      this.nextBankPrefix = lowByte & 0x03;
      this.pc = (this.pc + 2) & 0xff;
      return;
    }

    this.pc = (this.pc + 2) & 0xff;
    const rd = (highByte >> 2) & 0x03;
    const rs = highByte & 0x03;
    const immediate = lowByte;
    const address = lowByte;

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
          if (op === 0x4) this.registers[rd] = this._getMem(this.registers[rs]);
          else this._setMem(this.registers[rs], this.registers[rd]);
        } else {
          if (op === 0x4) this.registers[rd] = this._getMem(address);
          else this._setMem(address, this.registers[rd]);
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
      case 0x8:
        this.pc = address;
        break;
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
        this.stackMemory[this.sp] = this.pc & 0xff;
        this.sp = (this.sp - 1) & 0xff;
        this.pc = address;
        break;
      }
      case 0xc: {
        const s = lowByte;
        if (s === 0x0) {
          this.stackMemory[this.sp] = this.registers[rs];
          this.sp = (this.sp - 1) & 0xff;
        } else if (s === 0x1) {
          this.sp = (this.sp + 1) & 0xff;
          this.registers[rd] = this.stackMemory[this.sp];
        } else if (s === 0xf0) {
          for (let i = 3; i >= 0; i--) {
            this.stackMemory[this.sp] = this.registers[i];
            this.sp = (this.sp - 1) & 0xff;
          }
        } else if (s === 0xf1) {
          for (let i = 0; i <= 3; i++) {
            this.sp = (this.sp + 1) & 0xff;
            this.registers[i] = this.stackMemory[this.sp];
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
            // RET
            // ★変更点: RETは専用スタックメモリを使用
            this.sp = (this.sp + 1) & 0xff;
            this.pc = this.stackMemory[this.sp];
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
          case 0x18: {
            const x = this.registers[1] & 0x0f,
              y = this.registers[2] & 0x0f,
              c = this.registers[3] & 0x0f,
              a = y * 8 + Math.floor(x / 2);
            if (a < 128 && x < 16 && y < 16) {
              if (x % 2 === 0)
                this.framebuffer[a] = (this.framebuffer[a] & 0x0f) | (c << 4);
              else this.framebuffer[a] = (this.framebuffer[a] & 0xf0) | c;
            }
            break;
          }
          case 0x19: {
            const x = this.registers[1] & 0x0f,
              y = this.registers[2] & 0x0f,
              c = this.registers[3] & 0x0f,
              a = y * 8 + Math.floor(x / 2);
            if (a < 128 && x < 16 && y < 16) {
              if (x % 2 === 0) this.vram[a] = (this.vram[a] & 0x0f) | (c << 4);
              else this.vram[a] = (this.vram[a] & 0xf0) | c;
            }
            break;
          }
          case 0x20: {
            const src = this.registers[0],
              dst = this.registers[1],
              len = this.registers[2];
            for (let i = 0; i < len; i++)
              this._setMem((dst + i) & 0xff, this._getMem((src + i) & 0xff));
            break;
          }
          case 0x21:
            this.vram[this.registers[0] & 0x7f] = this.registers[1];
            break;
          case 0x22:
            this.registers[1] = this.vram[this.registers[0] & 0x7f];
            break;
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
