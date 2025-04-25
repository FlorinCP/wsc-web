"use client";

import { useEffect, useRef, useState } from "react";
import { Driver, driver, DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

const TOUR_STEPS: DriveStep[] = [
  {
    element: "#sudoku-board",
    popover: {
      title: "Sudoku Board",
      description:
        "This is your 9x9 Sudoku grid. Click on any cell to select it and enter a number.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: "#difficulty-tabs",
    popover: {
      title: "Difficulty Levels",
      description: "Choose between Easy, Medium, and Hard difficulty levels.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: "#number-keypad",
    popover: {
      title: "Number Keypad",
      description:
        "Click these buttons to enter numbers into the selected cell.",
      side: "top",
      align: "center",
    },
  },
  {
    element: "#game-controls",
    popover: {
      title: "Game Controls",
      description:
        "Use these controls to start a new game, undo moves, get hints, and more.",
      side: "top",
      align: "center",
    },
  },
  {
    element: "#notes-toggle",
    popover: {
      title: "Notes Mode",
      description:
        "Toggle notes mode to add multiple candidate numbers to a cell.",
      side: "left",
      align: "center",
    },
  },
  {
    element: "#solution",
    popover: {
      title: "Solution",
      description: "Click here to see the solution.",
      side: "top",
      align: "center",
    },
  },
  {
    element: "#timer-display",
    popover: {
      title: "Timer",
      description: "Keep track of how long you've been playing.",
      side: "right",
      align: "center",
    },
  },
];

export function useDriverTour() {
  const driverRef = useRef<Driver | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | null>(null);

  useEffect(() => {
    const visited = localStorage.getItem("sudoku-tour-completed") === "true";
    setIsFirstVisit(!visited);

    driverRef.current = driver({
      showProgress: true,
      nextBtnText: "Next",
      prevBtnText: "Previous",
      doneBtnText: "Done",
      steps: TOUR_STEPS,
      onDestroyed: () => {
        localStorage.setItem("sudoku-tour-completed", "true");
      },
    });

    return () => {
      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
      }
    };
  }, []);

  const startTour = () => {
    if (driverRef.current) {
      driverRef.current.drive();
    }
  };

  return { startTour, isFirstVisit };
}
