import {Injectable} from "@angular/core";
import {CrosswordCategory} from "../types/crossword-data";
import {PackageService} from "../services/package.service";

@Injectable()
export class PackageStore {
  categories: CrosswordCategory[] = [];

  constructor(private packageService: PackageService) {
  }

  async getPackages(): Promise<CrosswordCategory[]> {
    if (this.categories.length === 0) {
      console.log('fetching packages');
      await this.packageService.packages.then((packages) => {
        this.categories = packages;
      });

      return this.categories;
    }

    return new Promise((resolve) => {
      resolve(this.categories);
    });
  }

  getPackagesByCategoryId(categoryId: string): Promise<CrosswordCategory> {
    const pkg = this.getPackages().then((packages) => {
      return packages.find((category) => category.id === categoryId);
    });

    if (pkg === undefined) {
      throw new Error('No package found with the given category id');
    }

    return pkg as Promise<CrosswordCategory>;
  }
}
