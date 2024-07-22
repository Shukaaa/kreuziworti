import {Component, OnInit} from '@angular/core';
import {RouterLink} from "@angular/router";
import {LocalStorageStore} from "../../stores/local-storage.store";
import {AudioPlayerService} from "../../services/audio-player.service";

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  constructor(private localStorageStore: LocalStorageStore, private audioPlayerService: AudioPlayerService) {
  }

  ngOnInit() {
    const sfxVolumeSlider = document.getElementById('sfx-volume') as HTMLInputElement;
    sfxVolumeSlider.value = String(this.localStorageStore.getAudioSettings().sfxVolume*100);
    sfxVolumeSlider.addEventListener('input', this.changeSfxVolume.bind(this));

    const scanlinesCheckbox = document.getElementById('scanlines') as HTMLInputElement;
    scanlinesCheckbox.checked = this.localStorageStore.getGraphicSettings().enableScanlines;
    scanlinesCheckbox.addEventListener('change', this.changeScanlines.bind(this));

    const noiseCheckbox = document.getElementById('noise') as HTMLInputElement;
    noiseCheckbox.checked = this.localStorageStore.getGraphicSettings().enableNoise;
    noiseCheckbox.addEventListener('change', this.changeNoise.bind(this));
  }

  resetGameData() {
    const confirm = window.confirm('Du bist dabei, alle deine Spielstände zu löschen. Also wirklich ALLE. ALLE ALLE ALLE. Bist du sicher?')
    if (confirm) {
      this.localStorageStore.setGameProgress({categoryProgress: []})
    }
  }

  changeSfxVolume(event: any) {
    const audioSettings = this.localStorageStore.getAudioSettings()
    audioSettings.sfxVolume = event.target.value/100
    this.localStorageStore.setAudioSettings(audioSettings)
    this.audioPlayerService.updateVolume()
  }

  changeScanlines(event: any) {
    const graphicSettings = this.localStorageStore.getGraphicSettings()
    graphicSettings.enableScanlines = event.target.checked
    this.localStorageStore.setGraphicSettings(graphicSettings)
  }

  changeNoise(event: any) {
    const graphicSettings = this.localStorageStore.getGraphicSettings()
    graphicSettings.enableNoise = event.target.checked
    this.localStorageStore.setGraphicSettings(graphicSettings)
  }
}
