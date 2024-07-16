import {Injectable} from "@angular/core";
import {CrosswordCategory, CrosswordPuzzle, CrosswordWord, PackageList} from "../types/crossword-data";

@Injectable()
export class PackageService {
  packageStorageUrl = 'https://raw.githubusercontent.com/Shukaaa/kreuziworti/master/packages/packages.json';

  constructor() { }

  get packages(): Promise<CrosswordCategory[]> {
    return this.receivePackages();
  }

  private async receivePackages(): Promise<CrosswordCategory[]> {
    const availablePackages: PackageList = await this.getAllAvailablePackages();
    const receivedCategories: CrosswordCategory[] = [];

    for (const pkg of availablePackages.packages) {
      const categoryMetaData: CrosswordCategory = await this.getCategoryMetaData(pkg);

      for (const i of Array.from(Array(categoryMetaData.puzzleAmount).keys())) {
        const puzzleMetaData: CrosswordPuzzle = await this.getPuzzleMetaData(pkg, i+1);

        // Endpoints are not included in the puzzle metadata, so we need to calculate them
        puzzleMetaData.horizontal = puzzleMetaData.horizontal.map((word: CrosswordWord) => {
          return {
            word: word.word,
            startPoint: {x: word.startPoint.x, y: word.startPoint.y},
            endPoint: {x: word.startPoint.x + word.word.length - 1, y: word.startPoint.y},
            description: word.description
          };
        })

        puzzleMetaData.vertical = puzzleMetaData.vertical.map((word: CrosswordWord) => {
          return {
            word: word.word,
            startPoint: {x: word.startPoint.x, y: word.startPoint.y},
            endPoint: {x: word.startPoint.x, y: word.startPoint.y + word.word.length - 1},
            description: word.description
          };
        })

        categoryMetaData.puzzles.push(puzzleMetaData);
      }

      receivedCategories.push(categoryMetaData);
    }

    return receivedCategories;
  }

  private async getCategoryMetaData(pkg: string): Promise<CrosswordCategory> {
    const categoryMetaDataUrl = `https://raw.githubusercontent.com/Shukaaa/kreuziworti/master/packages/${pkg}/category.json`;
    const categoryMetaDataResponse = await fetch(categoryMetaDataUrl);
    const categoryMetaData = await categoryMetaDataResponse.json();
    return {...categoryMetaData, puzzles: []};
  }

  private async getPuzzleMetaData(pkg: string, puzzleNumber: number): Promise<CrosswordPuzzle> {
    const puzzleMetaDataUrl = `https://raw.githubusercontent.com/Shukaaa/kreuziworti/master/packages/${pkg}/puzzles/${puzzleNumber}.json`;
    const puzzleMetaDataResponse = await fetch(puzzleMetaDataUrl);
    return await puzzleMetaDataResponse.json();
  }

  private async getAllAvailablePackages(): Promise<PackageList> {
    const response = await fetch(this.packageStorageUrl);
    return await response.json();
  }
}
