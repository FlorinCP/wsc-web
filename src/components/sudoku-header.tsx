"use client";

import { Clock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SudokuHelpButton } from "@/components/sudoku-help-button";
import type { Difficulty } from "@/hooks/use-sudoku-game";

interface SudokuHeaderProps {
  timer: number;
  formatTime: (seconds: number) => string;
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onStartTour: () => void;
}

export function SudokuHeader({
  timer,
  formatTime,
  difficulty,
  onDifficultyChange,
  onStartTour,
}: SudokuHeaderProps) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2" id="timer-display">
        <Clock className="w-5 h-5" />
        <span className="text-lg font-mono">{formatTime(timer)}</span>
      </div>

      <Tabs
        value={difficulty}
        onValueChange={(value) => onDifficultyChange(value as Difficulty)}
        id="difficulty-tabs"
      >
        <TabsList>
          <TabsTrigger value="easy">Easy</TabsTrigger>
          <TabsTrigger value="medium">Medium</TabsTrigger>
          <TabsTrigger value="hard">Hard</TabsTrigger>
        </TabsList>
      </Tabs>

      <SudokuHelpButton onStartTour={onStartTour} />
    </div>
  );
}
