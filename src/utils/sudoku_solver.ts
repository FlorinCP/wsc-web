/**
 * Calculates the "population count" (popcount) of a non-negative integer.
 * This is the number of set bits (bits with a value of 1) in its binary representation.
 * The function is also known as calculating the Hamming weight.
 *
 * It uses Brian Kernighan's algorithm, which is efficient as it iterates
 * only as many times as there are set bits.
 *
 * @param n The non-negative integer for which to count set bits.
 *          While JavaScript bitwise operators treat numbers as 32-bit signed integers
 *          internally (converting to two's complement for negatives), this function
 *          is typically used with positive values representing bitmasks.
 *          The `n >>> 0` operation explicitly converts `n` to an unsigned 32-bit integer
 *          before processing, ensuring correct behavior for the algorithm, especially
 *          if `n` could hypothetically be a non-integer or negative.
 * @returns The number of set bits in `n`.
 *
 * @example
 * popcount(5);   // Binary 0101 -> Returns 2
 * popcount(13);  // Binary 1101 -> Returns 3
 * popcount(0);   // Binary 0000 -> Returns 0
 * popcount(255); // Binary 11111111 -> Returns 8
 * // For Sudoku, a mask like 0x3FE (binary ...001111111110) represents numbers 1-9
 * popcount(0x3FE); // Returns 9
 */
function popcount(n: number): number {
  let count: number = 0;

  n = n >>> 0;

  while (n > 0) {
    n &= n - 1;
    count++;
  }
  return count;
}

/**
 * Counts the number of trailing zeros (CTZ) in the binary representation of n.
 * This corresponds to the 0-indexed position of the least significant bit (LSB).
 * If n is 0, it returns the specified bitWidth (defaulting to 32).
 * In the Sudoku context, `n` (the `possible` mask) should not be 0 when this is called
 * to find a number, as that would mean no numbers are possible.
 *
 * This function effectively finds 'k' if n can be expressed as 'm * (2^k)' where m is odd.
 * If n is a power of 2 (like `1 << k`), it returns `k`. This `k` is what's used
 * as the Sudoku digit (1-9) in this solver.
 *
 * @param n The non-negative integer.
 * @param bitWidth The conceptual bit width for the 'n is 0' case (e.g., 32 for general integers,
 *                 or 16 if specifically dealing with uint16 masks and want C++ parity).
 *                 For Sudoku masks 1-9, 16 or 32 makes little difference for non-zero n.
 * @returns The 0-indexed position of the LSB, which is used as the digit (1-9).
 *
 * @example
 * ctz(2);    // 0b10 (1 << 1) -> returns 1 (digit 1)
 * ctz(8);    // 0b1000 (1 << 3) -> returns 3 (digit 3)
 * ctz(0x20); // 0b100000 (1 << 5) -> returns 5 (digit 5)
 * ctz(0);    // returns 32 (by default)
 */
function ctz(n: number, bitWidth: number = 32): number {
  n = n >>> 0;
  if (n === 0) {
    return bitWidth;
  }
  return Math.log2(n & -n);
}

interface CellInfo {
  row: number;
  col: number;
  box: number;
}

