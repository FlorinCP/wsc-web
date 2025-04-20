"use client";

import { useEffect } from "react";

interface KeyboardNavigationProps {
  selectedCell: { row: number; col: number } | null;
  handleCellSelect: (row: number, col: number) => void;
  handleNumberInput: (number: number) => void;
  handleClearCell: () => void;
  toggleNotesMode: () => void;
  isNotesMode: boolean;
}

export function useKeyboardNavigation({
  selectedCell,
  handleCellSelect,
  handleNumberInput,
  handleClearCell,
  toggleNotesMode,
  isNotesMode,
}: KeyboardNavigationProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;

      const { row, col } = selectedCell;

      // Arrow key navigation
      if (e.key === "ArrowUp" && row > 0) {
        handleCellSelect(row - 1, col);
      } else if (e.key === "ArrowDown" && row < 8) {
        handleCellSelect(row + 1, col);
      } else if (e.key === "ArrowLeft" && col > 0) {
        handleCellSelect(row, col - 1);
      } else if (e.key === "ArrowRight" && col < 8) {
        handleCellSelect(row, col + 1);
      }

      // Number input (1-9)
      if (/^[1-9]$/.test(e.key)) {
        handleNumberInput(Number.parseInt(e.key));
      }

      // Delete or Backspace to clear cell
      if (e.key === "Delete" || e.key === "Backspace") {
        handleClearCell();
      }

      // 'n' key to toggle notes mode
      if (e.key === "n") {
        toggleNotesMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedCell,
    isNotesMode,
    handleCellSelect,
    handleClearCell,
    handleNumberInput,
    toggleNotesMode,
  ]);
}
