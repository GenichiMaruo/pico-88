"use client";

import {
  Play,
  Pause,
  StepForward,
  RotateCcw,
  Rabbit,
  Turtle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * ControlPanelコンポーネントのプロパティ
 */
interface ControlPanelProps {
  isRunning: boolean;
  isHalted: boolean;
  speed: number;
  onRunPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onSpeedChange: (newSpeed: number) => void;
}

/**
 * CPUの実行を制御するためのUIコンポーネント
 * @param props - isRunning, isHalted, speed, and event handlers
 */
export function ControlPanel({
  isRunning,
  isHalted,
  speed,
  onRunPause,
  onStep,
  onReset,
  onSpeedChange,
}: ControlPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>コントロールパネル</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* 実行制御ボタン */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={onRunPause}
            disabled={isHalted}
            aria-label={isRunning ? "Pause" : "Run"}
          >
            {isRunning ? (
              <Pause className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isRunning ? "Pause" : "Run"}
          </Button>
          <Button
            onClick={onStep}
            disabled={isRunning || isHalted}
            variant="outline"
          >
            <StepForward className="h-4 w-4 mr-2" />
            Step
          </Button>
          <Button onClick={onReset} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* 速度調整スライダー */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center text-sm">
            <Label htmlFor="speed-slider">実行速度</Label>
            <span className="text-muted-foreground">
              {speed.toLocaleString()} Hz
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Turtle className="h-4 w-4 text-muted-foreground" />
            <Slider
              id="speed-slider"
              min={1}
              max={1000}
              step={1}
              value={[speed]}
              onValueChange={(value) => onSpeedChange(value[0])}
              disabled={isRunning}
              aria-label="Speed Control"
            />
            <Rabbit className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
