"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

interface CpuStatusProps {
  registers: Uint8Array;
  pc: number;
  sp: number;
  flags: { Z: number; N: number; C: number };
  isHalted: boolean;
  currentBank: number; // 追加
}

const ValueDisplay = ({ value }: { value: number }) => (
  <div className="flex items-baseline font-mono text-lg">
    <span className="text-sm text-muted-foreground mr-1">0x</span>
    <span className="font-bold">
      {value.toString(16).toUpperCase().padStart(2, "0")}
    </span>
    <span className="text-xs text-muted-foreground ml-2">
      ({value.toString().padStart(3, "0")})
    </span>
  </div>
);

export function CpuStatus({
  registers,
  pc,
  sp,
  flags,
  isHalted,
  currentBank,
}: CpuStatusProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle>CPUステータス</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">BANK: {currentBank}</span>
          {isHalted && (
            <span className="text-sm font-bold text-red-500 bg-red-100 px-2 py-1 rounded-md">
              HALTED
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">汎用レジスタ</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 pl-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={`reg-${i}`}>
                  <Label className="font-mono text-sm">R{i}</Label>
                  <ValueDisplay value={registers[i]} />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">特殊レジスタ</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 pl-2">
              <div>
                <Label className="font-mono text-sm">PC</Label>
                <ValueDisplay value={pc} />
              </div>
              <div>
                <Label className="font-mono text-sm">SP</Label>
                <ValueDisplay value={sp} />
              </div>
            </div>
          </div>
        </div>
        <Separator />
        <div className="space-y-2">
          <h4 className="font-semibold">フラグレジスタ</h4>
          <div className="flex items-center justify-around p-2 bg-muted rounded-md">
            <div
              className={`font-mono text-lg font-bold p-2 rounded transition-all ${
                flags.Z ? "text-white bg-blue-500" : "text-muted-foreground"
              }`}
            >
              Z
            </div>
            <div
              className={`font-mono text-lg font-bold p-2 rounded transition-all ${
                flags.N ? "text-white bg-blue-500" : "text-muted-foreground"
              }`}
            >
              N
            </div>
            <div
              className={`font-mono text-lg font-bold p-2 rounded transition-all ${
                flags.C ? "text-white bg-blue-500" : "text-muted-foreground"
              }`}
            >
              C
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
