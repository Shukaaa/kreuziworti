import { Routes } from '@angular/router';
import {HomeComponent} from "./core/views/home/home.component";
import {PuzzleComponent} from "./core/views/puzzle/puzzle.component";
import {ThemesComponent} from "./core/views/themes/themes.component";
import {SettingsComponent} from "./core/views/settings/settings.component";

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'puzzle/:categoryId/:puzzleId',
    component: PuzzleComponent
  },
  {
    path: 'themes',
    component: ThemesComponent
  },
  {
    path: 'settings',
    component: SettingsComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
