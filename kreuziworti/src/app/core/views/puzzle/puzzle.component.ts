import {Component, OnInit} from '@angular/core';
import {PackageStore} from "../../stores/package.store";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {CrosswordCategory, CrosswordPuzzle, CrosswordWord} from "../../types/crossword-data";
import {NgForOf, NgIf} from "@angular/common";
import {Coordinate} from "../../types/coordinate";
import {LocalStorageStore} from "../../stores/local-storage.store";

@Component({
  selector: 'app-puzzle',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    RouterLink
  ],
  templateUrl: './puzzle.component.html',
  styleUrl: './puzzle.component.scss'
})
export class PuzzleComponent implements OnInit {
  puzzleData: CrosswordPuzzle | null = null;
  categoryTitle: string | null = null;
  puzzleId: string | null = null;
  finalLetterLocations: Coordinate[] = [];
  assignedLetters: string[][] = [];
  done: boolean = false;

  constructor(
    private packageStore: PackageStore,
    private route: ActivatedRoute,
    private gameProgressStore: LocalStorageStore,
    private router: Router
  ) {
  }

  async ngOnInit() {
    const categoryId = this.route.snapshot.params['categoryId'];
    const puzzleId = this.route.snapshot.params['puzzleId'];
    const category: CrosswordCategory = await this.packageStore.getPackagesByCategoryId(categoryId);

    this.puzzleData = category.puzzles[parseInt(puzzleId) - 1];
    this.categoryTitle = category.title;
    this.puzzleId = puzzleId;

    this.setupPuzzle(categoryId);
    this.initializeKeyListeners();
  }

  setupPuzzle(categoryId: string): void {
    const gameProgress = this.gameProgressStore.getGameProgress();
    const categoryProgress = gameProgress.categoryProgress.find(
      categoryProgress => categoryProgress.categoryId === categoryId
    );
    const puzzleProgress = categoryProgress?.puzzleProgress.find(
      puzzleProgress => puzzleProgress.puzzleId === this.puzzleId
    );

    if (puzzleProgress) {
      this.assignedLetters = puzzleProgress.assignedLetters;
    } else {
      const gameFieldSize = this.getGameFieldSize();
      this.assignedLetters = Array.from({ length: gameFieldSize.y }, () =>
        Array.from({ length: gameFieldSize.x }, () => "x")
      );
    }

    if (!this.puzzleData) {
      return;
    }

    const { finalWord } = this.puzzleData;
    const { letters: finalWordLetters } = finalWord;

    finalWordLetters.forEach(letter => {
      const { word, letterPos } = letter;

      this.puzzleData?.horizontal.forEach(hWord => {
        if (hWord.word === word) {
          const x = hWord.startPoint.x + letterPos - 1;
          const y = hWord.startPoint.y;
          this.finalLetterLocations.push({ x, y });
        }
      });

      this.puzzleData?.vertical.forEach(vWord => {
        if (vWord.word === word) {
          const x = vWord.startPoint.x;
          const y = vWord.startPoint.y + letterPos - 1;
          this.finalLetterLocations.push({ x, y });
        }
      });
    });
  }

  initializeKeyListeners(): void {
    document.addEventListener('keydown', (event) => {
      if (event.key === "Escape") {
        this.selectedField = null;
      }

      if (event.key === "Backspace" || event.key === "Delete") {
        this.recognizeLetter("x");
      }

      if (event.key.length === 1) {
        this.recognizeLetter(event.key.toUpperCase());
      }
    });
  }

  saveProgress(): void {
    const {categoryId, puzzleId} = this.route.snapshot.params;
    const gameProgress = this.gameProgressStore.getGameProgress();
    const categoryProgressIndex = gameProgress.categoryProgress.findIndex(categoryProgress => categoryProgress.categoryId === categoryId);

    if (categoryProgressIndex === -1) {
      gameProgress.categoryProgress.push({
        categoryId,
        puzzleProgress: []
      });

      gameProgress.categoryProgress[gameProgress.categoryProgress.length - 1].puzzleProgress.push({
        puzzleId,
        done: false,
        assignedLetters: this.assignedLetters
      });
    } else {
      const puzzleProgressIndex = gameProgress.categoryProgress[categoryProgressIndex].puzzleProgress.findIndex(puzzleProgress => puzzleProgress.puzzleId === puzzleId);

      if (puzzleProgressIndex === -1) {
        gameProgress.categoryProgress[categoryProgressIndex].puzzleProgress.push({
          puzzleId,
          done: false,
          assignedLetters: this.assignedLetters
        });
      } else {
        gameProgress.categoryProgress[categoryProgressIndex].puzzleProgress[puzzleProgressIndex].assignedLetters = this.assignedLetters;

        if (gameProgress.categoryProgress[categoryProgressIndex].puzzleProgress[puzzleProgressIndex].done) {
          this.done = true;
        }

        gameProgress.categoryProgress[categoryProgressIndex].puzzleProgress[puzzleProgressIndex].done = this.done;
      }
    }

    this.gameProgressStore.setGameProgress(gameProgress);
  }

