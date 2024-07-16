import { Component } from '@angular/core';
import {RouterLink} from "@angular/router";
import {NgForOf} from "@angular/common";
import {LocalStorageStore} from "../../stores/local-storage.store";

@Component({
  selector: 'app-themes',
  standalone: true,
  imports: [
    RouterLink,
    NgForOf
  ],
  templateUrl: './themes.component.html',
  styleUrl: './themes.component.scss'
})
export class ThemesComponent {
  themes = [
    {
      id: 'old-os',
      title: 'Old OS',
      description: 'Der steinalte Look von etwas, das wie ein Betriebssystem aussieht'
    },
    {
      id: 'hacker',
      title: 'Hackerman',
      description: 'Ein dunkler Look, der dich wie einen Hacker aussehen lässt *mega cool*'
    },
    {
      id: 'retro',
      title: 'Retro ULTRA KONTRAST',
      description: 'Ein Retro-Look, der dich in die Vergangenheit zurückversetzt :o'
    },
    {
      id: 'retro-lighter',
      title: 'Retro Light',
      description: 'Ein heller Retro-Look, der dich in die Vergangenheit zurückversetzt :o'
    }
  ]

  constructor(private localStorageStore: LocalStorageStore) {
  }

  selectTheme(theme: string) {
    this.localStorageStore.setTheme(theme)
    document.getElementsByTagName('body')[0].className = theme
  }

  getCurrentTheme() {
    return this.localStorageStore.getTheme() ? this.localStorageStore.getTheme() : 'old-os'
  }
}
