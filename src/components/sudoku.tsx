"use client";

import { SudokuBoard } from "@/components/sudoku-board";
import { SudokuKeypad } from "@/components/sudoku-keypad";
import { SudokuControls } from "@/components/sudoku-controls";
import { SudokuHeader } from "@/components/sudoku-header";
import { SudokuCompletionDialog } from "@/components/sudoku-completion-dialog";
import { useSudokuGame } from "@/hooks/use-sudoku-game";
import { useDriverTour } from "@/hooks/use-driver-tour";
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation";
import { Button } from "@/components/ui/button";
import { useSudokuEngine } from "@/components/deepseek/use-sudoku-engine";

export function Sudoku() {
  const { startTour } = useDriverTour();

  const { solvePuzzle, isLoaded, error, isRunning } =
    useSudokuEngine("/wasm/sudoku_pt.js");

  const onSolution = () => {
    const solution = solvePuzzle(getCurrentBoardAsString());
    if (solution.solution) {
      handleSolutionFound(solution.solution);
    }
  };

  const {
    board,
    selectedCell,
    isNotesMode,
    timer,
    difficulty,
    showCompletionDialog,
    historyIndex,
    handleCellSelect,
    handleNumberInput,
    handleClearCell,
    initializeBoard,
    handleSolutionFound,
    handleUndo,
    handleHint,
    handleCheck,
    toggleNotesMode,
    setDifficulty,
    setShowCompletionDialog,
    getCurrentBoardAsString,
    formatTime,
  } = useSudokuGame();

  useKeyboardNavigation({
    selectedCell,
    handleCellSelect,
    handleNumberInput,
    handleClearCell,
    toggleNotesMode,
    isNotesMode,
  });

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      <SudokuHeader
        timer={timer}
        formatTime={formatTime}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        onStartTour={startTour}
      />

      <SudokuBoard
        board={board}
        selectedCell={selectedCell}
        onCellSelect={handleCellSelect}
        onNumberInput={handleNumberInput}
        isNotesMode={isNotesMode}
        onToggleNotes={toggleNotesMode}
      />

      <div id="number-keypad" className="mt-6 flex flex-col items-center">
        <SudokuKeypad
          onNumberClick={handleNumberInput}
          notesMode={isNotesMode}
        />
      </div>

      <div id="game-controls" className="mt-4">
        <SudokuControls
          onNewGame={initializeBoard}
          onUndo={handleUndo}
          onHint={handleHint}
          onCheck={handleCheck}
          onToggleNotes={toggleNotesMode}
          onClearCell={handleClearCell}
          isNotesMode={isNotesMode}
          canUndo={historyIndex >= 0}
        />
      </div>

      <div className="mt-4 flex flex-col items-center">
        <Button
          id="solution"
          onClick={onSolution}
          disabled={!isLoaded || isRunning() || !!error}
        >
          Solve
        </Button>
      </div>

      <SudokuCompletionDialog
        open={showCompletionDialog}
        onOpenChange={setShowCompletionDialog}
        time={formatTime(timer)}
        onPlayAgain={initializeBoard}
      />
    </div>
  );
}
