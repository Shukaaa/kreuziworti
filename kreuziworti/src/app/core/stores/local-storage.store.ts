import {Injectable} from "@angular/core";
import {GameProgress} from "../types/game-progress";
import {AudioSettings} from "../types/auto-settings";

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

  setAudioSettings(audioSettings: AudioSettings) {
    localStorage.setItem(this.prefix+'audioSettings', JSON.stringify(audioSettings));
  }

  getAudioSettings(): AudioSettings {
    const audioSettings = localStorage.getItem(this.prefix+'audioSettings');
    return audioSettings ? JSON.parse(audioSettings) : {sfxVolume: 1};
  }
}
