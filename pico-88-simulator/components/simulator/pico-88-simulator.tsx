"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Pico88CPU } from "@/core/pico-88-cpu";
import { assemble } from "@/core/assembler";
import { CodeEditor } from "./code-editor";
import { ControlPanel } from "./control-panel";
import { CpuStatus } from "./cpu-status";
import { MemoryView } from "./memory-view";
import { DisplayUnit } from "./display-unit";
import { StackView } from "./stack-view";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

type CpuSnapshot = {
  registers: Uint8Array;
  pc: number;
  sp: number;
  flags: { Z: number; N: number; C: number };
  mainMemory: Uint8Array;
  framebuffer: Uint8Array;
  vram: Uint8Array;
  sevenSegmentMemory: Uint8Array;
  stackMemory: Uint8Array;
  lastAccessedBank: number;
  isHalted: boolean;
};

const takeSnapshot = (cpu: Pico88CPU): CpuSnapshot => ({
  registers: new Uint8Array(cpu.registers),
  pc: cpu.pc,
  sp: cpu.sp,
  flags: { ...cpu.flags },
  mainMemory: new Uint8Array(cpu.mainMemory),
  framebuffer: new Uint8Array(cpu.framebuffer),
  vram: new Uint8Array(cpu.vram),
  sevenSegmentMemory: new Uint8Array(cpu.sevenSegmentMemory),
  stackMemory: new Uint8Array(cpu.stackMemory),
  lastAccessedBank: cpu.lastAccessedBank,
  isHalted: cpu.isHalted,
});

export function Pico88Simulator({ isActive = true }: { isActive?: boolean }) {
  const [cpu] = useState(() => new Pico88CPU());
  const [cpuSnapshot, setCpuSnapshot] = useState<CpuSnapshot>(() =>
    takeSnapshot(cpu)
  );

  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(10);
  const [flipTrigger, setFlipTrigger] = useState(0);

  const updateSnapshot = useCallback(() => {
    setCpuSnapshot(takeSnapshot(cpu));
  }, [cpu]);

  const handleStep = useCallback(() => {
    const pcAddr = cpu.pc;
    const opBefore = cpu.mainMemory[pcAddr] >> 4;
    const subOpBefore = cpu.mainMemory[pcAddr + 1];
    cpu.step();
    if (cpu.isHalted) setIsRunning(false);
    if (opBefore === 0xf && (subOpBefore === 0x10 || subOpBefore === 0x11)) {
      setFlipTrigger((prev) => prev + 1);
    }
    updateSnapshot();
  }, [cpu, updateSnapshot]);

  useEffect(() => {
    if (!isRunning || cpu.isHalted || !isActive) return;
    const interval = 1000 / speed;
    const timerId = setInterval(() => {
      handleStep();
    }, interval);
    return () => clearInterval(timerId);
  }, [isRunning, speed, handleStep, cpu, isActive]);

  const handleAssembleAndLoad = useCallback(
    (code: string) => {
      const result = assemble(code);
      if (result.error) {
        toast.error(`アセンブルエラー (Line: ${result.errorLine})`, {
          description: result.error,
        });
      } else {
        cpu.loadProgram(result.bytecode);
        updateSnapshot();
        setFlipTrigger(0);
        toast.success("アセンブル成功", {
          description: `${result.bytecode.length} バイトのコードをメモリにロードしました。`,
        });
      }
    },
    [cpu, updateSnapshot]
  );

  const handleReset = useCallback(() => {
    setIsRunning(false);
    cpu.reset();
    updateSnapshot();
    setFlipTrigger((t) => t + 1);
  }, [cpu, updateSnapshot]);

  const handleButtonChange = useCallback(
    (buttonIndex: number, isPressed: boolean) => {
      cpu.setButtonState(buttonIndex, isPressed);
      updateSnapshot();
    },
    [cpu, updateSnapshot]
  );

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-2rem)] w-full p-4 gap-4 bg-background">
        <div className="w-full lg:w-1/2 flex flex-col gap-4 lg:overflow-y-auto">
          <CodeEditor onAssembleRequest={handleAssembleAndLoad} />
          <MemoryView
            mainMemory={cpuSnapshot.mainMemory}
            stackMemory={cpuSnapshot.stackMemory}
            activeBank={cpuSnapshot.lastAccessedBank}
            pc={cpuSnapshot.pc}
            sp={cpuSnapshot.sp}
          />
        </div>
        <div className="w-full lg:w-1/2 flex flex-col gap-4 lg:overflow-y-auto">
          <DisplayUnit
            framebuffer={cpuSnapshot.framebuffer}
            vram={cpuSnapshot.vram}
            sevenSegmentMemory={cpuSnapshot.sevenSegmentMemory}
            flipTrigger={flipTrigger}
            onButtonChange={handleButtonChange}
          />
          <ControlPanel
            isRunning={isRunning}
            isHalted={cpuSnapshot.isHalted}
            speed={speed}
            onRunPause={() => setIsRunning(!isRunning)}
            onStep={handleStep}
            onReset={handleReset}
            onSpeedChange={setSpeed}
          />
          <CpuStatus
            registers={cpuSnapshot.registers}
            pc={cpuSnapshot.pc}
            sp={cpuSnapshot.sp}
            flags={cpuSnapshot.flags}
            isHalted={cpuSnapshot.isHalted}
            activeBank={cpuSnapshot.lastAccessedBank}
          />
          <StackView
            stackMemory={cpuSnapshot.stackMemory}
            sp={cpuSnapshot.sp}
          />
        </div>
      </div>
      <Toaster />
    </>
  );
}
