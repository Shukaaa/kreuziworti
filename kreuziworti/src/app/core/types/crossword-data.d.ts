import {Coordinate} from "./coordinate";

export type CrosswordCategory = {
  id: string;
  title: string;
  description: string;
  puzzleAmount: number;
  puzzles: CrosswordPuzzle[];
}

export type CrosswordPuzzle = {
  id: string;
  horizontal: CrosswordWord[];
  vertical: CrosswordWord[];
  finalWord: CrosswordFinalWord
}

export type CrosswordFinalWord = {
  word: string;
  letters: FinalWordLetters[];
}

export type FinalWordLetters = {
  word: string;
  letterPos: number;
}

export type CrosswordWord = {
  word: string;
  startPoint: Coordinate;
  endPoint: Coordinate;
  description: string;
}

export type PackageList = {
  packages: string[];
}
