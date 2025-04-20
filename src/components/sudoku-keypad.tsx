"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SudokuKeypadProps {
  onNumberClick: (number: number) => void
  notesMode: boolean
}

export function SudokuKeypad({ onNumberClick, notesMode }: SudokuKeypadProps) {
  return (
    <div className="grid grid-cols-9 gap-1 w-full max-w-md">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
        <Button
          key={number}
          variant="outline"
          className={cn("h-10 md:h-12 font-bold", notesMode && "bg-secondary/50 text-secondary-foreground")}
          onClick={() => onNumberClick(number)}
        >
          {number}
        </Button>
      ))}
    </div>
  )
}
