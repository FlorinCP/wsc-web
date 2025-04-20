import { CellType, SudokuBoardType } from "@/types/sudoku";

/**
 * Converts a SudokuBoardType to a string representation
 *
 * @param board - The sudoku board with CellType structure
 * @returns A string of 81 digits representing the board
 */
export function boardToString(board: SudokuBoardType): string {
  let result = "";

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      result += board[row][col]?.value || "0";
    }
  }

  return result;
}

/**
 * Converts a string representation to a SudokuBoardType
 *
 * @param str - A string representing the sudoku board
 * @returns A SudokuBoardType (2D array of CellType objects)
 */
export function stringToBoard(str: string): SudokuBoardType {
  const board: SudokuBoardType = [];

  const formattedStr = str
    .replace(/[^\d.]/g, "")
    .replace(/\./g, "0")
    .padEnd(81, "0")
    .substring(0, 81);

  for (let i = 0; i < 9; i++) {
    const row: CellType[] = [];

    for (let j = 0; j < 9; j++) {
      const index = i * 9 + j;
      const value = Number.parseInt(formattedStr[index], 10);

      row.push({
        value: value,
        isOriginal: value > 0,
        notes: [],
        isHighlighted: false,
        isRelated: false,
        isInvalid: false,
      });
    }

    board.push(row);
  }

  return board;
}

/**
 * Converts a sudoku string into a 2D array of numbers
 *
 * @param sudokuString - A string of 81 digits representing a 9x9 sudoku grid
 * @returns A 9x9 2D array of numbers
 * @throws Error if the input string doesn't have exactly 81 digits or contains non-digit characters
 */
export function parseSudokuString(sudokuString: string): number[][] {
  const cleanString = sudokuString.replace(/\s/g, "");

  if (cleanString.length !== 81) {
    throw new Error(
      `Invalid sudoku string length: ${cleanString.length}. Expected 81 characters.`,
    );
  }

  if (!/^\d+$/.test(cleanString)) {
    throw new Error("Invalid sudoku string: contains non-digit characters.");
  }

  const grid: number[][] = [];

  for (let row = 0; row < 9; row++) {
    const currentRow: number[] = [];
    for (let col = 0; col < 9; col++) {
      const index = row * 9 + col;
      currentRow.push(parseInt(cleanString[index], 10));
    }
    grid.push(currentRow);
  }

  return grid;
}
