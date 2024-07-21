import {Injectable} from "@angular/core";
import {LocalStorageStore} from "../stores/local-storage.store";

@Injectable()
export class AudioPlayerService {
  allAudioFilePaths: string[] = [
    "assets/sounds/click.ogg",
    "assets/sounds/joker_found.ogg",
    "assets/sounds/word_found.ogg",
    "assets/sounds/win.ogg",
    "assets/sounds/whoosh.ogg",
    "assets/sounds/remove.ogg",
  ];
  audios: HTMLAudioElement[] = [];

  constructor(private localStorageStore: LocalStorageStore) {}

  preloadAudios() {
    this.allAudioFilePaths.forEach((filePath) => {
      const audio = new Audio();
      audio.src = filePath;
      audio.volume = this.localStorageStore.getAudioSettings().sfxVolume;
      this.audios.push(audio);
    });
  }

  updateVolume() {
    this.audios.forEach((audio) => {
      audio.volume = this.localStorageStore.getAudioSettings().sfxVolume;
    });
  }

  playClick(): Promise<void> {
    this.audios[4].playbackRate = 1.5;
    return this.audios[0].play();
  }

  playJokerFound(): Promise<void> {
    return this.audios[1].play();
  }

  playWordFound(): Promise<void> {
    return this.audios[2].play();
  }

  playWin(): Promise<void> {
    return this.audios[3].play();
  }

  playWhoosh(): Promise<void> {
    this.audios[4].playbackRate = 2;
    return this.audios[4].play();
  }

  playRemove(): Promise<void> {
    return this.audios[5].play();
  }
}
