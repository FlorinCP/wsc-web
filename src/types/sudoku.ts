export type CellType = {
  value: number
  isOriginal: boolean
  notes: number[]
  isHighlighted: boolean
  isRelated: boolean
  isInvalid: boolean
}

export type SudokuBoard = CellType[][]
