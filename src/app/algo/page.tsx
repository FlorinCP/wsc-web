"use client";

import React, { useState } from "react";

const Page = () => {
  // Initial mini-grid for demonstration (focusing on a smaller grid for clarity)
  // We'll use a 4x4 sudoku-like grid with indices 0-15 for simplicity
  const initialGrid = [1, 0, 3, 0, 0, 0, 0, 2, 0, 1, 0, 0, 4, 0, 0, 3];

  // Calculate initial emptyCells and position arrays
  const getInitialState = () => {
    const emptyCells = [];
    const position = Array(16).fill(16); // Default value 16 for filled cells
    let emptyCount = 0;

    for (let i = 0; i < 16; i++) {
      if (initialGrid[i] === 0) {
        emptyCells.push(i);
        position[i] = emptyCount;
        emptyCount++;
      }
    }

    return {
      grid: [...initialGrid],
      emptyCells,
      position,
      emptyCount,
    };
  };

  // State management
  const [state, setState] = useState(getInitialState());
  const [currentStep, setCurrentStep] = useState(0);
  const [operationType, setOperationType] = useState("place"); // 'place' or 'remove'
  const [operationCell, setOperationCell] = useState(1); // Default cell to operate on
  const [operationValue, setOperationValue] = useState(2); // Default value to place

  // Reset to initial state
  const resetState = () => {
    setState(getInitialState());
    setCurrentStep(0);
  };

  // Format index as row/col
  const formatCellRC = (index: number) => {
    const row = Math.floor(index / 4);
    const col = index % 4;
    return `R${row + 1}C${col + 1}`;
  };

  // Navigation functions
  const nextStep = () => {
    if (currentStep < (operationType === "place" ? 5 : 3)) {
      const nextStepNum = currentStep + 1;
      setCurrentStep(nextStepNum);

      // Execute operations at their final steps
      if (operationType === "place" && nextStepNum === 5) {
        executePlaceOperation();
      } else if (operationType === "remove" && nextStepNum === 3) {
        executeRemoveOperation();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);

      // If going back from the execution step, reset state
      if (
        (operationType === "place" && currentStep === 5) ||
        (operationType === "remove" && currentStep === 3)
      ) {
        resetState();
      }
    }
  };

  // Go to specific step
  const goToStep = (step: number) => {
    if (step !== currentStep) {
      if (step < currentStep) {
        // If going backward past execution step, reset state
        if (
          (operationType === "place" && currentStep === 5) ||
          (operationType === "remove" && currentStep === 3)
        ) {
          resetState();
        }
      } else if (step === 5 && operationType === "place") {
        executePlaceOperation();
      } else if (step === 3 && operationType === "remove") {
        executeRemoveOperation();
      }
      setCurrentStep(step);
    }
  };

  // Get step descriptions
  const getStepDescriptions = () => {
    if (operationType === "place") {
      return [
        "Initial state before placing a number",
        `Step 1: We want to place ${operationValue} in cell ${operationCell} (${formatCellRC(operationCell)})`,
        `Step 2: Find where cell ${operationCell} is in emptyCells using position[${operationCell}] = ${state.position[operationCell]}`,
        `Step 3: Get the last empty cell: emptyCells[${state.emptyCount - 1}] = ${state.emptyCells[state.emptyCount - 1]}`,
        `Step 4: Move the last empty cell to position[${operationCell}] and update position array`,
        `Step 5: Mark cell ${operationCell} as filled (position[${operationCell}] = 16) and decrement emptyCount`,
      ];
    } else {
      return [
        "Initial state before removing a number",
        `Step 1: We want to remove the number from cell ${operationCell} (${formatCellRC(operationCell)})`,
        `Step 2: Add cell ${operationCell} to the end of emptyCells: emptyCells[${state.emptyCount}] = ${operationCell}`,
        `Step 3: Update position[${operationCell}] = ${state.emptyCount} and increment emptyCount`,
      ];
    }
  };

  // Execute place operation simulation
  const executePlaceOperation = () => {
    const updatedState = { ...state };

    // Find position of the cell in emptyCells
    const pos = updatedState.position[operationCell];

    // Get the last empty cell
    const lastCell = updatedState.emptyCells[updatedState.emptyCount - 1];

    // Replace the current cell with the last empty cell
    updatedState.emptyCells[pos] = lastCell;

    // Update position of the last cell
    updatedState.position[lastCell] = pos;

    // Mark the current cell as filled
    updatedState.position[operationCell] = 16;

    // Decrement empty count
    updatedState.emptyCount--;

    // Update grid
    updatedState.grid[operationCell] = operationValue;

    setState(updatedState);
  };

  // Execute remove operation simulation
  const executeRemoveOperation = () => {
    const updatedState = { ...state };

    // Add the cell to the end of emptyCells
    updatedState.emptyCells[updatedState.emptyCount] = operationCell;

    // Update position of the cell
    updatedState.position[operationCell] = updatedState.emptyCount;

    // Increment empty count
    updatedState.emptyCount++;

    // Update grid
    updatedState.grid[operationCell] = 0;

    setState(updatedState);
  };

  // Highlight cells based on the current step
  const getCellHighlight = (index: number) => {
    if (operationType === "place") {
      if (currentStep >= 1 && index === operationCell) {
        return "border-4 border-red-500";
      }
      if (
        currentStep >= 3 &&
        index === state.emptyCells[state.emptyCount - 1]
      ) {
        return "border-4 border-blue-500";
      }
    } else {
      if (currentStep >= 1 && index === operationCell) {
        return "border-4 border-red-500";
      }
    }
    return "";
  };

  // Highlight array elements based on the current step
  const getEmptyCellsHighlight = (idx: number) => {
    if (operationType === "place") {
      if (currentStep >= 2 && idx === state.position[operationCell]) {
        return "bg-yellow-200 font-bold";
      }
      if (currentStep >= 3 && idx === state.emptyCount - 1) {
        return "bg-blue-200 font-bold";
      }
    } else {
      if (currentStep >= 2 && idx === state.emptyCount) {
        return "bg-yellow-200 font-bold";
      }
    }
    return "";
  };

  const getPositionHighlight = (idx: number) => {
    if (operationType === "place") {
      if (currentStep >= 2 && idx === operationCell) {
        return "bg-yellow-200 font-bold";
      }
      if (
        currentStep >= 4 &&
        idx === state.emptyCells[state.position[operationCell]]
      ) {
        return "bg-blue-200 font-bold";
      }
    } else {
      if (currentStep >= 2 && idx === operationCell) {
        return "bg-yellow-200 font-bold";
      }
    }
    return "";
  };

  // Get pseudocode based on operation type
  const getPseudocode = () => {
    if (operationType === "place") {
      return `void place(int cell, int num) {
  // Update bitmasks (rows, cols, boxes)
  // Update grid[cell] = num
  
  // Update empty cells tracking
  if (emptyCount > 0) {
    const int pos = position[cell];
    // Get last empty cell
    const last_cell = emptyCells[emptyCount - 1];
    // Replace cell with last empty cell
    emptyCells[pos] = last_cell;
    // Update position of last cell
    position[last_cell] = pos;
    // Mark cell as filled
    position[cell] = 16; // out of bounds value
    // Decrement empty count
    emptyCount--;
  }
}`;
    } else {
      return `void remove(int cell, int num) {
  // Update bitmasks (rows, cols, boxes)
  // Update grid[cell] = 0
  
  // Update empty cells tracking
  if (emptyCount < 16) {
    // Add cell to the end of emptyCells
    position[cell] = emptyCount;
    emptyCells[emptyCount] = cell;
    // Increment empty count
    emptyCount++;
  }
}`;
    }
  };

  // Get current step's description
  const stepDescriptions = getStepDescriptions();
  const currentStepDescription = stepDescriptions[currentStep];

  // Calculate max steps based on operation type
  const maxSteps = operationType === "place" ? 5 : 3;

  return (
    <div className="flex flex-col items-center p-6 font-sans">
      <h1 className="text-2xl font-bold text-blue-800 mb-2">
        Sudoku Cell Operations - Manual Navigation
      </h1>
      <p className="text-gray-600 max-w-3xl text-center mb-4">
        Use the navigation controls to step through the process of{" "}
        <code>place()</code> and <code>remove()</code> operations.
      </p>

      <div className="w-full max-w-4xl">
        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Operation Settings
              </h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <div>
                  <label className="text-gray-700 block mb-1">
                    Operation Type:
                  </label>
                  <select
                    value={operationType}
                    onChange={(e) => {
                      setOperationType(e.target.value);
                      resetState();
                    }}
                    className="border border-gray-300 rounded px-3 py-1"
                  >
                    <option value="place">place()</option>
                    <option value="remove">remove()</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-700 block mb-1">
                    Cell Index:
                  </label>
                  <select
                    value={operationCell}
                    onChange={(e) => {
                      setOperationCell(Number(e.target.value));
                      resetState();
                    }}
                    className="border border-gray-300 rounded px-3 py-1"
                  >
                    {initialGrid.map((val, idx) => (
                      <option
                        key={idx}
                        value={idx}
                        disabled={
                          operationType === "place" ? val !== 0 : val === 0
                        }
                      >
                        {idx} ({formatCellRC(idx)})
                      </option>
                    ))}
                  </select>
                </div>

                {operationType === "place" && (
                  <div>
                    <label className="text-gray-700 block mb-1">
                      Value to Place:
                    </label>
                    <select
                      value={operationValue}
                      onChange={(e) =>
                        setOperationValue(Number(e.target.value))
                      }
                      className="border border-gray-300 rounded px-3 py-1"
                    >
                      {[1, 2, 3, 4].map((val) => (
                        <option key={val} value={val}>
                          {val}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <button
                onClick={resetState}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Step Navigation
          </h2>

          <div className="flex justify-between items-center mb-4">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`px-4 py-2 rounded ${currentStep === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"} font-medium`}
            >
              Previous Step
            </button>

            <div className="text-gray-700 font-medium">
              Step {currentStep} of {maxSteps}
            </div>

            <button
              onClick={nextStep}
              disabled={currentStep === maxSteps}
              className={`px-4 py-2 rounded ${currentStep === maxSteps ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"} font-medium`}
            >
              Next Step
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {stepDescriptions.map((desc, idx) => (
              <button
                key={idx}
                onClick={() => goToStep(idx)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentStep === idx
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                Step {idx}
              </button>
            ))}
          </div>

          <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mt-4">
            <p className="text-blue-800 font-medium">
              {currentStepDescription}
            </p>
            <div className="flex justify-end mt-2">
              <div className="text-blue-700 font-mono text-sm">
                emptyCount = {state.emptyCount}
              </div>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Grid */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Grid</h2>
              <div className="grid grid-cols-4 gap-1">
                {state.grid.map((value, idx) => (
                  <div
                    key={idx}
                    className={`
                      w-14 h-14 flex items-center justify-center font-medium rounded-md text-xl relative
                      ${value === 0 ? "bg-gray-100" : "bg-blue-200"}
                      ${getCellHighlight(idx)}
                    `}
                  >
                    {value !== 0 ? value : ""}
                    <span className="absolute bottom-0 left-0 text-xs text-gray-500 p-1">
                      {idx}
                    </span>
                    {value === 0 && (
                      <span className="absolute top-0 right-0 text-xs text-blue-800 font-bold p-1">
                        {state.position[idx]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm text-gray-600">
                <p>- Cell index shown in bottom left</p>
                <p>- Empty cells show position index in top right</p>
                <p>- Red border indicates the cell being operated on</p>
                <p>
                  - Blue border indicates the last empty cell (in place
                  operations)
                </p>
              </div>
            </div>
          </div>

          {/* Array states */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                emptyCells and position Arrays
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-800">
                    emptyCells[{state.emptyCount}]:
                  </h3>
                  <div className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                    <div className="flex flex-wrap gap-1">
                      {state.emptyCells
                        .slice(0, state.emptyCount)
                        .map((cell, idx) => (
                          <div
                            key={`empty-${idx}`}
                            className={`px-2 py-1 rounded text-xs font-mono ${getEmptyCellsHighlight(idx)}`}
                          >
                            [{idx}]={cell}
                          </div>
                        ))}
                      {currentStep === 2 && operationType === "remove" && (
                        <div className="px-2 py-1 rounded text-xs font-mono bg-yellow-200 font-bold">
                          [{state.emptyCount}]={operationCell}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-800">position[16]:</h3>
                  <div className="bg-gray-100 p-2 rounded mt-1">
                    <p className="text-xs mb-1">Empty cells:</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {state.position.map((pos, idx) =>
                        pos !== 16 ? (
                          <div
                            key={`pos-${idx}`}
                            className={`px-2 py-1 rounded text-xs font-mono ${getPositionHighlight(idx)}`}
                          >
                            [{idx}]={pos}
                          </div>
                        ) : null,
                      )}
                      {currentStep === 2 && operationType === "remove" && (
                        <div className="px-2 py-1 rounded text-xs font-mono bg-yellow-200 font-bold">
                          [{operationCell}]={state.emptyCount}
                        </div>
                      )}
                    </div>
                    <p className="text-xs mb-1">Filled cells:</p>
                    <div className="flex flex-wrap gap-1">
                      {state.position.map((pos, idx) =>
                        pos === 16 ? (
                          <div
                            key={`pos-filled-${idx}`}
                            className={`px-2 py-1 rounded text-xs font-mono ${getPositionHighlight(idx)}`}
                          >
                            [{idx}]=16
                          </div>
                        ) : null,
                      )}
                      {currentStep === 5 && operationType === "place" && (
                        <div className="px-2 py-1 rounded text-xs font-mono bg-yellow-200 font-bold">
                          [{operationCell}]=16
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Code and explanation */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/2">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Implementation
              </h2>
              <pre className="bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto whitespace-pre">
                {getPseudocode()}
              </pre>
            </div>

            <div className="lg:w-1/2">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Key Insights
              </h2>

              {operationType === "place" ? (
                <div className="space-y-3">
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded">
                    <h3 className="font-medium text-indigo-800">
                      O(1) Removal
                    </h3>
                    <p className="text-indigo-700 text-sm">
                      Instead of shifting all elements after the removed cell
                      (which would be O(n)), the algorithm swaps the removed
                      cell with the last element, making removal O(1).
                    </p>
                  </div>

                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <h3 className="font-medium text-green-800">
                      Bidirectional Updates
                    </h3>
                    <p className="text-green-700 text-sm">
                      Both <code>emptyCells</code> and <code>position</code>{" "}
                      arrays are updated in sync to maintain their inverse
                      relationship.
                    </p>
                  </div>

                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <h3 className="font-medium text-red-800">
                      Backtracking Efficiency
                    </h3>
                    <p className="text-red-700 text-sm">
                      The solver may try thousands of combinations during
                      backtracking. Without this O(1) update system, performance
                      would degrade significantly.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded">
                    <h3 className="font-medium text-indigo-800">
                      O(1) Addition
                    </h3>
                    <p className="text-indigo-700 text-sm">
                      Adding a cell back to the empty cells list is always O(1)
                      as it simply appends to the end of the{" "}
                      <code>emptyCells</code> array.
                    </p>
                  </div>

                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <h3 className="font-medium text-green-800">
                      State Restoration
                    </h3>
                    <p className="text-green-700 text-sm">
                      The <code>remove</code> operation is critical for
                      backtracking as it perfectly restores the cell&#39;s empty
                      status without needing to track previous states.
                    </p>
                  </div>

                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <h3 className="font-medium text-red-800">
                      Constant Time Invariant
                    </h3>
                    <p className="text-red-700 text-sm">
                      Even after thousands of operations, place and remove
                      maintain O(1) time complexity, ensuring consistent solver
                      performance regardless of puzzle complexity.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
