import {Injectable} from "@angular/core";
import {GameProgress} from "../types/game-progress";

@Injectable()
export class GameProgressStore {
  prefix = 'kreuziworti-'

  setGameProgress(gameProgress: GameProgress) {
    localStorage.setItem(this.prefix+'gameProgress', JSON.stringify(gameProgress));
  }

  getGameProgress(): GameProgress {
    const gameProgress = localStorage.getItem(this.prefix+'gameProgress');
    return gameProgress ? JSON.parse(gameProgress) : {categoryProgress: []};
  }
}
