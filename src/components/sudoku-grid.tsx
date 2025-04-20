import { SudokuCellPopover } from "@/components/sudoku-cell-popover";
import { SudokuBoardProps } from "@/components/sudoku-board";

export const SudokuGrid: React.FC<SudokuBoardProps> = ({
  board,
  selectedCell,
  onCellSelect,
  onNumberInput,
  isNotesMode,
  onToggleNotes,
}) => {
  return (
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
              selectedCell?.row === rowIndex && selectedCell?.col === colIndex
            }
            onSelect={() => onCellSelect(rowIndex, colIndex)}
            onNumberInput={onNumberInput}
            isNotesMode={isNotesMode}
            onToggleNotes={onToggleNotes}
          />
        )),
      )}
    </div>
  );
};
