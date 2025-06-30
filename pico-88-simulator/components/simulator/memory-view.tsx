"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * MemoryViewコンポーネントのプロパティ
 */
interface MemoryViewProps {
  mainMemory: Uint8Array; // 1KBの全物理メモリ
  currentBank: number; // CPUが現在アクティブにしているバンク
  pc: number;
  sp: number;
}

/**
 * メモリセル単体の表示コンポーネント
 */
const MemoryCell = React.memo(
  ({
    address,
    value,
    isPc,
    isSp,
  }: {
    address: number;
    value: number;
    isPc: boolean;
    isSp: boolean;
  }) => {
    return (
      <div
        className={cn(
          "relative w-full h-full p-1 rounded-sm flex flex-col justify-center items-center bg-gray-100/60 dark:bg-gray-800/40",
          isPc && "ring-2 ring-blue-500 z-10",
          isSp && "ring-2 ring-green-500 z-10",
          isPc && isSp && "ring-offset-2 ring-offset-background"
        )}
      >
        <div className="absolute top-0 left-0.5 text-[8px] text-muted-foreground">
          {address.toString(16).toUpperCase().padStart(2, "0")}
        </div>
        <div className="font-mono text-sm font-bold mt-1">
          {value.toString(16).toUpperCase().padStart(2, "0")}
        </div>
      </div>
    );
  }
);
MemoryCell.displayName = "MemoryCell";

/**
 * PICO-88のメインメモリ空間をバンクごとに表示するコンポーネント
 * @param props - mainMemory, currentBank, pc, sp
 */
export function MemoryView({
  mainMemory,
  currentBank,
  pc,
  sp,
}: MemoryViewProps) {
  const [displayedBank, setDisplayedBank] = useState(currentBank);
  const [isAutoFollow, setIsAutoFollow] = useState(true);

  // オートモードがオンの時、CPUのアクティブバンクの変更に追従する
  useEffect(() => {
    if (isAutoFollow) {
      setDisplayedBank(currentBank);
    }
  }, [currentBank, isAutoFollow]);

  const handleAutoFollowChange = (checked: boolean) => {
    setIsAutoFollow(checked);
    if (checked) {
      // オートモードをオンにしたら、すぐにCPUの現在バンクに切り替える
      setDisplayedBank(currentBank);
    }
  };

  const renderBank = (bankIndex: number) => {
    const bankOffset = bankIndex * 256;
    const showPointers = bankIndex === currentBank;

    return (
      <div
        className="grid grid-cols-16 gap-0.5"
        style={{ gridTemplateColumns: "repeat(16, minmax(0, 1fr))" }}
      >
        {Array.from({ length: 256 }).map((_, i) => (
          <MemoryCell
            key={bankOffset + i}
            address={i}
            value={mainMemory[bankOffset + i]}
            isPc={showPointers && i === pc}
            isSp={showPointers && i === sp}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="flex-grow flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>メインメモリビュー</CardTitle>
            <div className="flex items-center gap-4 text-xs pt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>PC
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>SP
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-blue-500">青字</span>=
                CPUアクティブ
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-follow-switch"
              checked={isAutoFollow}
              onCheckedChange={handleAutoFollowChange}
            />
            <Label htmlFor="auto-follow-switch">オート</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <Tabs
          value={`bank-${displayedBank}`}
          onValueChange={(value) => {
            setIsAutoFollow(false); // 手動で切り替えたらオートを解除
            setDisplayedBank(parseInt(value.split("-")[1]));
          }}
          className="flex flex-col h-full"
        >
          <TabsList className="grid w-full grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <TabsTrigger
                key={i}
                value={`bank-${i}`}
                className={cn(currentBank === i && "text-blue-500 font-bold")}
                disabled={isAutoFollow && i !== currentBank} // オートモード中は他のタブを無効化
              >
                Bank {i}
              </TabsTrigger>
            ))}
          </TabsList>
          {Array.from({ length: 4 }).map((_, i) => (
            <TabsContent key={i} value={`bank-${i}`} className="flex-grow mt-2">
              {renderBank(i)}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
