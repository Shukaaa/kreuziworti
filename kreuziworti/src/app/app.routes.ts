import { Routes } from '@angular/router';
import {HomeComponent} from "./core/views/home/home.component";
import {PuzzleComponent} from "./core/views/puzzle/puzzle.component";

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
    path: '**',
    redirectTo: ''
  }
];
