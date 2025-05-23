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
import { CellType } from "@/types/sudoku";

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
  onSelect,
  onNumberInput,
  isNotesMode,
  onToggleNotes,
}: SudokuCellPopoverProps) {
  const [open, setOpen] = useState(false);

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
            cell.isHighlighted &&
              "bg-blue-50 border-none rounded-[2px] ring-2 ring-blue-500 dark:bg-slate-800",
            cell.isRelated &&
              !cell.isHighlighted &&
              "bg-blue-50 dark:bg-slate-800",
            cell.isInvalid && "bg-destructive/20 border-destructive",
            cell.isOriginal && !cell.isRelated && "bg-muted/70",
            row % 3 === 0 && !cell.isRelated && "border-t-2 ",
            col % 3 === 0 && !cell.isRelated && "border-l-2",
            row === 8 && !cell.isRelated && "border-b-2",
            col === 8 && !cell.isRelated && "border-r-2",
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
      <PopoverContent className="w-auto p-4" align="center">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 justify-between mb-1">
            <span className="text-sm font-medium">Select a number</span>
            <Button
              variant={isNotesMode ? "secondary" : "outline"}
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onToggleNotes();
              }}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-1.5 w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
              <Button
                key={number}
                variant="outline"
                size="sm"
                className={cn(
                  "h-full w-full aspect-square",
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
              handleNumberClick(0);
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
