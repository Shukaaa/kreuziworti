import {Component, OnInit} from '@angular/core';
import {PackageService} from "../../services/package.service";
import {CrosswordCategory, PackageList} from "../../types/crossword-data";
import {NgForOf, NgIf} from "@angular/common";
import {RouterLink} from "@angular/router";
import {PackageStore} from "../../stores/package.store";

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

  constructor(private packageStore: PackageStore) {
  }

  async ngOnInit() {
    this.packageStore.getPackages().then((packages) => {
      this.categories = packages;
    })
  }
}
