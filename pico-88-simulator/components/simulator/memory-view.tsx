"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface MemoryViewProps {
  mainMemory: Uint8Array;
  stackMemory: Uint8Array;
  activeBank: number;
  pc: number;
  sp: number;
}

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

export function MemoryView({
  mainMemory,
  stackMemory,
  activeBank,
  pc,
  sp,
}: MemoryViewProps) {
  const [displayedTab, setDisplayedTab] = useState<string>(
    `bank-${activeBank}`
  );
  const [isAutoFollow, setIsAutoFollow] = useState(true);

  useEffect(() => {
    if (isAutoFollow) {
      setDisplayedTab(`bank-${activeBank}`);
    }
  }, [activeBank, isAutoFollow]);

  const handleAutoFollowChange = (checked: boolean) => {
    setIsAutoFollow(checked);
    if (checked) {
      setDisplayedTab(`bank-${activeBank}`);
    }
  };

  const handleTabChange = (value: string) => {
    setIsAutoFollow(false);
    setDisplayedTab(value);
  };

  const renderMemoryGrid = (
    memory: Uint8Array,
    showPc: boolean,
    showSp: boolean
  ) => {
    return (
      <div
        className="grid grid-cols-16 gap-0.5"
        style={{ gridTemplateColumns: "repeat(16, minmax(0, 1fr))" }}
      >
        {Array.from({ length: 256 }).map((_, i) => (
          <MemoryCell
            key={i}
            address={i}
            value={memory[i]}
            isPc={showPc && i === pc}
            isSp={showSp && i === sp}
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
            <CardTitle>メモリビュー</CardTitle>
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
          value={displayedTab}
          onValueChange={handleTabChange}
          className="flex flex-col h-full"
        >
          <TabsList className="grid w-full grid-cols-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <TabsTrigger
                key={i}
                value={`bank-${i}`}
                className={cn(activeBank === i && "text-blue-500 font-bold")}
                disabled={isAutoFollow && i !== activeBank}
              >
                Bank {i}
              </TabsTrigger>
            ))}
            <TabsTrigger value="stack" disabled={isAutoFollow}>
              Stack
            </TabsTrigger>
          </TabsList>
          {Array.from({ length: 4 }).map((_, i) => (
            <TabsContent key={i} value={`bank-${i}`} className="flex-grow mt-2">
              {renderMemoryGrid(
                mainMemory.slice(i * 256, (i + 1) * 256),
                i === activeBank,
                false
              )}
            </TabsContent>
          ))}
          <TabsContent value="stack" className="flex-grow mt-2">
            {renderMemoryGrid(stackMemory, false, true)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