const preCellLookup: ReadonlyArray<Readonly<CellInfo>> = [
  { row: 0, col: 0, box: 0 },
  { row: 0, col: 1, box: 0 },
  { row: 0, col: 2, box: 0 },
  { row: 0, col: 3, box: 1 },
  { row: 0, col: 4, box: 1 },
  { row: 0, col: 5, box: 1 },
  { row: 0, col: 6, box: 2 },
  { row: 0, col: 7, box: 2 },
  { row: 0, col: 8, box: 2 },
  { row: 1, col: 0, box: 0 },
  { row: 1, col: 1, box: 0 },
  { row: 1, col: 2, box: 0 },
  { row: 1, col: 3, box: 1 },
  { row: 1, col: 4, box: 1 },
  { row: 1, col: 5, box: 1 },
  { row: 1, col: 6, box: 2 },
  { row: 1, col: 7, box: 2 },
  { row: 1, col: 8, box: 2 },
  { row: 2, col: 0, box: 0 },
  { row: 2, col: 1, box: 0 },
  { row: 2, col: 2, box: 0 },
  { row: 2, col: 3, box: 1 },
  { row: 2, col: 4, box: 1 },
  { row: 2, col: 5, box: 1 },
  { row: 2, col: 6, box: 2 },
  { row: 2, col: 7, box: 2 },
  { row: 2, col: 8, box: 2 },
  { row: 3, col: 0, box: 3 },
  { row: 3, col: 1, box: 3 },
  { row: 3, col: 2, box: 3 },
  { row: 3, col: 3, box: 4 },
  { row: 3, col: 4, box: 4 },
  { row: 3, col: 5, box: 4 },
  { row: 3, col: 6, box: 5 },
  { row: 3, col: 7, box: 5 },
  { row: 3, col: 8, box: 5 },
  { row: 4, col: 0, box: 3 },
  { row: 4, col: 1, box: 3 },
  { row: 4, col: 2, box: 3 },
  { row: 4, col: 3, box: 4 },
  { row: 4, col: 4, box: 4 },
  { row: 4, col: 5, box: 4 },
  { row: 4, col: 6, box: 5 },
  { row: 4, col: 7, box: 5 },
  { row: 4, col: 8, box: 5 },
  { row: 5, col: 0, box: 3 },
  { row: 5, col: 1, box: 3 },
  { row: 5, col: 2, box: 3 },
  { row: 5, col: 3, box: 4 },
  { row: 5, col: 4, box: 4 },
  { row: 5, col: 5, box: 4 },
  { row: 5, col: 6, box: 5 },
  { row: 5, col: 7, box: 5 },
  { row: 5, col: 8, box: 5 },
  { row: 6, col: 0, box: 6 },
  { row: 6, col: 1, box: 6 },
  { row: 6, col: 2, box: 6 },
  { row: 6, col: 3, box: 7 },
  { row: 6, col: 4, box: 7 },
  { row: 6, col: 5, box: 7 },
  { row: 6, col: 6, box: 8 },
  { row: 6, col: 7, box: 8 },
  { row: 6, col: 8, box: 8 },
  { row: 7, col: 0, box: 6 },
  { row: 7, col: 1, box: 6 },
  { row: 7, col: 2, box: 6 },
  { row: 7, col: 3, box: 7 },
  { row: 7, col: 4, box: 7 },
  { row: 7, col: 5, box: 7 },
  { row: 7, col: 6, box: 8 },
  { row: 7, col: 7, box: 8 },
  { row: 7, col: 8, box: 8 },
  { row: 8, col: 0, box: 6 },
  { row: 8, col: 1, box: 6 },
  { row: 8, col: 2, box: 6 },
  { row: 8, col: 3, box: 7 },
  { row: 8, col: 4, box: 7 },
  { row: 8, col: 5, box: 7 },
  { row: 8, col: 6, box: 8 },
  { row: 8, col: 7, box: 8 },
  { row: 8, col: 8, box: 8 },
];

export class SudokuSolver {
  /**
   * Bitmasks for numbers (1-9) present in each of the 9 rows.
   * `rowMasks[i]` stores a bitmask for row `i`.
   * If bit `k` (1-indexed, e.g., 1 << k) is set in `rowMasks[i]`,
   * it means the number `k` is present in row `i`.
   */
  private readonly rowMasks: Uint16Array = new Uint16Array(9);

  /**
   * Bitmasks for numbers (1-9) present in each of the 9 columns.
   * `columnMasks[j]` stores a bitmask for column `j`. (Note: Renamed from colsMasks for consistency)
   */
  private readonly columnMasks: Uint16Array = new Uint16Array(9);

  /**
   * Bitmasks for numbers (1-9) present in each of the 9 3x3 boxes (subgrids).
   * `boxMasks[b]` stores a bitmask for box `b`. (Note: Renamed from boxesMasks for consistency)
   */
  private readonly boxMasks: Uint16Array = new Uint16Array(9);

  /**
   * The 9x9 Sudoku grid itself, represented as a flat array of 81 strings.
   * Each string is a character from '1' to '9' for a filled cell,
   * or '0' for an empty cell (default).
   * `puzzleGrid[cellIndex]` gives the value of a cell. (Note: Renamed from currentPuzzleGrid)
   */
  private readonly puzzleGrid: string[] = new Array<string>(81).fill("0");

  /**
   * An array storing the indices (0-80) of all currently empty cells on the puzzleGrid.
   * The actual number of valid entries is tracked by `emptyCount`. (Note: Renamed from emptyCellsCount)
   */
  private readonly emptyCellIndices: Uint8Array = new Uint8Array(81);

  /**
   * A lookup array that maps a cell index (0-80) to its current position
   * within the `emptyCellIndices` array.
   * If `positionOfCellInEmptyList[cellIdx] = p`, it means `emptyCellIndices[p] = cellIdx`.
   */
  private readonly positionOfCellInEmptyList: Uint8Array = new Uint8Array(81);

