"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { assemble } from "@/core/assembler";
import { toast } from "sonner";

const sampleCode = `
// PICO-88 v2.0 Sample Code
// Bank Switching Demo

// --- Bank 0 ---
START:
  // Write data to Bank 1
  BANK #1
  MOV R0, #10      // Address in Bank 1
  MOV R1, #123     // Data to store
  ST R1, [R0]      // Store 123 at address 10 in Bank 1

  // Return to Bank 0 and clear register
  BANK #0
  MOV R1, #0

  // Read data from Bank 1
  BANK #1
  MOV R0, #10      // Address in Bank 1
  LD R1, [R0]      // Load data from Bank 1 into R1

  // Return to Bank 0 and display the value
  BANK #0
  ST R1, [0xFF]    // Show R1's value on 7-seg display
  
  HLT
`;

interface CodeEditorProps {
  onAssembleRequest: (code: string) => void;
}

export function CodeEditor({ onAssembleRequest }: CodeEditorProps) {
  const [asmCode, setAsmCode] = useState(sampleCode.trim());
  const [machineCode, setMachineCode] = useState("");
  const [isAsmMode, setIsAsmMode] = useState(true);

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
      <CardContent className="flex-grow flex flex-col gap-2">
        <div className="flex-grow flex relative border rounded-md">
          <pre className="text-right p-2.5 bg-muted text-muted-foreground select-none font-mono text-sm leading-6">
            {lineNumbers}
          </pre>
          <Textarea
            value={currentCode}
            onChange={(e) => {
              if (isAsmMode) setAsmCode(e.target.value);
            }}
            readOnly={!isAsmMode}
            className="flex-grow resize-none border-0 rounded-none focus-visible:ring-0 font-mono text-sm leading-6"
            placeholder={
              isAsmMode
                ? "PICO-88アセンブリコードを入力..."
                : "マシンコード表示エリア"
            }
          />
        </div>
        <Button onClick={handleAssembleClick} className="w-full">
          Assemble & Load to Memory
        </Button>
      </CardContent>
    </Card>
  );
}
