import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { ThemesComponent } from './themes.component';
import { LocalStorageStore } from '../../stores/local-storage.store';
import { RouterTestingModule } from '@angular/router/testing';

describe('ThemesComponent', () => {
  let component: ThemesComponent;
  let fixture: ComponentFixture<ThemesComponent>;
  let mockLocalStorageStore: jasmine.SpyObj<LocalStorageStore>;

  beforeEach(waitForAsync(() => {
    mockLocalStorageStore = jasmine.createSpyObj('LocalStorageStore', ['setTheme', 'getTheme']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, ThemesComponent],
      providers: [
        { provide: LocalStorageStore, useValue: mockLocalStorageStore }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThemesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the theme and update the body class when selectTheme is called', () => {
    const theme = 'retro';
    component.selectTheme(theme);

    expect(mockLocalStorageStore.setTheme).toHaveBeenCalledWith(theme);
    expect(document.getElementsByTagName('body')[0].className).toBe(theme);
  });

  it('should return the current theme from local storage if set', () => {
    const theme = 'hacker';
    mockLocalStorageStore.getTheme.and.returnValue(theme);

    const currentTheme = component.getCurrentTheme();

    expect(currentTheme).toBe(theme);
    expect(mockLocalStorageStore.getTheme).toHaveBeenCalled();
  });

  it('should return "old-os" if no theme is set in local storage', () => {
    mockLocalStorageStore.getTheme.and.returnValue(null);

    const currentTheme = component.getCurrentTheme();

    expect(currentTheme).toBe('old-os');
    expect(mockLocalStorageStore.getTheme).toHaveBeenCalled();
  });
});
