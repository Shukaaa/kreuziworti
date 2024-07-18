import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PuzzleComponent } from './puzzle.component';
import { PackageStore } from '../../stores/package.store';
import { LocalStorageStore } from '../../stores/local-storage.store';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('PuzzleComponent', () => {
  let component: PuzzleComponent;
  let fixture: ComponentFixture<PuzzleComponent>;
  let mockPackageStore: jasmine.SpyObj<PackageStore>;
  let mockLocalStorageStore: jasmine.SpyObj<LocalStorageStore>;
  let mockActivatedRoute: any;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockPackageStore = jasmine.createSpyObj('PackageStore', ['getPackagesByCategoryId']);
    mockLocalStorageStore = jasmine.createSpyObj('LocalStorageStore', ['getGameProgress', 'setGameProgress']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      snapshot: {
        params: {
          categoryId: '1',
          puzzleId: '1'
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [PuzzleComponent, RouterTestingModule],
      providers: [
        { provide: PackageStore, useValue: mockPackageStore },
        { provide: LocalStorageStore, useValue: mockLocalStorageStore },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PuzzleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set up puzzle correctly when there is no progress', () => {
    const categoryId = '1';
    const gameProgress = {
      categoryProgress: []
    };
    const puzzleData = {
      horizontal: [],
      vertical: [],
      finalWord: {
        word: 'FINAL',
        letters: []
      }
    };

    mockLocalStorageStore.getGameProgress.and.returnValue(gameProgress);
    component.puzzleData = puzzleData;

    component.setupPuzzle(categoryId);

    expect(component.assignedLetters.length).toBe(0);
  });

  // Add more tests here
});
