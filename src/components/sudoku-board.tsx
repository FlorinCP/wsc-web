"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SudokuCellPopover } from "@/components/sudoku-cell-popover";
import type { CellType } from "@/types/sudoku";

interface SudokuBoardProps {
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
        <div
          className="grid grid-cols-9 gap-0.5 md:gap-1 aspect-square"
          id="sudoku-board"
        >
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <SudokuCellPopover
                key={`${rowIndex}-${colIndex}`}
                cell={cell}
                row={rowIndex}
                col={colIndex}
                isSelected={
                  selectedCell?.row === rowIndex &&
                  selectedCell?.col === colIndex
                }
                onSelect={() => onCellSelect(rowIndex, colIndex)}
                onNumberInput={onNumberInput}
                isNotesMode={isNotesMode}
                onToggleNotes={onToggleNotes}
              />
            )),
          )}
        </div>
      </CardContent>
    </Card>
  );
}
