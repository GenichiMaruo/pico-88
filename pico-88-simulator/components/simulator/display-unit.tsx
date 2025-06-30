"use client";

import React, { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

interface DisplayUnitProps {
  framebuffer: Uint8Array; // メモリ全体ではなくフレームバッファを受け取る
  sevenSegmentValue: number; // 7セグの値を直接受け取る
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

const SevenSegmentDisplay = React.memo(({ value }: { value: number }) => {
  const segmentsMap: { [key: string]: number[] } = {
    a: [0, 2, 3, 5, 6, 7, 8, 9, 10, 12, 14, 15],
    b: [0, 1, 2, 3, 4, 7, 8, 9, 10, 13],
    c: [0, 1, 3, 4, 5, 6, 7, 8, 9, 11, 13],
    d: [0, 2, 3, 5, 6, 8, 9, 11, 12, 13, 14],
    e: [0, 2, 6, 8, 10, 11, 12, 13, 14, 15],
    f: [0, 4, 5, 6, 8, 9, 10, 11, 12, 14, 15],
    g: [2, 3, 4, 5, 6, 8, 9, 10, 11, 13, 14, 15],
  };
  const isOn = (segment: string) => segmentsMap[segment].includes(value & 0xf);
  return (
    <div className="bg-gray-800 p-2 rounded-lg">
      <svg viewBox="0 0 52 88" className="w-16 h-auto">
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
SevenSegmentDisplay.displayName = "SevenSegmentDisplay";

export function DisplayUnit({
  framebuffer,
  sevenSegmentValue,
  flipTrigger,
}: DisplayUnitProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = PICO88_PALETTE[0];
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const PIXEL_SIZE = canvas.width / 16;
    for (let i = 0; i < 128; i++) {
      const byte = framebuffer[i]; // フレームバッファから読み出し
      const color1 = (byte >> 4) & 0x0f;
      const color2 = byte & 0x0f;
      const x1 = (i * 2) % 16;
      const y1 = Math.floor((i * 2) / 16);
      const x2 = (i * 2 + 1) % 16;
      const y2 = y1;
      ctx.fillStyle = PICO88_PALETTE[color1];
      ctx.fillRect(x1 * PIXEL_SIZE, y1 * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
      ctx.fillStyle = PICO88_PALETTE[color2];
      ctx.fillRect(x2 * PIXEL_SIZE, y2 * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    }
  }, [framebuffer, flipTrigger]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>ディスプレイユニット</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row items-center justify-center gap-6 p-4">
        <div className="w-64 h-64 md:w-80 md:h-80 border-2 border-primary rounded-lg p-2 bg-black">
          <canvas
            ref={canvasRef}
            width="256"
            height="256"
            className="w-full h-full"
          />
        </div>
        <Separator orientation="vertical" className="h-24 hidden md:block" />
        <div className="flex flex-col items-center gap-2">
          <Label>I/O Port: 0xFF</Label>
          <SevenSegmentDisplay value={sevenSegmentValue} />
        </div>
      </CardContent>
    </Card>
  );
}
