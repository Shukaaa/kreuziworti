import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { CrosswordCategory } from "../../types/crossword-data";
import { PackageStore } from "../../stores/package.store";
import { LocalStorageStore } from "../../stores/local-storage.store";
import { RouterTestingModule } from '@angular/router/testing';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockPackageStore: jasmine.SpyObj<PackageStore>;
  let mockLocalStorageStore: jasmine.SpyObj<LocalStorageStore>;

  beforeEach(waitForAsync(() => {
    mockPackageStore = jasmine.createSpyObj('PackageStore', ['getPackages']);
    mockLocalStorageStore = jasmine.createSpyObj('LocalStorageStore', ['getTheme', 'getGameProgress']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HomeComponent], // Import HomeComponent since it's standalone
      providers: [
        { provide: PackageStore, useValue: mockPackageStore },
        { provide: LocalStorageStore, useValue: mockLocalStorageStore }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set theme on initialization', () => {
    const theme = 'dark-theme';
    mockLocalStorageStore.getTheme.and.returnValue(theme);

    component.enableTheme();

    expect(document.getElementsByTagName('body')[0].className).toBe(theme);
  });

  it('should set default theme if no theme is found in local storage', () => {
    mockLocalStorageStore.getTheme.and.returnValue(null);

    component.enableTheme();

    expect(document.getElementsByTagName('body')[0].className).toBe('old-os');
  });

  it('should load categories on initialization', waitForAsync(() => {
    const categories: CrosswordCategory[] = [{ id: '1', title: 'Category 1', puzzles: [], puzzleAmount: 0, description: '' }];
    mockPackageStore.getPackages.and.returnValue(Promise.resolve(categories));

    component.enableTheme();

    fixture.whenStable().then(() => {
      expect(component.categories).toEqual(categories);
    });
  }));

  it('should return appropriate class based on game progress', () => {
    const gameProgress = {
      categoryProgress: [
        {
          categoryId: '1',
          puzzleProgress: [
            { puzzleId: '1', done: true, assignedLetters: [['x']] },
            { puzzleId: '2', done: false, assignedLetters: [['x']] },
            { puzzleId: '3', done: false, assignedLetters: [['']] }
          ]
        }
      ]
    };

    mockLocalStorageStore.getGameProgress.and.returnValue(gameProgress);

    let classList = component.getButtonClassList('1', 1);
    expect(classList).toBe('done');

    classList = component.getButtonClassList('1', 2);
    expect(classList).toBe('in-progress');

    classList = component.getButtonClassList('1', 3);
    expect(classList).toBe('');
  });

  it('should return empty class if category is not found in progress', () => {
    const gameProgress = { categoryProgress: [] };
    mockLocalStorageStore.getGameProgress.and.returnValue(gameProgress);

    const classList = component.getButtonClassList('1', 1);
    expect(classList).toBe('');
  });

  it('should return empty class if puzzle is not found in progress', () => {
    const gameProgress = {
      categoryProgress: [
        {
          categoryId: '1',
          puzzleProgress: []
        }
      ]
    };

    mockLocalStorageStore.getGameProgress.and.returnValue(gameProgress);

    const classList = component.getButtonClassList('1', 1);
    expect(classList).toBe('');
  });
});
