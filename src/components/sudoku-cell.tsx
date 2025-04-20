"use client"

import { cn } from "@/lib/utils"
import type { CellType } from "./sudoku"

interface SudokuCellProps {
  cell: CellType
  row: number
  col: number
  isSelected: boolean
  onSelect: () => void
}

export function SudokuCell({ cell, row, col, isSelected, onSelect }: SudokuCellProps) {
  const boxRow = Math.floor(row / 3)
  const boxCol = Math.floor(col / 3)
  const isEvenBox = (boxRow + boxCol) % 2 === 0

  return (
    <div
      className={cn(
        "relative flex items-center justify-center aspect-square border border-border text-lg md:text-xl font-medium transition-all cursor-pointer select-none",
        isEvenBox ? "bg-background" : "bg-muted/30",
        isSelected && "bg-primary/20 border-primary",
        cell.isHighlighted && "bg-primary/20 border-primary",
        cell.isRelated && !cell.isHighlighted && "bg-muted/50",
        cell.isInvalid && "bg-destructive/20 border-destructive",
        // Add thicker borders for box boundaries
        row % 3 === 0 && "border-t-2",
        col % 3 === 0 && "border-l-2",
        row === 8 && "border-b-2",
        col === 8 && "border-r-2",
      )}
      onClick={onSelect}
    >
      {cell.value > 0 ? (
        <span className={cn(cell.isOriginal && "font-bold")}>{cell.value}</span>
      ) : (
        <div className="grid grid-cols-3 grid-rows-3 gap-0 w-full h-full p-0.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <div key={num} className="flex items-center justify-center">
              {cell.notes.includes(num) && (
                <span className="text-[8px] md:text-[10px] text-muted-foreground">{num}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
