"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from "@/lib/utils";

/**
 * StackViewコンポーネントのプロパティ
 */
interface StackViewProps {
  mainMemory: Uint8Array;
  sp: number;
  activeBank: number;
}

/**
 * PICO-88のスタックメモリの状態を視覚的に表示するコンポーネント
 * @param props - mainMemory, sp, activeBank
 */
export function StackView({ mainMemory, sp, activeBank }: StackViewProps) {
  const STACK_DISPLAY_SIZE = 8; // 表示するスタックの深さ
  const stackItems = [];

  // スタックは0xFFから下方向に伸びる。SPは次に書き込む空き領域を指す。
  // そのため、最後にPUSHされた値は SP+1 の位置にある。
  for (let i = 0; i < STACK_DISPLAY_SIZE; i++) {
    const address = (sp + 1 + i) & 0xFF;
    
    // アドレスが0xFFを超えて一周するのを防ぐ
    if (address < sp + 1) break;

    // 現在のバンクの物理メモリアドレスから値を取得
    const physicalAddress = (activeBank * 256) + address;
    const value = mainMemory[physicalAddress];

    stackItems.push({
      address,
      value,
      isTop: i === 0, // SP+1 がスタックの先頭
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
            <div className="text-muted-foreground text-center pt-8">スタックは空です</div>
          )}
          {stackItems.map(({ address, value, isTop }) => (
            <div key={address} className={cn(
              "flex justify-between items-center p-2 rounded transition-colors",
              isTop 
                ? "bg-blue-100 dark:bg-blue-900/40 ring-1 ring-blue-500" 
                : "bg-muted/50"
            )}>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">0x{address.toString(16).toUpperCase().padStart(2, '0')}</span>
                <span className="font-bold">0x{value.toString(16).toUpperCase().padStart(2, '0')}</span>
              </div>
              {isTop && <span className="text-xs font-bold text-blue-500">[SP+1] TOP</span>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
