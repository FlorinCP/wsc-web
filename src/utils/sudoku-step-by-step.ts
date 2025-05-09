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
 * @param n The non-negative integer.
 * @param bitWidth The conceptual bit width for the 'n is 0' case.
 * @returns The 0-indexed position of the LSB, used as the digit (1-9).
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

export interface SolverStepYield {
  action:
    | "INITIAL_STATE" // Added for the very first yield
    | "SELECTING_CELL" // About to run findMRV
    | "CELL_SELECTED"
    | "TRYING_VALUE"
    | "PLACED_VALUE"
    | "RECURSIVE_CALL" // Indicates a "deeper" step in conceptual recursion
    | "BACKTRACKING_REMOVING"
    | "BACKTRACKED_FROM_CELL" // After removing, indicating failure for previous value
    | "NO_MORE_VALUES_FOR_CELL" // After trying all values for a cell
    | "SOLVED"
    | "UNSOLVABLE_CONTRADICTION" // findMRV returned -1 or cell has 0 possibles
    | "UNSOLVABLE_EXHAUSTED"; // Exhausted all possibilities
  grid: string[];
  activeCellIndex?: number; // The 0-80 index of the cell being worked on
  currentValue?: number; // The value being tried/placed/removed
  possibleNumbersMask?: number; // The bitmask of possible numbers for the active cell
  message: string;
  isDone: boolean;
  emptyCount?: number;
  // For iterative solver, we might need to expose parts of its internal stack for richer viz
  depth?: number; // Conceptual depth of recursion
}

interface IterativeSolverFrame {
  cellIndex: number;
  possibleNumbersMask: number; // The *remaining* possible numbers to try for this cell
  lastTriedValue?: number; // The value just tried from this frame that led to a deeper call or backtrack
}

export class SudokuSolver {
  private readonly rowMasks: Uint16Array = new Uint16Array(9);
  private readonly columnMasks: Uint16Array = new Uint16Array(9);
  private readonly boxMasks: Uint16Array = new Uint16Array(9);
  private readonly puzzleGrid: string[] = new Array<string>(81).fill("0");
  private readonly emptyCellIndices: Uint8Array = new Uint8Array(81);
  private readonly positionOfCellInEmptyList: Uint8Array = new Uint8Array(81);
  private emptyCount: number = 0;

