"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { CellType } from "./sudoku";

interface SudokuCellPopoverProps {
  cell: CellType;
  row: number;
  col: number;
  isSelected: boolean;
  onSelect: () => void;
  onNumberInput: (number: number) => void;
  isNotesMode: boolean;
  onToggleNotes: () => void;
}

export function SudokuCellPopover({
  cell,
  row,
  col,
  isSelected,
  onSelect,
  onNumberInput,
  isNotesMode,
  onToggleNotes,
}: SudokuCellPopoverProps) {
  const [open, setOpen] = useState(false);
  const boxRow = Math.floor(row / 3);
  const boxCol = Math.floor(col / 3);
  const isEvenBox = (boxRow + boxCol) % 2 === 0;

  // Don't allow interaction with original cells
  const handleClick = () => {
    onSelect();
    if (!cell.isOriginal) {
      setOpen(true);
    }
  };

  const handleNumberClick = (number: number) => {
    onNumberInput(number);
    setOpen(false);
  };

  return (
    <Popover open={open && !cell.isOriginal} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
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
          onClick={handleClick}
          tabIndex={0}
        >
          {cell.value > 0 ? (
            <span className={cn(cell.isOriginal && "font-bold")}>
              {cell.value}
            </span>
          ) : (
            <div className="grid grid-cols-3 grid-rows-3 gap-0 w-full h-full p-0.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <div key={num} className="flex items-center justify-center">
                  {cell.notes.includes(num) && (
                    <span className="text-[8px] md:text-[10px] text-muted-foreground">
                      {num}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="center">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Select a number</span>
            <Button
              variant={isNotesMode ? "secondary" : "outline"}
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onToggleNotes();
              }}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
              <Button
                key={number}
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0",
                  isNotesMode && "bg-secondary/50 text-secondary-foreground",
                )}
                onClick={() => handleNumberClick(number)}
              >
                {number}
              </Button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-1"
            onClick={() => {
              handleNumberClick(0); // 0 will clear the cell
              setOpen(false);
            }}
          >
            Clear
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
