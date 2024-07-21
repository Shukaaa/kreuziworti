import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {PackageService} from "./core/services/package.service";
import {PackageStore} from "./core/stores/package.store";
import {LocalStorageStore} from "./core/stores/local-storage.store";
import {AudioPlayerService} from "./core/services/audio-player.service";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    PackageService,
    PackageStore,
    LocalStorageStore,
    AudioPlayerService
  ]
};
