import { Component } from '@angular/core';
import {RouterLink} from "@angular/router";
import {LocalStorageStore} from "../../stores/local-storage.store";

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  constructor(private localStorageStore: LocalStorageStore) {
  }

  resetGameData() {
    const confirm = window.confirm('Du bist dabei, alle deine Spielstände zu löschen. Also wirklich ALLE. ALLE ALLE ALLE. Bist du sicher?')
    if (confirm) {
      this.localStorageStore.setGameProgress({categoryProgress: []})
    }
  }
}
