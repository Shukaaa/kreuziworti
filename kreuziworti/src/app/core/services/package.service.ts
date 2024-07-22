import {Injectable} from "@angular/core";
import {CrosswordCategory, CrosswordWord, PackageList} from "../types/crossword-data";

@Injectable()
export class PackageService {
  constructor() { }

  get packages(): Promise<CrosswordCategory[]> {
    return this.receivePackages();
  }

  private async receivePackages(): Promise<CrosswordCategory[]> {
    const availablePackages: PackageList = await this.getAllAvailablePackages();
    const receivedCategories: CrosswordCategory[] = [];

    for (const pkg of availablePackages.order) {
      const categoryMetaData: CrosswordCategory = await this.getCategoryMetaData(pkg);
      categoryMetaData.puzzles.forEach(puzzle => {
        puzzle.horizontal = puzzle.horizontal.map((word: CrosswordWord) => {
          return {
            word: word.word,
            startPoint: {x: word.startPoint.x, y: word.startPoint.y},
            endPoint: {x: word.startPoint.x + word.word.length - 1, y: word.startPoint.y},
            description: word.description
          };
        })

        puzzle.vertical = puzzle.vertical.map((word: CrosswordWord) => {
          return {
            word: word.word,
            startPoint: {x: word.startPoint.x, y: word.startPoint.y},
            endPoint: {x: word.startPoint.x, y: word.startPoint.y + word.word.length - 1},
            description: word.description
          };
        })
      })
      receivedCategories.push(categoryMetaData);
    }

    return receivedCategories;
  }

  private async getCategoryMetaData(pkg: string): Promise<CrosswordCategory> {
    const categoryMetaDataUrl = `https://raw.githubusercontent.com/Shukaaa/kreuziworti/master/packages/${pkg}.json`;
    const categoryMetaDataResponse = await fetch(categoryMetaDataUrl, { cache: 'no-store' });
    return await categoryMetaDataResponse.json();
  }

  private async getAllAvailablePackages(): Promise<PackageList> {
    const response = await fetch("https://raw.githubusercontent.com/Shukaaa/kreuziworti/master/packages/_categories.json", { cache: 'no-store' });
    return await response.json();
  }
}
