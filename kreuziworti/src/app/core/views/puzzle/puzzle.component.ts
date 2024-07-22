import {Component, OnInit} from '@angular/core';
import {PackageStore} from "../../stores/package.store";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {CrosswordCategory, CrosswordPuzzle, CrosswordWord} from "../../types/crossword-data";
import {NgForOf, NgIf} from "@angular/common";
import {Coordinate} from "../../types/coordinate";
import {LocalStorageStore} from "../../stores/local-storage.store";
import {AudioPlayerService} from "../../services/audio-player.service";

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
  totalNumberOfJokersUsed: number = 0;
  wordFirstDiscoveryMap: Map<string, boolean> = new Map();

  constructor(
    private packageStore: PackageStore,
    private route: ActivatedRoute,
    private gameProgressStore: LocalStorageStore,
    private router: Router,
    private audioPlayerService: AudioPlayerService
  ) {
  }

  async ngOnInit() {
    const categoryId = this.route.snapshot.params['categoryId'];
    const puzzleId = this.route.snapshot.params['puzzleId'];
    const category: CrosswordCategory = await this.packageStore.getPackagesByCategoryId(categoryId);

    this.puzzleData = category.puzzles.find(puzzle => puzzle.id === puzzleId) || null;

    if (!this.puzzleData) {
      alert("Das Rätsel konnte nicht gefunden werden. :(");
      this.router.navigate(['/home']);
    }

    this.categoryTitle = category.title;
    this.puzzleId = puzzleId;

    this.setupPuzzle(categoryId);
    this.initializeKeyListeners();
    this.audioPlayerService.preloadAudios();

    document.documentElement.style.setProperty('--game-field-size-x', this.getGameFieldSize().x.toString());
    document.documentElement.style.setProperty('--game-field-size-y', this.getGameFieldSize().y.toString());
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
      this.totalNumberOfJokersUsed = puzzleProgress.jokersUsed;
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
        this.audioPlayerService.playClick();
      }

      if (event.key === "Backspace" || event.key === "Delete") {
        this.recognizeLetter("x");
        this.audioPlayerService.playRemove();
      }

      if (event.key.length === 1) {
        this.recognizeLetter(event.key.toUpperCase());
        this.audioPlayerService.playClick();
      }

      if (event.key === "ArrowUp" && this.selectedField) {
        const newY = this.selectedField.y - 1;
        this.audioPlayerService.playWhoosh();

        if (this.isLetterField(this.selectedField.x, newY)) {
          this.selectedField.y = newY;
        }
      }

      if (event.key === "ArrowDown" && this.selectedField) {
        const newY = this.selectedField.y + 1;
        this.audioPlayerService.playWhoosh();

        if (this.isLetterField(this.selectedField.x, newY)) {
          this.selectedField.y = newY;
        }
      }

      if (event.key === "ArrowLeft" && this.selectedField) {
        const newX = this.selectedField.x - 1;
        this.audioPlayerService.playWhoosh();

        if (this.isLetterField(newX, this.selectedField.y)) {
          this.selectedField.x = newX;
        }
      }

      if (event.key === "ArrowRight" && this.selectedField) {
        const newX = this.selectedField.x + 1;
        this.audioPlayerService.playWhoosh();

        if (this.isLetterField(newX, this.selectedField.y)) {
          this.selectedField.x = newX;
        }
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
        jokersUsed: this.totalNumberOfJokersUsed,
        done: false,
        assignedLetters: this.assignedLetters
      });
    } else {
      const puzzleProgressIndex = gameProgress.categoryProgress[categoryProgressIndex].puzzleProgress.findIndex(puzzleProgress => puzzleProgress.puzzleId === puzzleId);

      if (puzzleProgressIndex === -1) {
        gameProgress.categoryProgress[categoryProgressIndex].puzzleProgress.push({
          puzzleId,
          done: false,
          jokersUsed: this.totalNumberOfJokersUsed,
          assignedLetters: this.assignedLetters
        });
      } else {
        gameProgress.categoryProgress[categoryProgressIndex].puzzleProgress[puzzleProgressIndex].assignedLetters = this.assignedLetters;
        gameProgress.categoryProgress[categoryProgressIndex].puzzleProgress[puzzleProgressIndex].jokersUsed = this.totalNumberOfJokersUsed;

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

    if (this.wordFirstDiscoveryMap.has(word.word)) {
      return true;
    }

    // First time discovering the word
    this.wordFirstDiscoveryMap.set(word.word, true);
    this.audioPlayerService.playWordFound();

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

  getFieldTags(x: number, y: number): string[] {
    const findWordIndex = (words: CrosswordWord[], type: string): string | undefined => {
      const index = words.findIndex(word => x === word.startPoint.x && y === word.startPoint.y);
      return index !== -1 ? type + (index + 1) : undefined;
    };
    const findLetterIndex = (letters: Coordinate[], type: string): string | undefined => {
      const index = letters.findIndex(letter => x === letter.x && y === letter.y);
      return index !== -1 ? type + (index + 1) : undefined;
    }
    const tags: string[] = [];

    const horizontalTag = this.puzzleData ? findWordIndex(this.puzzleData.horizontal, "W") : undefined;
    if (horizontalTag) tags.push(horizontalTag);

    const verticalTag = this.puzzleData ? findWordIndex(this.puzzleData.vertical, "S") : undefined;
    if (verticalTag) tags.push(verticalTag);

    const finalWordTag = findLetterIndex(this.finalLetterLocations, "L");
    if (finalWordTag) tags.push(finalWordTag);

    return tags;
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
      this.audioPlayerService.playWin().then(() => {
        alert("YAAAY!!! Du hast das Rätsel gelöst! :o");
      });
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

    this.selectField(start.x, start.y);

    for (let i = rangeStart; i <= rangeEnd; i++) {
      const coord = isHorizontal ? {x: i, y: fixedCoord} : {x: fixedCoord, y: i};
      this.highlightLetterByCoordinates(coord);
    }
  }

  highlightLetterByCoordinates(coords: Coordinate, select = false): void {
    const cellElement = document.getElementById(`c-${coords.x}-${coords.y}`);
    if (cellElement) {
      if (select) {
        this.selectField(coords.x, coords.y);
      }

      cellElement.classList.add('highlight');
      setTimeout(() => {
        cellElement.classList.remove('highlight');
      }, 2000);
    }
  }

  getFinalWordLetterCoordinates(index: number): Coordinate {
    return this.finalLetterLocations[index];
  }

  totalWordsSuccessfullyDiscovered(): number {
    const totalHorizontalWords = this.puzzleData?.horizontal
      .filter(word => this.isWordDiscovered(word, true)).length || 0;
    const totalVerticalWords = this.puzzleData?.vertical
      .filter(word => this.isWordDiscovered(word, false)).length || 0;

    return totalHorizontalWords + totalVerticalWords;
  }


  canUseJoker(): boolean {
    return this.totalNumberOfJokersUsed < (this.totalWordsSuccessfullyDiscovered()/3);
  }

  get numberOfJokersLeft(): number {
    return Math.floor((this.totalWordsSuccessfullyDiscovered()/3) - this.totalNumberOfJokersUsed);
  }

  useJoker(): void {
    const feedback = confirm("Möchtest du wirklich einen Joker verwenden? Dieser deckt ein Buchstabe in einen von dir ausgewählten Bereich auf. (Gilt nicht für Lösungswort-Buchstaben)");

    if (!this.canUseJoker()) {
      alert("Du hast keine Joker! Du Strolch!");
      return;
    }

    if (feedback) {
      if (this.selectedField) {
        if (
          this.finalLetterLocations
            .some(location => location.x === this.selectedField?.x && location.y === this.selectedField?.y)
        ) {
          alert("Du denkst du bist schlau, was? Aber nein, du kannst keine Joker für die Buchstaben des Lösungswortes verwenden!");
          return;
        }

        const correctWordHorizontal = this.puzzleData?.horizontal.find(({ startPoint, endPoint }) => {
          return startPoint.y === this.selectedField?.y && startPoint.x <= this.selectedField?.x && endPoint.x >= this.selectedField.x;
        })
        const correctWordVertical = this.puzzleData?.vertical.find(({ startPoint, endPoint }) => {
          return startPoint.x === this.selectedField?.x && startPoint.y <= this.selectedField?.y && endPoint.y >= this.selectedField.y;
        });
        const correctLetter =
          correctWordHorizontal?.word[this.selectedField.x - correctWordHorizontal.startPoint.x] ||
          correctWordVertical?.word[this.selectedField.y - correctWordVertical.startPoint.y];

        if (correctLetter) {
          this.audioPlayerService.playJokerFound();
          this.totalNumberOfJokersUsed++;
          this.setLetter(this.selectedField.x, this.selectedField.y, correctLetter);
        }
      } else {
        alert("Bitte wähle ein Feld aus, um einen Joker zu verwenden.");
      }
    }
  }
}
