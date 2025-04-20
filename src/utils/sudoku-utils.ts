export function boardToString(board: number[][]): string {
  let result = "";
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      result += board[row][col] || "0";
    }
  }
  return result;
}

// Convert a string representation to a 2D array
export function stringToBoard(str: string): number[][] {
  const board: number[][] = [];
  const formattedStr = str
    .replace(/[^\d.]/g, "")
    .replace(/\./g, "0")
    .padEnd(81, "0")
    .substring(0, 81);

  for (let i = 0; i < 9; i++) {
    const row: number[] = [];
    for (let j = 0; j < 9; j++) {
      const index = i * 9 + j;
      row.push(Number.parseInt(formattedStr[index], 10));
    }
    board.push(row);
  }

  return board;
}

// Parse a text file containing a Sudoku puzzle
export function parseSudokuFile(content: string): string {
  // Remove any non-digit characters and replace spaces or dots with zeros
  return content
    .replace(/[^\d.]/g, "")
    .replace(/\./g, "0")
    .padEnd(81, "0")
    .substring(0, 81);
}
