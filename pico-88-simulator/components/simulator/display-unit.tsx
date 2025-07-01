"use client";

import React, { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

interface DisplayUnitProps {
  framebuffer: Uint8Array;
  vram: Uint8Array;
  sevenSegmentMemory: Uint8Array;
  flipTrigger: number;
  onButtonChange: (buttonIndex: number, isPressed: boolean) => void;
}

const PICO88_PALETTE = [
  "#000000",
  "#1D2B53",
  "#7E2553",
  "#008751",
  "#AB5236",
  "#5F574F",
  "#C2C3C7",
  "#FFF1E8",
  "#FF004D",
  "#FFA300",
  "#FFEC27",
  "#00E436",
  "#29ADFF",
  "#83769C",
  "#FF77A8",
  "#FFCCAA",
];

const SevenSegmentDigit = React.memo(({ value }: { value: number }) => {
  const segmentsMap: { [key: string]: number[] } = {
    a: [0, 2, 3, 5, 6, 7, 8, 9, 10, 12, 14, 15],
    b: [0, 1, 2, 3, 4, 7, 8, 9, 10, 13],
    c: [0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13],
    d: [0, 2, 3, 5, 6, 8, 11, 12, 13, 14],
    e: [0, 2, 6, 8, 10, 11, 12, 13, 14, 15],
    f: [0, 4, 5, 6, 8, 9, 10, 11, 12, 14, 15],
    g: [2, 3, 4, 5, 6, 8, 9, 10, 11, 13, 14, 15],
  };
  const isOn = (segment: string) => segmentsMap[segment].includes(value & 0xf);
  return (
    <div className="bg-gray-800 p-1 rounded-md">
      <svg viewBox="0 0 52 88" className="w-8 h-auto">
        <g transform="translate(2, 2)">
          <polygon
            points="6,0 40,0 46,6 40,12 6,12 0,6"
            fill={isOn("a") ? "#FF4136" : "#3D4451"}
          />
          <polygon
            points="40,6 46,12 46,38 40,44 34,38 34,12"
            fill={isOn("b") ? "#FF4136" : "#3D4451"}
          />
          <polygon
            points="40,44 46,50 46,76 40,82 34,76 34,50"
            fill={isOn("c") ? "#FF4136" : "#3D4451"}
          />
          <polygon
            points="6,76 40,76 46,82 40,88 6,88 0,82"
            fill={isOn("d") ? "#FF4136" : "#3D4451"}
          />
          <polygon
            points="0,44 6,50 6,76 0,82 -6,76 -6,50"
            transform="translate(6, 0)"
            fill={isOn("e") ? "#FF4136" : "#3D4451"}
          />
          <polygon
            points="0,6 6,12 6,38 0,44 -6,38 -6,12"
            transform="translate(6, 0)"
            fill={isOn("f") ? "#FF4136" : "#3D4451"}
          />
          <polygon
            points="6,38 40,38 46,44 40,50 6,50 0,44"
            fill={isOn("g") ? "#FF4136" : "#3D4451"}
          />
        </g>
      </svg>
    </div>
  );
});
SevenSegmentDigit.displayName = "SevenSegmentDigit";

const drawPixels = (ctx: CanvasRenderingContext2D, data: Uint8Array) => {
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = PICO88_PALETTE[0];
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const PIXEL_SIZE = ctx.canvas.width / 16;
  for (let i = 0; i < 128; i++) {
    const byte = data[i];
    const color1 = (byte >> 4) & 0x0f;
    const color2 = byte & 0x0f;
    const x1 = (i * 2) % 16;
    const y1 = Math.floor((i * 2) / 16);
    ctx.fillStyle = PICO88_PALETTE[color1];
    ctx.fillRect(x1 * PIXEL_SIZE, y1 * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    ctx.fillStyle = PICO88_PALETTE[color2];
    ctx.fillRect(
      (x1 + 1) * PIXEL_SIZE,
      y1 * PIXEL_SIZE,
      PIXEL_SIZE,
      PIXEL_SIZE
    );
  }
};

const ControlButton = ({
  onButtonChange,
  buttonIndex,
  children,
  className,
}: {
  onButtonChange: (idx: number, pressed: boolean) => void;
  buttonIndex: number;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <Button
      variant="outline"
      className={`w-12 h-12 ${className || ""}`}
      onMouseDown={() => onButtonChange(buttonIndex, true)}
      onMouseUp={() => onButtonChange(buttonIndex, false)}
      onTouchStart={(e) => {
        e.preventDefault();
        onButtonChange(buttonIndex, true);
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        onButtonChange(buttonIndex, false);
      }}
    >
      {children}
    </Button>
  );
};

export function DisplayUnit({
  framebuffer,
  vram,
  sevenSegmentMemory,
  flipTrigger,
  onButtonChange,
}: DisplayUnitProps) {
  const screenCanvasRef = useRef<HTMLCanvasElement>(null);
  const bufferCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = screenCanvasRef.current;
    if (canvas) drawPixels(canvas.getContext("2d")!, framebuffer);
  }, [framebuffer, flipTrigger]);

  useEffect(() => {
    const canvas = bufferCanvasRef.current;
    if (canvas) drawPixels(canvas.getContext("2d")!, vram);
  }, [vram]);

  const digits = [
    (sevenSegmentMemory[0] >> 4) & 0xf,
    sevenSegmentMemory[0] & 0xf,
    (sevenSegmentMemory[1] >> 4) & 0xf,
    sevenSegmentMemory[1] & 0xf,
    (sevenSegmentMemory[2] >> 4) & 0xf,
    sevenSegmentMemory[2] & 0xf,
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>ディスプレイユニット</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row items-center justify-center gap-6 p-4">
        <Tabs defaultValue="screen" className="w-64 h-auto md:w-80 md:h-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="screen">Screen (表)</TabsTrigger>
            <TabsTrigger value="buffer">Buffer (裏)</TabsTrigger>
          </TabsList>
          <TabsContent value="screen">
            <div className="mt-2 border-2 border-primary rounded-lg p-2 bg-black">
              <canvas
                ref={screenCanvasRef}
                width="256"
                height="256"
                className="w-full h-full"
              />
            </div>
          </TabsContent>
          <TabsContent value="buffer">
            <div className="mt-2 border-2 border-dashed border-muted-foreground rounded-lg p-2 bg-black">
              <canvas
                ref={bufferCanvasRef}
                width="256"
                height="256"
                className="w-full h-full"
              />
            </div>
          </TabsContent>
        </Tabs>
        <Separator orientation="vertical" className="h-48 hidden md:block" />
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <Label>I/O Port: 0xF0-0xF2</Label>
            <div className="flex gap-1">
              {digits.map((digit, index) => (
                <SevenSegmentDigit key={index} value={digit} />
              ))}
            </div>
            <div className="flex items-center justify-center gap-8 p-4">
              <div className="grid grid-cols-3 grid-rows-3 gap-1 w-36 h-36">
                <ControlButton
                  buttonIndex={0}
                  onButtonChange={onButtonChange}
                  className="col-start-2 row-start-1 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                  <ArrowUp size={24} />
                </ControlButton>
                <ControlButton
                  buttonIndex={2}
                  onButtonChange={onButtonChange}
                  className="col-start-1 row-start-2 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                  <ArrowLeft size={24} />
                </ControlButton>
                <ControlButton
                  buttonIndex={3}
                  onButtonChange={onButtonChange}
                  className="col-start-3 row-start-2 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                  <ArrowRight size={24} />
                </ControlButton>
                <ControlButton
                  buttonIndex={1}
                  onButtonChange={onButtonChange}
                  className="col-start-2 row-start-3 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                  <ArrowDown size={24} />
                </ControlButton>
              </div>
              <div className="flex flex-col gap-2">
                <ControlButton
                  buttonIndex={4}
                  onButtonChange={onButtonChange}
                  className="rounded-full bg-rose-400 hover:bg-rose-500 text-white font-bold text-lg"
                >
                  A
                </ControlButton>
                <ControlButton
                  buttonIndex={5}
                  onButtonChange={onButtonChange}
                  className="rounded-full bg-amber-400 hover:bg-amber-500 text-white font-bold text-lg"
                >
                  B
                </ControlButton>
                <ControlButton
                  buttonIndex={6}
                  onButtonChange={onButtonChange}
                  className="rounded-full bg-emerald-400 hover:bg-emerald-500 text-white font-bold text-lg"
                >
                  C
                </ControlButton>
                <ControlButton
                  buttonIndex={7}
                  onButtonChange={onButtonChange}
                  className="rounded-full bg-sky-400 hover:bg-sky-500 text-white font-bold text-lg"
                >
                  D
                </ControlButton>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
