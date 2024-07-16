import {Injectable} from "@angular/core";
import {GameProgress} from "../types/game-progress";

@Injectable()
export class LocalStorageStore {
  prefix = 'kreuziworti-'

  setGameProgress(gameProgress: GameProgress) {
    localStorage.setItem(this.prefix+'gameProgress', JSON.stringify(gameProgress));
  }

  getGameProgress(): GameProgress {
    const gameProgress = localStorage.getItem(this.prefix+'gameProgress');
    return gameProgress ? JSON.parse(gameProgress) : {categoryProgress: []};
  }

  setTheme(theme: string) {
    localStorage.setItem(this.prefix+'theme', theme);
  }

  getTheme(): string | null {
    return localStorage.getItem(this.prefix+'theme');
  }
}