  /**
   * The current number of empty cells remaining on the Sudoku puzzleGrid that need to be filled.
   * (Note: Renamed from emptyCellsCount for consistency with C++ 'emptyCount')
   */
  private emptyCount: number = 0;

  /**
   * Initializes the solver with a Sudoku puzzle string.
   * @param puzzleData A string of 81 characters representing the puzzle.
   *                   Digits '1'-'9' are filled cells, other chars ('.', '0') are empty.
   * @returns True if the initial puzzle is valid and setup is complete, false otherwise.
   */
  public initialize(puzzleData: string): boolean {
    if (puzzleData === null || puzzleData.length !== 81) {
      return false;
    }

    this.emptyCount = 0;
    this.rowMasks.fill(0);
    this.columnMasks.fill(0);
    this.boxMasks.fill(0);
    this.positionOfCellInEmptyList.fill(81);

    for (let i = 0; i < 81; i++) {
      const char = puzzleData[i];
      if (char >= "1" && char <= "9") {
        this.puzzleGrid[i] = char;
      } else {
        this.puzzleGrid[i] = "0";
      }
    }

    let initialValid = true;
    for (let i = 0; i < 81; ++i) {
      let num = 0;
      if (this.puzzleGrid[i] >= "1" && this.puzzleGrid[i] <= "9") {
        num = parseInt(this.puzzleGrid[i], 10);
      }

      if (num !== 0) {
        const valueMask = 1 << num;
        const info = preCellLookup[i];

        if (
          this.rowMasks[info.row] & valueMask ||
          this.columnMasks[info.col] & valueMask ||
          this.boxMasks[info.box] & valueMask
        ) {
          initialValid = false;
        }
        this.rowMasks[info.row] |= valueMask;
        this.columnMasks[info.col] |= valueMask;
        this.boxMasks[info.box] |= valueMask;
      } else {
        if (this.emptyCount < 81) {
          this.emptyCellIndices[this.emptyCount] = i;
          this.positionOfCellInEmptyList[i] = this.emptyCount;
          this.emptyCount++;
        } else {
          console.error(
            "SudokuSolver: Exceeded empty cell capacity during initialization.",
          );
          return false;
        }
      }
    }
    return initialValid;
  }

  /**
   * Finds the empty cell with the Minimum Remaining Values (MRV heuristic).
   * @returns The cell index (0-80) of the best cell, or -1 if a contradiction is found
   *          (an empty cell with no possible moves).
   */
  protected findMRV(): number {
    let minPossibleValuesCount = 10;
    let bestCellIndex: number = -1;

    for (let i = 0; i < this.emptyCount; ++i) {
      const currentCellIndex = this.emptyCellIndices[i];
      const cellInfo = preCellLookup[currentCellIndex];

      const usedNumbersMask =
        this.rowMasks[cellInfo.row] |
        this.columnMasks[cellInfo.col] |
        this.boxMasks[cellInfo.box];

      const possibleNumbersMask = ~usedNumbersMask & 0x3fe;
      const currentCellPossibleValuesCount = popcount(possibleNumbersMask);

      if (currentCellPossibleValuesCount === 0) {
        return -1;
      }

      if (currentCellPossibleValuesCount < minPossibleValuesCount) {
        minPossibleValuesCount = currentCellPossibleValuesCount;
        bestCellIndex = currentCellIndex;
        if (minPossibleValuesCount === 1) {
          break;
        }
      }
    }

    if (bestCellIndex === -1 && this.emptyCount > 0) {
      bestCellIndex = this.emptyCellIndices[0];
    }
    return bestCellIndex;
  }

  /**
   * Places a number in a cell and updates tracking structures.
   * Assumes the move is valid (not checked here, but by the calling logic in solveInternal).
   * @param cellIndex The cell (0-80) where the number is placed.
   * @param value The digit (1-9) to place.
   */
  private place(cellIndex: number, value: number): void {
    if (cellIndex < 0 || cellIndex >= 81 || value < 1 || value > 9) {
      return;
    }

    const cellInfo = preCellLookup[cellIndex];
    const valueMask = 1 << value;

    this.rowMasks[cellInfo.row] |= valueMask;
    this.columnMasks[cellInfo.col] |= valueMask;
    this.boxMasks[cellInfo.box] |= valueMask;

    this.puzzleGrid[cellIndex] = String(value);

    if (this.emptyCount > 0) {
      const originalPositionInEmptyList =
        this.positionOfCellInEmptyList[cellIndex];

      if (
        originalPositionInEmptyList < this.emptyCount &&
        originalPositionInEmptyList >= 0
      ) {
        const lastEmptyCellIndexInList =
          this.emptyCellIndices[this.emptyCount - 1];

        if (cellIndex !== lastEmptyCellIndexInList) {
          this.emptyCellIndices[originalPositionInEmptyList] =
            lastEmptyCellIndexInList;
          this.positionOfCellInEmptyList[lastEmptyCellIndexInList] =
            originalPositionInEmptyList;
        }
        this.positionOfCellInEmptyList[cellIndex] = 81;
        this.emptyCount--;
      }
    }
  }

