export function generateSolvedBoard(): number[][] {
  return [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ];
}

export function createPuzzle(
  solvedBoard: number[][],
  emptyCells: number,
): number[][] {
  const board = solvedBoard.map((row) => [...row]);
  const positions = [];

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      positions.push({ row, col });
    }
  }

  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  for (let i = 0; i < emptyCells && i < positions.length; i++) {
    const { row, col } = positions[i];
    board[row][col] = 0;
  }

  return board;
}

export function isValidBoard(board: number[][]): boolean {
  for (let row = 0; row < 9; row++) {
    const seen = new Set();
    for (let col = 0; col < 9; col++) {
      const value = board[row][col];
      if (value !== 0 && seen.has(value)) return false;
      if (value !== 0) seen.add(value);
    }
  }

  for (let col = 0; col < 9; col++) {
    const seen = new Set();
    for (let row = 0; row < 9; row++) {
      const value = board[row][col];
      if (value !== 0 && seen.has(value)) return false;
      if (value !== 0) seen.add(value);
    }
  }

  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const seen = new Set();
      for (let row = boxRow * 3; row < boxRow * 3 + 3; row++) {
        for (let col = boxCol * 3; col < boxCol * 3 + 3; col++) {
          const value = board[row][col];
          if (value !== 0 && seen.has(value)) return false;
          if (value !== 0) seen.add(value);
        }
      }
    }
  }

  return true;
}

export function isBoardComplete(board: number[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) return false;
    }
  }
  return true;
}

export function isValidMove(
  board: number[][],
  row: number,
  col: number,
  value: number,
): boolean {
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c] === value) return false;
  }

  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col] === value) return false;
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && board[r][c] === value) return false;
    }
  }

  return true;
}
