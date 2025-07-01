"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * StackViewコンポーネントのプロパティ
 */
interface StackViewProps {
  stackMemory: Uint8Array;
  sp: number;
}

/**
 * PICO-88の専用スタックメモリの状態を視覚的に表示するコンポーネント
 * @param props - stackMemory, sp
 */
export function StackView({ stackMemory, sp }: StackViewProps) {
  const STACK_DISPLAY_SIZE = 8;
  const stackItems = [];
  for (let i = 0; i < STACK_DISPLAY_SIZE; i++) {
    const address = (sp + 1 + i) & 0xff;
    if (address < sp + 1 && i > 0) break;
    const value = stackMemory[address];
    stackItems.push({
      address,
      value,
      isTop: i === 0,
    });
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>スタックビュー</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col-reverse gap-1 font-mono text-sm h-[240px] overflow-y-auto pr-2">
          {stackItems.length === 0 && (
            <div className="text-muted-foreground text-center pt-8">
              スタックは空です
            </div>
          )}
          {stackItems.map(({ address, value, isTop }) => (
            <div
              key={address}
              className={cn(
                "flex justify-between items-center p-2 rounded transition-colors",
                isTop
                  ? "bg-blue-100 dark:bg-blue-900/40 ring-1 ring-blue-500"
                  : "bg-muted/50"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  0x{address.toString(16).toUpperCase().padStart(2, "0")}
                </span>
                <span className="font-bold">
                  0x{value.toString(16).toUpperCase().padStart(2, "0")}
                </span>
              </div>
              {isTop && (
                <span className="text-xs font-bold text-blue-500">
                  [SP+1] TOP
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