  /**
   * Removes a number from a cell and updates tracking structures (for backtracking).
   * @param cellIndex The cell (0-80) from which the number is removed.
   * @param value The digit (1-9) to remove.
   */
  private remove(cellIndex: number, value: number): void {
    if (cellIndex < 0 || cellIndex >= 81 || value < 1 || value > 9) {
      console.warn(
        `SudokuSolver: Invalid parameters for remove - cell: ${cellIndex}, value: ${value}`,
      );
      return;
    }

    const cellInfo = preCellLookup[cellIndex];
    const clearMask = ~(1 << value);

    this.rowMasks[cellInfo.row] &= clearMask;
    this.columnMasks[cellInfo.col] &= clearMask;
    this.boxMasks[cellInfo.box] &= clearMask;

    this.puzzleGrid[cellIndex] = "0";

    if (this.emptyCount < 81) {
      this.positionOfCellInEmptyList[cellIndex] = this.emptyCount;
      this.emptyCellIndices[this.emptyCount] = cellIndex;
      this.emptyCount++;
    } else {
    }
  }

  /**
   * Recursive backtracking algorithm to solve the Sudoku.
   * @returns True if a solution is found from the current state, false otherwise.
   */
  protected solveInternal(): boolean {
    if (this.emptyCount === 0) {
      return true; // All cells filled, solution found
    }

    const currentCellIndex = this.findMRV();

    if (currentCellIndex === -1) {
      return false; // Backtrack
    }

    if (currentCellIndex < 0 || currentCellIndex >= 81) {
      return false;
    }

    const cellInfo = preCellLookup[currentCellIndex];
    const usedNumbersMask =
      this.rowMasks[cellInfo.row] |
      this.columnMasks[cellInfo.col] |
      this.boxMasks[cellInfo.box];

    let possibleNumbersMask = ~usedNumbersMask & 0x3fe;

    while (possibleNumbersMask > 0) {
      const digitToTry = ctz(possibleNumbersMask);

      if (digitToTry < 1 || digitToTry > 9) {
        possibleNumbersMask &= possibleNumbersMask - 1;
        continue;
      }

      this.place(currentCellIndex, digitToTry);

      if (this.solveInternal()) {
        return true;
      }

      this.remove(currentCellIndex, digitToTry);

      possibleNumbersMask &= ~(1 << digitToTry);
    }

    return false;
  }

  /**
   * Public method to initiate solving the puzzle.
   * Performs sanity checks before calling the internal recursive solver.
   * @returns True if a solution is found, false otherwise.
   */
  public solve(): boolean {
    const validDigitsMask = 0x3fe;

    for (let i = 0; i < 9; ++i) {
      if (
        popcount(this.rowMasks[i] & validDigitsMask) !==
        popcount(this.rowMasks[i])
      ) {
        console.error(`SudokuSolver: Corrupted state in rowMasks[${i}]`);
        return false;
      }
      if (
        popcount(this.columnMasks[i] & validDigitsMask) !==
        popcount(this.columnMasks[i])
      ) {
        console.error(`SudokuSolver: Corrupted state in columnMasks[${i}]`);
        return false;
      }
      if (
        popcount(this.boxMasks[i] & validDigitsMask) !==
        popcount(this.boxMasks[i])
      ) {
        console.error(`SudokuSolver: Corrupted state in boxMasks[${i}]`);
        return false;
      }
    }
    return this.solveInternal();
  }

  /**
   * Retrieves the solution (or current state) of the Sudoku grid as a single string.
   * @returns A string of 81 characters.
   */
  public getSolution(): string {
    return this.puzzleGrid.join("");
  }

  /**
   * Retrieves the solution (or current state) as an array of strings.
   * @returns An array of 81 string cell values.
   */
  public getSolutionAsArray(): string[] {
    return [...this.puzzleGrid];
  }
}