  isWordDiscovered(word: CrosswordWord, isHorizontal: boolean): boolean {
    const start = isHorizontal ? word.startPoint.x : word.startPoint.y;
    const end = isHorizontal ? word.endPoint.x : word.endPoint.y;
    const fixedCoordinate = isHorizontal ? word.startPoint.y : word.startPoint.x;

    for (let i = start; i <= end; i++) {
      const assignedLetter = isHorizontal
        ? this.assignedLetters[fixedCoordinate - 1][i - 1].toUpperCase()
        : this.assignedLetters[i - 1][fixedCoordinate - 1].toUpperCase();

      const wordLetter = word.word[i - start].toUpperCase();

      if (assignedLetter !== wordLetter) {
        return false;
      }
    }

    return true;
  }

  getArray(size: number): number[] {
    return Array.from({length: size}, (_, i) => i);
  }

  getGameFieldSize(): Coordinate {
    const getMaxCoordinate = (words: CrosswordWord[], isHorizontal: boolean): number => {
      return words.reduce((acc, word) => {
        const max = isHorizontal ? Math.max(word.startPoint.x, word.endPoint.x) : Math.max(word.startPoint.y, word.endPoint.y);
        return max > acc ? max : acc;
      }, 0);
    };

    const horizontal = this.puzzleData ? getMaxCoordinate(this.puzzleData.horizontal, true) : 0;
    const vertical = this.puzzleData ? getMaxCoordinate(this.puzzleData.vertical, false) : 0;

    return {x: horizontal, y: vertical};
  }

  isLetterField(x: number, y: number): boolean | undefined {
    return this.puzzleData?.horizontal.some(word => {
      return x >= word.startPoint.x && x <= word.endPoint.x && y === word.startPoint.y;
    }) || this.puzzleData?.vertical.some(word => {
      return y >= word.startPoint.y && y <= word.endPoint.y && x === word.startPoint.x;
    });
  }

  getWordStartTag(x: number, y: number): string {
    const findWordIndex = (words: CrosswordWord[], type: string): string | undefined => {
      const index = words.findIndex(word => x === word.startPoint.x && y === word.startPoint.y);
      return index !== -1 ? type + (index + 1) : undefined;
    };

    const horizontalTag = this.puzzleData ? findWordIndex(this.puzzleData.horizontal, "W") : undefined;
    if (horizontalTag) return horizontalTag;

    const verticalTag = this.puzzleData ? findWordIndex(this.puzzleData.vertical, "S") : undefined;
    if (verticalTag) return verticalTag;

    return "";
  }

  getFinalWordTag(x: number, y: number): string {
    const index = this.finalLetterLocations.findIndex(location => location.x === x && location.y === y);
    return index !== -1 ? "L" + (index + 1) : "";
  }

  getLetter(x: number, y: number): string {
    return this.assignedLetters[y - 1][x - 1];
  }

  setLetter(x: number, y: number, letter: string) {
    this.assignedLetters[y - 1][x - 1] = letter;
    this.saveProgress();
  }

  selectedField: Coordinate | null = null;

  recognizeLetter(letter: string): void {
    if (this.selectedField) {
      this.setLetter(this.selectedField.x, this.selectedField.y, letter);
      this.selectedField = null;
    }
  }

  selectField(x: number, y: number): void {
    if (this.isLetterField(x, y)) {
      this.selectedField = {x, y};
    }
  }

  isFieldSelected(x: number, y: number): boolean {
    return this.selectedField !== null && this.selectedField.x === x && this.selectedField.y === y;
  }

  getCellClassString(x: number, y: number): string {
    const classes = ["cell"];

    if (this.isLetterField(x, y)) {
      classes.push("letter");
    }

    if (this.isFieldSelected(x, y)) {
      classes.push("selected");
    }

    return classes.join(" ");
  }

  get finalWord(): string {
    return this.finalLetterLocations.reduce((word, location) => {
      return word + this.getLetter(location.x, location.y);
    }, "");
  }

  checkSolution(): void {
    if (this.finalWord === this.puzzleData?.finalWord.word.toUpperCase()) {
      this.done = true;
      this.saveProgress();
      alert("YAAAY! Du hast es gerockt!");
      this.router.navigate(['/home']);
    } else {
      this.done = false;
      alert("Nahhh, das war leider nicht korrekt. Versuch es nochmal!");
    }
  }

  resetGameData(): void {
    const feedback = confirm("Möchtest du wirklich das Rätsel zurücksetzen? :o");

    if (feedback) {
      this.assignedLetters = this.assignedLetters.map(row => row.map(() => "x"));
      this.saveProgress();
    }
  }

  highlightLettersByCoordinates(start: Coordinate, end: Coordinate, hv: 'horizontal' | 'vertical'): void {
    const isHorizontal = hv === 'horizontal';
    const [fixedCoord, rangeStart, rangeEnd] = isHorizontal
      ? [start.y, start.x, end.x]
      : [start.x, start.y, end.y];

    for (let i = rangeStart; i <= rangeEnd; i++) {
      const coord = isHorizontal ? {x: i, y: fixedCoord} : {x: fixedCoord, y: i};
      this.highlightLetterByCoordinates(coord);
    }
  }

  highlightLetterByCoordinates(coords: Coordinate): void {
    const cellElement = document.getElementById(`c-${coords.x}-${coords.y}`);
    if (cellElement) {
      cellElement.classList.add('highlight');
      setTimeout(() => {
        cellElement.classList.remove('highlight');
      }, 3000);
    }
  }

  getFinalWordLetterCoordinates(index: number): Coordinate {
    return this.finalLetterLocations[index];
  }
}
