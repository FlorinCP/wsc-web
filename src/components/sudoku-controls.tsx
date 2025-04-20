"use client"

import { Button } from "@/components/ui/button"
import { RotateCcw, Lightbulb, Check, RefreshCw, Pencil, Trash2 } from "lucide-react"

interface SudokuControlsProps {
  onNewGame: () => void
  onUndo: () => void
  onHint: () => void
  onCheck: () => void
  onToggleNotes: () => void
  onClearCell: () => void
  isNotesMode: boolean
  canUndo: boolean
}

export function SudokuControls({
  onNewGame,
  onUndo,
  onHint,
  onCheck,
  onToggleNotes,
  onClearCell,
  isNotesMode,
  canUndo,
}: SudokuControlsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 w-full">
      <Button variant="outline" size="icon" onClick={onNewGame} title="New Game">
        <RefreshCw className="h-4 w-4" />
      </Button>

      <Button variant="outline" size="icon" onClick={onUndo} disabled={!canUndo} title="Undo">
        <RotateCcw className="h-4 w-4" />
      </Button>

      <Button variant="outline" size="icon" onClick={onHint} title="Hint">
        <Lightbulb className="h-4 w-4" />
      </Button>

      <Button variant="outline" size="icon" onClick={onCheck} title="Check">
        <Check className="h-4 w-4" />
      </Button>

      <Button variant={isNotesMode ? "secondary" : "outline"} size="icon" onClick={onToggleNotes} title="Notes Mode">
        <Pencil className="h-4 w-4" />
      </Button>

      <Button variant="outline" size="icon" onClick={onClearCell} title="Clear Cell">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
