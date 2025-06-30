"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { assemble } from "@/core/assembler";
import { toast } from "sonner";

// ★更新点: 新しいサンプルコード
const sampleCode = `
// PICO-88 v2.3 Sample Code
// Fills the screen with a color gradient,
// flipping the display one row at a time.

START:
  BCLS            // Clear the VRAM buffer
  MOV R2, #0      // R2 = Y counter, start at 0

Y_LOOP:
  MOV R1, #0      // R1 = X counter, reset for each row

X_LOOP:
  // Calculate color: C = X + Y
  MOV R0, R1      // R0 = X
  ADD R0, R2      // R0 = X + Y
  MOV R3, R0      // Set R3 (color register) for BPLOT

  // Plot one pixel to the VRAM buffer
  BPLOT

  // Increment X and loop if not at the end of the row
  INC R1
  CMP R1, #16
  JNZ X_LOOP

  // --- Row finished drawing to buffer ---
  FLIP            // Flip the entire VRAM to the screen

  // Increment Y and loop if not at the last row
  INC R2
  CMP R2, #16
  JNZ Y_LOOP

ALL_DONE:
  HLT             // Halt the CPU
`;

interface CodeEditorProps {
  onAssembleRequest: (code: string) => void;
}

export function CodeEditor({ onAssembleRequest }: CodeEditorProps) {
  const [asmCode, setAsmCode] = useState(sampleCode.trim());
  const [machineCode, setMachineCode] = useState("");
  const [isAsmMode, setIsAsmMode] = useState(true);
  const lineNumbersRef = useRef<HTMLPreElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleScroll = () => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleModeChange = (checked: boolean) => {
    if (checked) {
      setIsAsmMode(true);
    } else {
      const result = assemble(asmCode);
      if (result.error) {
        toast.error(`アセンブルエラー (Line: ${result.errorLine})`, {
          description: result.error,
        });
        return;
      }
      const words = [];
      for (let i = 0; i < result.bytecode.length; i += 2) {
        const word = (result.bytecode[i] << 8) | (result.bytecode[i + 1] ?? 0);
        words.push(word.toString(16).toUpperCase().padStart(4, "0"));
      }
      const formattedLines = [];
      for (let i = 0; i < words.length; i += 8) {
        formattedLines.push(words.slice(i, i + 8).join(" "));
      }
      setMachineCode(formattedLines.join("\n"));
      setIsAsmMode(false);
    }
  };

  const handleAssembleClick = () => onAssembleRequest(asmCode);
  const currentCode = isAsmMode ? asmCode : machineCode;
  const lineNumbers = currentCode
    .split("\n")
    .map((_, i) => i + 1)
    .join("\n");

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>コードエディタ</CardTitle>
        <div className="flex items-center space-x-2">
          <Switch
            id="mode-switch"
            checked={isAsmMode}
            onCheckedChange={handleModeChange}
          />
          <Label htmlFor="mode-switch">
            {isAsmMode ? "Assembly Mode" : "Machine Code Mode"}
          </Label>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-2 min-h-0">
        <div className="flex-grow flex relative border rounded-md min-h-0 overflow-hidden">
          <pre
            ref={lineNumbersRef}
            className="text-right p-2.5 bg-muted text-muted-foreground select-none font-mono text-sm leading-6 overflow-hidden"
          >
            {lineNumbers}
          </pre>
          <Textarea
            ref={textareaRef}
            value={currentCode}
            onChange={(e) => {
              if (isAsmMode) setAsmCode(e.target.value);
            }}
            onScroll={handleScroll}
            readOnly={!isAsmMode}
            className="flex-grow resize-none border-0 rounded-none focus-visible:ring-0 font-mono text-sm leading-6 overflow-y-auto"
            placeholder={
              isAsmMode
                ? "PICO-88アセンブリコードを入力..."
                : "マシンコード表示エリア"
            }
          />
        </div>
        <Button onClick={handleAssembleClick} className="w-full flex-shrink-0">
          Assemble & Load to Memory
        </Button>
      </CardContent>
    </Card>
  );
}
