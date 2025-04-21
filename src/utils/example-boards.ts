import type { CellType, SudokuBoardType } from "@/types/sudoku";

const createCell = (
  value = 0,
  isOriginal = false,
  notes: number[] = [],
  isHighlighted = false,
  isRelated = false,
  isInvalid = false,
): CellType => {
  return {
    value,
    isOriginal,
    notes,
    isHighlighted,
    isRelated,
    isInvalid,
  };
};

const createEmptyBoard = (): SudokuBoardType => {
  return Array(9)
    .fill(null)
    .map(() =>
      Array(9)
        .fill(null)
        .map(() => createCell()),
    );
};

export const createExampleBoard = (strategy: string): SudokuBoardType => {
  const board = createEmptyBoard();

  switch (strategy) {
    case "basics":
      // Basic rules example - partially filled board
      // Row 1
      board[0][0] = createCell(5, true);
      board[0][1] = createCell(3, true);
      board[0][4] = createCell(7, true);
      // Row 2
      board[1][0] = createCell(6, true);
      board[1][3] = createCell(1, true);
      board[1][4] = createCell(9, true);
      board[1][5] = createCell(5, true);
      // Row 3
      board[2][1] = createCell(9, true);
      board[2][2] = createCell(8, true);
      board[2][7] = createCell(6, true);
      // Row 4
      board[3][0] = createCell(8, true);
      board[3][4] = createCell(6, true);
      board[3][8] = createCell(3, true);
      // Row 5
      board[4][0] = createCell(4, true);
      board[4][3] = createCell(8, true);
      board[4][5] = createCell(3, true);
      board[4][8] = createCell(1, true);
      // Row 6
      board[5][0] = createCell(7, true);
      board[5][4] = createCell(2, true);
      board[5][8] = createCell(6, true);
      // Row 7
      board[6][1] = createCell(6, true);
      board[6][6] = createCell(2, true);
      board[6][7] = createCell(8, true);
      // Row 8
      board[7][3] = createCell(4, true);
      board[7][4] = createCell(1, true);
      board[7][5] = createCell(9, true);
      board[7][8] = createCell(5, true);
      // Row 9
      board[8][4] = createCell(8, true);
      board[8][7] = createCell(7, true);
      board[8][8] = createCell(9, true);
      break;

    case "rowcol":
      // Row & Column scanning example
      // Fill some cells and highlight a specific row and column
      // Row 1
      board[0][0] = createCell(5, true);
      board[0][1] = createCell(3, true);
      board[0][4] = createCell(7, true);
      // Row 2
      board[1][0] = createCell(6, true);
      board[1][3] = createCell(1, true);
      board[1][4] = createCell(9, true);
      board[1][5] = createCell(5, true);
      // Row 3 - highlighted row
      board[2][0] = createCell(0, false, [], false, true);
      board[2][1] = createCell(9, true, [], false, true);
      board[2][2] = createCell(8, true, [], false, true);
      board[2][3] = createCell(0, false, [], false, true);
      board[2][4] = createCell(0, false, [], false, true);
      board[2][5] = createCell(0, false, [], false, true);
      board[2][6] = createCell(0, false, [], false, true);
      board[2][7] = createCell(6, true, [], false, true);
      board[2][8] = createCell(0, false, [], false, true);

      // Column 4 - highlighted column
      board[0][3] = createCell(0, false, [], false, true);
      board[1][3] = createCell(1, true, [], false, true);
      // board[2][3] already set above
      board[3][3] = createCell(0, false, [], false, true);
      board[4][3] = createCell(8, true, [], false, true);
      board[5][3] = createCell(0, false, [], false, true);
      board[6][3] = createCell(0, false, [], false, true);
      board[7][3] = createCell(4, true, [], false, true);
      board[8][3] = createCell(0, false, [], false, true);

      // Highlight the intersection cell
      board[2][3] = createCell(4, false, [], true, false);
      break;

    case "box":
      // Box analysis example
      // Fill some cells and highlight a specific box
      // Middle box (rows 3-5, columns 3-5)
      for (let r = 3; r < 6; r++) {
        for (let c = 3; c < 6; c++) {
          board[r][c] = createCell(0, false, [], false, true);
        }
      }

      // Fill some cells in the middle box
      board[3][3] = createCell(5, true, [], false, true);
      board[3][5] = createCell(9, true, [], false, true);
      board[4][4] = createCell(1, true, [], false, true);
      board[5][3] = createCell(8, true, [], false, true);

      // Highlight a specific cell in the box
      board[4][5] = createCell(7, false, [], true, false);

      // Add some constraints in related rows/columns
      board[4][0] = createCell(4, true);
      board[4][1] = createCell(6, true);
      board[4][6] = createCell(2, true);
      board[4][8] = createCell(3, true);

      board[0][5] = createCell(2, true);
      board[1][5] = createCell(5, true);
      board[6][5] = createCell(3, true);
      board[8][5] = createCell(6, true);
      break;

    case "candidates":
      // Candidate notation example
      // Fill some cells
      board[0][0] = createCell(5, true);
      board[0][1] = createCell(3, true);
      board[0][4] = createCell(7, true);
      board[1][0] = createCell(6, true);
      board[1][3] = createCell(1, true);
      board[1][4] = createCell(9, true);

      // Add cells with candidate notations (naked pair example)
      board[2][1] = createCell(0, false, [3, 5], true);
      board[2][2] = createCell(0, false, [3, 5], true);
      board[2][4] = createCell(0, false, [3, 5, 8], false, true);
      board[2][6] = createCell(0, false, [3, 8], false, true);

      // Other cells with candidates
      board[4][4] = createCell(0, false, [2, 4, 6]);
      board[4][5] = createCell(0, false, [2, 4]);
      board[5][7] = createCell(0, false, [1, 7, 9]);
      board[6][6] = createCell(0, false, [1, 5, 7]);
      board[7][2] = createCell(0, false, [2, 6, 8]);
      break;

    default:
      // Default to basic example
      board[0][0] = createCell(5, true);
      board[0][1] = createCell(3, true);
      board[0][4] = createCell(7, true);
      board[1][0] = createCell(6, true);
      board[1][3] = createCell(1, true);
      board[1][4] = createCell(9, true);
      board[1][5] = createCell(5, true);
  }

  return board;
};
