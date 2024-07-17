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

    // check if game progress for this puzzle exists
    const gameProgress = this.gameProgressStore.getGameProgress();
    const puzzleProgress = gameProgress.categoryProgress.find(categoryProgress => categoryProgress.categoryId === categoryId)
      ?.puzzleProgress.find(puzzleProgress => puzzleProgress.puzzleId === puzzleId);

    if (puzzleProgress) {
      this.assignedLetters = puzzleProgress.assignedLetters;
    } else {
      // initialize assignedLetters array with x
      const gameFieldSize = this.getGameFieldSize();
      this.assignedLetters = this.getArray(gameFieldSize.y).map(() => this.getArray(gameFieldSize.x).map(() => "x"));
    }

    document.addEventListener('keydown', (event) => {
      if (event.key.length === 1) {
        this.recognizeLetter(event.key.toUpperCase());
      }
    });

    // determine final word location by x and y coordinates
    const finalWord = this.puzzleData.finalWord;
    const finalWordLetters = finalWord.letters;
    for (const letter of finalWordLetters) {
      const word = letter.word;
      const letterPos = letter.letterPos;

      this.puzzleData.horizontal.forEach((hWord) => {
        if (hWord.word === word) {
          const x = hWord.startPoint.x + letterPos - 1;
          const y = hWord.startPoint.y;
          this.finalLetterLocations.push({x, y});
        }
      });

      this.puzzleData.vertical.forEach((vWord) => {
        if (vWord.word === word) {
          const x = vWord.startPoint.x;
          const y = vWord.startPoint.y + letterPos - 1;
          this.finalLetterLocations.push({x, y});
        }
      });
    }
  }

  saveProgress() {
    const categoryId = this.route.snapshot.params['categoryId'];
    const puzzleId = this.route.snapshot.params['puzzleId'];
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
        gameProgress.categoryProgress[categoryProgressIndex].puzzleProgress[puzzleProgressIndex].done = this.done;
      }
    }

    this.gameProgressStore.setGameProgress(gameProgress);
  }

  wordDiscovered(word: CrosswordWord, isHorizontal: boolean): boolean {
    if (isHorizontal) {
      for (let i = word.startPoint.x; i <= word.endPoint.x; i++) {
        const assignedLetter = this.assignedLetters[word.startPoint.y - 1][i - 1].toUpperCase();
        const wordLetter = word.word[i - word.startPoint.x].toUpperCase();
        if (assignedLetter !== wordLetter) {
          return false;
        }
      }
    }

    if (!isHorizontal) {
      for (let i = word.startPoint.y; i <= word.endPoint.y; i++) {
        const assignedLetter = this.assignedLetters[i - 1][word.startPoint.x - 1].toUpperCase();
        const wordLetter = word.word[i - word.startPoint.y].toUpperCase();
        if (assignedLetter !== wordLetter) {
          return false;
        }
      }
    }

    return true;
  }

  getArray(size: number): number[] {
    return Array.from({length: size}, (_, i) => i);
  }

  getGameFieldSize(): Coordinate {
    const horizontal = this.puzzleData?.horizontal.reduce((acc, word) => {
      const max = Math.max(word.startPoint.x, word.endPoint.x);
      return max > acc ? max : acc;
    }, 0) as number;

    const vertical = this.puzzleData?.vertical.reduce((acc, word) => {
      const max = Math.max(word.startPoint.y, word.endPoint.y);
      return max > acc ? max : acc;
    }, 0) as number;

    return {x: horizontal, y: vertical}
  }

  isLetterField(x: number, y: number) {
    return this.puzzleData?.horizontal.some(word => {
      return x >= word.startPoint.x && x <= word.endPoint.x && y === word.startPoint.y;
    }) || this.puzzleData?.vertical.some(word => {
      return y >= word.startPoint.y && y <= word.endPoint.y && x === word.startPoint.x;
    });
  }

  getWordStart(x: number, y: number): string {
    // get index of word in horizontal or vertical array

    const horizontalIndex = this.puzzleData?.horizontal.findIndex(word => {
      return x === word.startPoint.x && y === word.startPoint.y;
    });

    if (horizontalIndex !== -1) {
      // @ts-ignore
      return "W" + (horizontalIndex + 1);
    }

    const verticalIndex = this.puzzleData?.vertical.findIndex(word => {
      return x === word.startPoint.x && y === word.startPoint.y;
    });

    if (verticalIndex !== -1) {
      // @ts-ignore
      return "S" + (verticalIndex + 1);
    }

    return "";
  }

  getFinalWordLetter(x: number, y: number) {
    const isFinalWorldLetter = this.finalLetterLocations.some((location) => {
      return location.x === x && location.y === y;
    });

    const index = this.finalLetterLocations.findIndex((location) => {
      return location.x === x && location.y === y;
    });

    return isFinalWorldLetter ? "L" + (index + 1) : "";
  }

  getLetter(x: number, y: number): string {
    return this.assignedLetters[y - 1][x - 1];
  }

  setLetter(x: number, y: number, letter: string) {
    this.assignedLetters[y - 1][x - 1] = letter;
    this.saveProgress();
  }

  selectedField: Coordinate | null = null;

  recognizeLetter(letter: string) {
    if (this.selectedField !== null) {
      this.setLetter(this.selectedField.x, this.selectedField.y, letter);
      this.selectedField = null;
    }
  }

  selectField(x: number, y: number) {
    if (this.isLetterField(x, y)) {
      this.selectedField = {x, y};
    }
  }

  isFieldSelected(x: number, y: number) {
    return this.selectedField !== null && this.selectedField.x === x && this.selectedField.y === y;
  }

  getCellClass(x: number, y: number) {
    let classes = [
      "cell"
    ];

    if (this.isLetterField(x, y)) {
      classes.push("letter");
    }

    if (this.isFieldSelected(x, y)) {
      classes.push("selected");
    }

    return classes.join(" ");
  }

  get finalWord(): string {
    let word = ""
    for (let i = 0; i < this.finalLetterLocations.length; i++) {
      word += this.getLetter(this.finalLetterLocations[i].x, this.finalLetterLocations[i].y);
    }
    return word;
  }

  checkSolution() {
    if (this.finalWord === this.puzzleData?.finalWord.word.toUpperCase()) {
      this.done = true;
      this.saveProgress();
      alert("YAAAY! Du hast es gerockt!");
      this.router.navigate(['/home']).then(r => r);
      return
    }

    this.done = false;
    alert("Nahhh, das war leider nicht korrekt. Versuch es nochmal!");
  }

  resetGameData() {
    const feedback = confirm("Möchtest du wirklich das Rätsel zurücksetzen? :o");

    if (feedback) {
      this.assignedLetters = this.assignedLetters.map(row => row.map(() => "x"));
      this.saveProgress();
    }
  }
}
