"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { CellType } from "@/types/sudoku";
import { SudokuGrid } from "@/components/sudoku-grid";

export interface SudokuBoardProps {
  board: CellType[][];
  selectedCell: { row: number; col: number } | null;
  onCellSelect: (row: number, col: number) => void;
  onNumberInput: (number: number) => void;
  isNotesMode: boolean;
  onToggleNotes: () => void;
}

export function SudokuBoard({
  board,
  selectedCell,
  onCellSelect,
  onNumberInput,
  isNotesMode,
  onToggleNotes,
}: SudokuBoardProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <SudokuGrid
          board={board}
          selectedCell={selectedCell}
          onCellSelect={onCellSelect}
          onNumberInput={onNumberInput}
          isNotesMode={isNotesMode}
          onToggleNotes={onToggleNotes}
        />
      </CardContent>
    </Card>
  );
}
