import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {LocalStorageStore} from "./core/stores/local-storage.store";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(private localStorageStore: LocalStorageStore) {
  }

  isScanlinesEnabled() {
    return this.localStorageStore.getGraphicSettings().enableScanlines
  }

  isNoiseEnabled() {
    return this.localStorageStore.getGraphicSettings().enableNoise
  }
}