  public initialize(puzzleData: string): boolean {
    /* ... same as before ... */
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
      this.puzzleGrid[i] = char >= "1" && char <= "9" ? char : "0";
    }
    let initialValid = true;
    for (let i = 0; i < 81; ++i) {
      let num = 0;
      if (this.puzzleGrid[i] !== "0") num = parseInt(this.puzzleGrid[i], 10);
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
          return false;
        }
      }
    }
    return initialValid;
  }
  protected findMRV(): number {
    /* ... same as before ... */
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
      const count = popcount(possibleNumbersMask);
      if (count === 0) return -1;
      if (count < minPossibleValuesCount) {
        minPossibleValuesCount = count;
        bestCellIndex = currentCellIndex;
        if (minPossibleValuesCount === 1) break;
      }
    }
    if (bestCellIndex === -1 && this.emptyCount > 0)
      bestCellIndex = this.emptyCellIndices[0];
    return bestCellIndex;
  }
  private place(cellIndex: number, value: number): void {
    /* ... same as before ... */
    if (cellIndex < 0 || cellIndex >= 81 || value < 1 || value > 9) return;
    const cellInfo = preCellLookup[cellIndex];
    const valueMask = 1 << value;
    this.rowMasks[cellInfo.row] |= valueMask;
    this.columnMasks[cellInfo.col] |= valueMask;
    this.boxMasks[cellInfo.box] |= valueMask;
    this.puzzleGrid[cellIndex] = String(value);
    if (this.emptyCount > 0) {
      const pos = this.positionOfCellInEmptyList[cellIndex];
      if (pos < this.emptyCount && pos >= 0) {
        const lastCellIdx = this.emptyCellIndices[this.emptyCount - 1];
        if (cellIndex !== lastCellIdx) {
          this.emptyCellIndices[pos] = lastCellIdx;
          this.positionOfCellInEmptyList[lastCellIdx] = pos;
        }
        this.positionOfCellInEmptyList[cellIndex] = 81;
        this.emptyCount--;
      }
    }
  }
  private remove(cellIndex: number, value: number): void {
    /* ... same as before ... */
    if (cellIndex < 0 || cellIndex >= 81 || value < 1 || value > 9) return;
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
    }
  }

  // The non-generator solveInternal and solve are still useful for direct solving
  protected solveInternal(): boolean {
    /* ... same as before ... */
    if (this.emptyCount === 0) return true;
    const cellIdx = this.findMRV();
    if (cellIdx === -1) return false;
    const info = preCellLookup[cellIdx];
    const used =
      this.rowMasks[info.row] |
      this.columnMasks[info.col] |
      this.boxMasks[info.box];
    let possible = ~used & 0x3fe;
    while (possible > 0) {
      const digit = ctz(possible);
      if (digit < 1 || digit > 9) {
        possible &= possible - 1;
        continue;
      }
      this.place(cellIdx, digit);
      if (this.solveInternal()) return true;
      this.remove(cellIdx, digit);
      possible &= ~(1 << digit);
    }
    return false;
  }
  public solve(): boolean {
    /* ... same as before ... */
    const vMask = 0x3fe;
    for (let i = 0; i < 9; ++i) {
      if (popcount(this.rowMasks[i] & vMask) !== popcount(this.rowMasks[i]))
        return false;
      if (
        popcount(this.columnMasks[i] & vMask) !== popcount(this.columnMasks[i])
      )
        return false;
      if (popcount(this.boxMasks[i] & vMask) !== popcount(this.boxMasks[i]))
        return false;
    }
    return this.solveInternal();
  }

  public *solveStepByStep(): Generator<SolverStepYield, boolean, void> {
    yield {
      action: "INITIAL_STATE",
      grid: [...this.puzzleGrid],
      message: "Solver initialized. Starting step-by-step.",
      isDone: false,
      emptyCount: this.emptyCount,
      depth: 0,
    };

    const callStack: IterativeSolverFrame[] = [];

    // Main loop simulates recursion
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (this.emptyCount === 0) {
        yield {
          action: "SOLVED",
          grid: [...this.puzzleGrid],
          message: "Puzzle Solved!",
          isDone: true,
          emptyCount: this.emptyCount,
          depth: callStack.length,
        };
        return true; // Solution found
      }

      yield {
        // About to select a cell
        action: "SELECTING_CELL",
        grid: [...this.puzzleGrid],
        message: "Selecting next cell using MRV...",
        isDone: false,
        emptyCount: this.emptyCount,
        depth: callStack.length,
      };
      const currentCellIndex = this.findMRV();

      if (currentCellIndex === -1) {
        // Contradiction from findMRV
        yield {
          action: "UNSOLVABLE_CONTRADICTION",
          grid: [...this.puzzleGrid],
          message:
            "Contradiction: An empty cell has no possible values (from MRV).",
          isDone: false, // Will backtrack or declare unsolvable if stack is empty
          emptyCount: this.emptyCount,
          depth: callStack.length,
        };
        // This means we need to backtrack from the previous state
        if (callStack.length === 0) {
          yield {
            action: "UNSOLVABLE_EXHAUSTED",
            grid: [...this.puzzleGrid],
            message: "Puzzle is unsolvable (MRV contradiction at root).",
            isDone: true,
            emptyCount: this.emptyCount,
            depth: 0,
          };
          return false; // Unsolvable from the start
        }
        // Backtrack logic will be handled by popping the stack below
        // No number to try, so effectively act as if all numbers for current top of stack failed
        const lastFrame = callStack[callStack.length - 1];
        lastFrame.possibleNumbersMask = 0; // Force exhaustion for the previous cell
        // continue to the backtracking part of the loop
      } else {
        // Valid cell found by MRV
        const cellInfo = preCellLookup[currentCellIndex];
        const usedNumbersMask =
          this.rowMasks[cellInfo.row] |
          this.columnMasks[cellInfo.col] |
          this.boxMasks[cellInfo.box];
        const initialPossibleMaskForCell = ~usedNumbersMask & 0x3fe;

        yield {
          action: "CELL_SELECTED",
          grid: [...this.puzzleGrid],
          activeCellIndex: currentCellIndex,
          possibleNumbersMask: initialPossibleMaskForCell,
          message: `Selected cell ${currentCellIndex} (R${cellInfo.row}C${cellInfo.col}). Possible mask: ${initialPossibleMaskForCell.toString(2)}`,
          isDone: false,
          emptyCount: this.emptyCount,
          depth: callStack.length,
        };

        if (initialPossibleMaskForCell === 0) {
          // Selected cell has no moves
          yield {
            action: "UNSOLVABLE_CONTRADICTION",
            grid: [...this.puzzleGrid],
            activeCellIndex: currentCellIndex,
            message: `Contradiction: Cell ${currentCellIndex} has no possible values.`,
            isDone: false, // Will backtrack
            emptyCount: this.emptyCount,
            depth: callStack.length,
          };
          // Backtrack: no need to push, just let it fall to stack pop if needed
          if (callStack.length === 0) {
            yield {
              action: "UNSOLVABLE_EXHAUSTED",
              grid: [...this.puzzleGrid],
              message:
                "Puzzle is unsolvable (selected cell has no moves at root).",
              isDone: true,
              emptyCount: this.emptyCount,
              depth: 0,
            };
            return false;
          }
          // Effectively, this cell failed. The calling frame needs to try its next number.
          // Mark the *previous* frame's attempt as failed by setting its possible mask to 0 for that try.
          const prevFrame = callStack[callStack.length - 1];
          if (prevFrame.lastTriedValue !== undefined) {
            // if a value was indeed tried
            // This logic is tricky, as we're skipping a level of "recursion"
            // Better to let it try to place 0, then backtrack immediately.
            // For now, let the standard backtracking handle this by letting the next part of the loop fail to find a digit.
            // This means the current frame (cell) will be pushed, then immediately fail & pop.
          }
          // Push the current cell's frame onto the stack to try its (empty) possibilities
          callStack.push({
            cellIndex: currentCellIndex,
            possibleNumbersMask: initialPossibleMaskForCell,
          });
          // The loop will then try to get a digit from this mask.
        } else {
          // Push a new frame for this cell
          callStack.push({
            cellIndex: currentCellIndex,
            possibleNumbersMask: initialPossibleMaskForCell,
          });
          yield {
            action: "RECURSIVE_CALL", // Conceptually going deeper
            grid: [...this.puzzleGrid],
            activeCellIndex: currentCellIndex,
            message: `Exploring possibilities for cell ${currentCellIndex}.`,
            isDone: false,
            emptyCount: this.emptyCount,
            depth: callStack.length,
          };
          // Continue to the next iteration to process the top of the stack
          continue;
        }
      }

      // --- Process the top of the call stack (or backtrack if needed) ---
      while (callStack.length > 0) {
        const currentFrame = callStack[callStack.length - 1];

        if (currentFrame.possibleNumbersMask > 0) {
          const digitToTry = ctz(currentFrame.possibleNumbersMask);

          if (digitToTry < 1 || digitToTry > 9) {
            // Should not happen
            currentFrame.possibleNumbersMask &=
              currentFrame.possibleNumbersMask - 1; // Clear LSB
            if (currentFrame.possibleNumbersMask === 0) continue; // Re-evaluate this frame
            yield {
              action: "TRYING_VALUE",
              message: "Error with ctz, skipping invalid digit.",
              grid: [...this.puzzleGrid],
              activeCellIndex: currentFrame.cellIndex,
              depth: callStack.length,
              isDone: false,
            };
            continue;
          }

          currentFrame.lastTriedValue = digitToTry; // Store what we are about to try

          yield {
            action: "TRYING_VALUE",
            grid: [...this.puzzleGrid],
            activeCellIndex: currentFrame.cellIndex,
            currentValue: digitToTry,
            possibleNumbersMask: currentFrame.possibleNumbersMask, // Show remaining for this cell
            message: `Cell ${currentFrame.cellIndex}: Trying value ${digitToTry}.`,
            isDone: false,
            emptyCount: this.emptyCount,
            depth: callStack.length,
          };

          this.place(currentFrame.cellIndex, digitToTry);
          yield {
            action: "PLACED_VALUE",
            grid: [...this.puzzleGrid],
            activeCellIndex: currentFrame.cellIndex,
            currentValue: digitToTry,
            message: `Cell ${currentFrame.cellIndex}: Placed ${digitToTry}.`,
            isDone: false,
            emptyCount: this.emptyCount,
            depth: callStack.length,
          };

          // Remove this tried digit from the current frame's mask *before* "recursing"
          currentFrame.possibleNumbersMask &= ~(1 << digitToTry);
          break; // Break from inner while to go to the top of the outer "recursive" loop (to pick next MRV cell)
        } else {
          // No more numbers to try for the cell in currentFrame
          yield {
            action: "NO_MORE_VALUES_FOR_CELL",
            grid: [...this.puzzleGrid],
            activeCellIndex: currentFrame.cellIndex,
            message: `Cell ${currentFrame.cellIndex}: No more values to try. Backtracking.`,
            isDone: false,
            emptyCount: this.emptyCount,
            depth: callStack.length,
          };

          callStack.pop(); // Pop this frame, we're backtracking

          if (
            currentFrame.lastTriedValue !== undefined &&
            this.puzzleGrid[currentFrame.cellIndex] ===
              String(currentFrame.lastTriedValue)
          ) {
            // This check is important: only remove if the value is still there.
            // It might have been overwritten by a deeper failed branch that didn't properly clean up,
            // or if this frame itself had no values to try (initialPossibleMaskForCell was 0).
            // However, `place` sets the grid, and `remove` clears it.
            // We need to remove the `lastTriedValue` of the *frame we are returning to*
            // No, we remove the value from the cell OF THE FRAME WE JUST POPPED.
            // This is because its `place` is what we are undoing.

            // If a frame is popped because its `possibleNumbersMask` is 0,
            // it means all its children (deeper recursive calls) failed.
            // The number that *this frame placed* (its `lastTriedValue` if it had one,
            // or the value that was in `this.puzzleGrid[currentFrame.cellIndex]`)
            // must be removed.
            const valueActuallyInCell = parseInt(
              this.puzzleGrid[currentFrame.cellIndex],
            );
            if (valueActuallyInCell >= 1 && valueActuallyInCell <= 9) {
              // Only remove if it's a valid digit
              yield {
                action: "BACKTRACKING_REMOVING",
                grid: [...this.puzzleGrid], // Grid *before* remove
                activeCellIndex: currentFrame.cellIndex,
                currentValue: valueActuallyInCell,
                message: `Backtracking: Removing ${valueActuallyInCell} from cell ${currentFrame.cellIndex}.`,
                isDone: false,
                emptyCount: this.emptyCount,
                depth: callStack.length + 1, // Depth of the action being undone
              };
              this.remove(currentFrame.cellIndex, valueActuallyInCell);
            }
          }

          if (callStack.length === 0) {
            // Backtracked all the way to the start
            yield {
              action: "UNSOLVABLE_EXHAUSTED",
              grid: [...this.puzzleGrid],
              message: "Puzzle is unsolvable (exhausted all possibilities).",
              isDone: true,
              emptyCount: this.emptyCount,
              depth: 0,
            };
            return false; // Unsolvable
          }

          // After popping, the new currentFrame (top of stack) needs to try its *next* value.
          // Its `possibleNumbersMask` already had the previously tried value removed before the deeper call.
          const newTopFrame = callStack[callStack.length - 1];
          yield {
            action: "BACKTRACKED_FROM_CELL",
            grid: [...this.puzzleGrid],
            activeCellIndex: newTopFrame.cellIndex, // Now focus on this cell
            message: `Backtracked. Continuing with cell ${newTopFrame.cellIndex}.`,
            isDone: false,
            emptyCount: this.emptyCount,
            depth: callStack.length,
          };
          // Continue the inner `while (callStack.length > 0)` to process `newTopFrame`
        }
      } // End of inner while(callStack.length > 0)

      if (callStack.length === 0 && this.emptyCount > 0) {
        // This case implies the initial cell selection failed or similar, and stack became empty.
        // Should be caught by the UNPROVABLE_EXHAUSTED earlier.
        yield {
          action: "UNSOLVABLE_EXHAUSTED",
          grid: [...this.puzzleGrid],
          message: "Puzzle is unsolvable (unexpected stack empty).",
          isDone: true,
          emptyCount: this.emptyCount,
          depth: 0,
        };
        return false;
      }
    } // End of outer while(true)
  }

  public getSolution(): string {
    return this.puzzleGrid.join("");
  }
  public getSolutionAsArray(): string[] {
    return [...this.puzzleGrid];
  }
}

export { popcount, ctz, preCellLookup, type CellInfo };
