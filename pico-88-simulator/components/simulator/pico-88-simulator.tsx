"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
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

export function Pico88Simulator() {
  const cpuRef = useRef(new Pico88CPU());

  const [cpuSnapshot, setCpuSnapshot] = useState<CpuSnapshot>({
    registers: new Uint8Array(cpuRef.current.registers),
    pc: cpuRef.current.pc,
    sp: cpuRef.current.sp,
    flags: { ...cpuRef.current.flags },
    mainMemory: new Uint8Array(cpuRef.current.mainMemory),
    framebuffer: new Uint8Array(cpuRef.current.framebuffer),
    vram: new Uint8Array(cpuRef.current.vram),
    sevenSegmentMemory: new Uint8Array(cpuRef.current.sevenSegmentMemory),
    stackMemory: new Uint8Array(cpuRef.current.stackMemory),
    lastAccessedBank: cpuRef.current.lastAccessedBank,
    isHalted: cpuRef.current.isHalted,
  });

  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(10);
  const [flipTrigger, setFlipTrigger] = useState(0);

  const updateSnapshot = useCallback(() => {
    const cpu = cpuRef.current;
    setCpuSnapshot({
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
  }, []);

  const handleStep = useCallback(() => {
    const cpu = cpuRef.current;
    const pcAddr = cpu.pc;
    const opBefore = cpu.mainMemory[pcAddr] >> 4;
    const subOpBefore = cpu.mainMemory[pcAddr + 1];
    cpu.step();
    if (opBefore === 0xf && (subOpBefore === 0x10 || subOpBefore === 0x11)) {
      setFlipTrigger((prev) => prev + 1);
    }
    updateSnapshot();
  }, [updateSnapshot]);

  useEffect(() => {
    if (!isRunning || cpuRef.current.isHalted) {
      setIsRunning(false);
      return;
    }
    const interval = 1000 / speed;
    const timerId = setInterval(() => {
      handleStep();
    }, interval);
    return () => clearInterval(timerId);
  }, [isRunning, speed, handleStep]);

  const handleAssembleAndLoad = useCallback(
    (code: string) => {
      const result = assemble(code);
      if (result.error) {
        toast.error(`アセンブルエラー (Line: ${result.errorLine})`, {
          description: result.error,
        });
      } else {
        cpuRef.current.loadProgram(result.bytecode);
        updateSnapshot();
        setFlipTrigger(0);
        toast.success("アセンブル成功", {
          description: `${result.bytecode.length} バイトのコードをメモリにロードしました。`,
        });
      }
    },
    [updateSnapshot]
  );

  const handleReset = useCallback(() => {
    setIsRunning(false);
    cpuRef.current.reset();
    updateSnapshot();
    setFlipTrigger((t) => t + 1);
  }, [updateSnapshot]);

  const handleButtonChange = useCallback(
    (buttonIndex: number, isPressed: boolean) => {
      cpuRef.current.setButtonState(buttonIndex, isPressed);
      updateSnapshot();
    },
    [updateSnapshot]
  );

  return (
    <>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-2rem)] w-full p-4 gap-4 bg-background">
        <div className="w-full lg:w-1/2 flex flex-col gap-4 overflow-y-auto">
          <CodeEditor onAssembleRequest={handleAssembleAndLoad} />
          <MemoryView
            mainMemory={cpuSnapshot.mainMemory}
            stackMemory={cpuSnapshot.stackMemory}
            activeBank={cpuSnapshot.lastAccessedBank}
            pc={cpuSnapshot.pc}
            sp={cpuSnapshot.sp}
          />
        </div>
        <div className="w-full lg:w-1/2 flex flex-col gap-4 overflow-y-auto">
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
