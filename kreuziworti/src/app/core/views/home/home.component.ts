import {Component, OnInit} from '@angular/core';
import {CrosswordCategory} from "../../types/crossword-data";
import {NgForOf, NgIf} from "@angular/common";
import {RouterLink} from "@angular/router";
import {PackageStore} from "../../stores/package.store";
import {LocalStorageStore} from "../../stores/local-storage.store";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    RouterLink
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  categories: CrosswordCategory[] = [];

  constructor(private packageStore: PackageStore, private localStorageStore: LocalStorageStore) {
  }

  async ngOnInit() {
    this.enableTheme()

    this.packageStore.getPackages().then((packages) => {
      this.categories = packages;
    })
  }

  enableTheme() {
    const theme = this.localStorageStore.getTheme()

    if (theme) {
      document.getElementsByTagName('body')[0].className = theme
    } else {
      document.getElementsByTagName('body')[0].className = 'old-os'
    }
  }

  getButtonClassList(categoryId: string, puzzleId: number) {
    const gameProgress = this.localStorageStore.getGameProgress()
    const categoryProgress = gameProgress.categoryProgress.find(categoryProgress => categoryProgress.categoryId === categoryId)

    if (!categoryProgress) {
      return ''
    }

    const puzzleProgress = categoryProgress.puzzleProgress.find(puzzleProgress => puzzleProgress.puzzleId === puzzleId.toString())

    if (!puzzleProgress) {
      return ''
    }

    if (puzzleProgress.done) {
      return 'done'
    }

    if (puzzleProgress.assignedLetters.some(row => row.some(letter => letter === 'X'))) {
      return 'in-progress'
    }

    return ''
  }
}
