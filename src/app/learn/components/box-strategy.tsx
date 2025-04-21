"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { driver } from "driver.js";

export function BoxStrategy() {
  const startBoxTour = () => {
    const driverObj = driver({
      showProgress: true,
      steps: [
        {
          element: "#sudoku-board",
          popover: {
            title: "Box Analysis",
            description:
              "In this example, we'll use box analysis to find where numbers must go.",
          },
        },
        {
          element: ".grid-cols-9 > div:nth-child(31)", // Top-left cell of a 3x3 box
          popover: {
            title: "Examine This Box",
            description:
              "This 3×3 box already contains numbers 1, 2, 5, and 9.",
          },
        },
        {
          element: ".grid-cols-9 > div:nth-child(33)", // A cell in the box
          popover: {
            title: "Check Row Constraints",
            description:
              "The row containing this cell already has 3, 6, and 8 in other boxes.",
          },
        },
        {
          element: ".grid-cols-9 > div:nth-child(33)", // Same cell for conclusion
          popover: {
            title: "Make a Deduction",
            description:
              "By process of elimination, the number 7 must go here!",
          },
        },
      ],
    });

    driverObj.drive();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Box Analysis Technique</CardTitle>
          <CardDescription>Find numbers by analyzing 3×3 boxes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Box analysis is a powerful technique that focuses on the 3×3 boxes
            and their interactions with rows and columns.
          </p>

          <div className="space-y-2">
            <h3 className="font-medium">Box-Line Reduction</h3>
            <p>
              If a number can only appear in one row or column within a box,
              then that number cannot appear in that same row or column in other
              boxes.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Box-Box Interaction</h3>
            <p>
              When a number is restricted to the same row or column in two
              boxes, that number cannot appear in that row or column in the
              third box of that section.
            </p>
          </div>

          <Button onClick={startBoxTour} className="mt-4">
            See Box Analysis
          </Button>
        </CardContent>
      </Card>

      <Card id="interactive-demo">
        <CardHeader>
          <CardTitle>Practice Box Techniques</CardTitle>
          <CardDescription>Try analyzing boxes for patterns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2">
            <li>Focus on one 3×3 box at a time</li>
            <li>
              For each missing number, identify all possible cells within the
              box
            </li>
            <li>
              Check if any number can only go in one row or column within the
              box
            </li>
            <li>Look for patterns across multiple boxes</li>
          </ol>
          <p className="text-sm text-muted-foreground mt-4">
            In the example board, try to find where the number 4 must go in the
            bottom-right box by analyzing the constraints from other boxes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
