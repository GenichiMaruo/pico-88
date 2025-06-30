"use client";

import React, { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

interface DisplayUnitProps {
  framebuffer: Uint8Array;
  vram: Uint8Array;
  sevenSegmentValue: number;
  flipTrigger: number;
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
  // ★修正点: 0-Fまでの16進数表示に対応した、正しいセグメントマップ
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
    <div className="bg-gray-800 p-2 rounded-lg">
      <svg viewBox="0 0 52 88" className="w-12 h-auto">
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

export function DisplayUnit({
  framebuffer,
  vram,
  sevenSegmentValue,
  flipTrigger,
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

  const leftDigit = (sevenSegmentValue >> 4) & 0xf;
  const rightDigit = sevenSegmentValue & 0xf;

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
        <Separator orientation="vertical" className="h-24 hidden md:block" />
        <div className="flex flex-col items-center gap-2">
          <Label>I/O Port: 0xFF</Label>
          <div className="flex gap-2">
            <SevenSegmentDigit value={leftDigit} />
            <SevenSegmentDigit value={rightDigit} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
