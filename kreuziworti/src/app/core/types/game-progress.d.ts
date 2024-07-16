export type GameProgress = {
  categoryProgress: CategoryProgress[];
}

export type CategoryProgress = {
  categoryId: string;
  puzzleProgress: PuzzleProgress[];
}

export type PuzzleProgress = {
  puzzleId: string;
  done: boolean;
  assignedLetters: string[][];
}
