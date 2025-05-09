## Getting Started

First, to run the development server:

```bash
    npm install
```

Then,

```bash
    npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
Alternatively, you can use the [Live Instance](https://wsc-web.vercel.app/) to test the app.

## Important

If any errors regarding the WASM pop-up (
such as "WebAssembly Not Loaded - Please Refresh
WebAssembly solver requires cross-origin isolation. Some features may not work.")
or the buttons are not working beeing in a disabled state, just refresh the page, I didnt have time to fully fix and check it.

## Home

Play Sudoku on 3 levels of difficulty: Easy, Medium, and Hard. The game is designed to be user-friendly and visually appealing, with a clean interface and intuitive controls.
The game board is displayed in a grid format, with numbers and colors indicating the current state of the game. Users can easily input numbers, check their progress, and receive hints when needed.
The game also includes a timer to track how long it takes to complete the puzzle, adding an element of challenge and competition.

Solve Button - use WASM module to instantly solve the puzzle and display the solution on the board.

## About

How the game uses a WASM module to solve the puzzle. The module is written in C++.
There is also a npm package that can be used to solve the puzzle, but it is not used in this project. The module is compiled to WebAssembly and loaded into the game using Emscripten.
I had problems with setting it up to work with Next.js.
I did it just for fun and to learn something new.

## Deploy on Vercel

Batch Solver:
Upload a txt file with multiple Sudoku puzzles and get the solutions in a txt file.
Uses the WASM module to solve the puzzles with parallelization.

## Learn

Not fully functional -- supposed to be a page with tutorials where they teach you how to solve sudokus based on different strategies.
