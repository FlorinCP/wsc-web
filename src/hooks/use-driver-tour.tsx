"use client"

import { useEffect, useState } from "react"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"

export function useDriverTour() {
  const [driverObj, setDriverObj] = useState<any>(null)
  const [isFirstVisit, setIsFirstVisit] = useState(true)

  useEffect(() => {
    // Check if this is the first visit
    const hasVisited = localStorage.getItem("sudoku-tour-completed")
    setIsFirstVisit(!hasVisited)

    // Initialize driver
    const driverInstance = driver({
      showProgress: true,
      steps: [
        {
          element: "#sudoku-board",
          popover: {
            title: "Sudoku Board",
            description: "This is your 9x9 Sudoku grid. Click on any cell to select it and enter a number.",
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
            description: "Click these buttons to enter numbers into the selected cell.",
            side: "top",
            align: "center",
          },
        },
        {
          element: "#game-controls",
          popover: {
            title: "Game Controls",
            description: "Use these controls to start a new game, undo moves, get hints, and more.",
            side: "top",
            align: "center",
          },
        },
        {
          element: "#notes-toggle",
          popover: {
            title: "Notes Mode",
            description: "Toggle notes mode to add multiple candidate numbers to a cell.",
            side: "left",
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
      ],
      nextBtnText: "Next",
      prevBtnText: "Previous",
      doneBtnText: "Done",
      onDestroyed: () => {
        // Mark tour as completed
        localStorage.setItem("sudoku-tour-completed", "true")
      },
    })

    setDriverObj(driverInstance)

    return () => {
      driverInstance.destroy()
    }
  }, [])

  const startTour = () => {
    if (driverObj) {
      driverObj.drive()
    }
  }

  return { startTour, isFirstVisit }
}
