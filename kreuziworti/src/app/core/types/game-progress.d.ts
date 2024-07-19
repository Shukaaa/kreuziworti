export type GameProgress = {
  categoryProgress: CategoryProgress[];
}

export type CategoryProgress = {
  categoryId: string;
  puzzleProgress: PuzzleProgress[];
}

export type PuzzleProgress = {
  puzzleId: string;
  jokersUsed: number;
  done: boolean;
  assignedLetters: string[][];
}
