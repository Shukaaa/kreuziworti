import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { LocalStorageStore } from '../../stores/local-storage.store';
import { RouterTestingModule } from '@angular/router/testing';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let mockLocalStorageStore: jasmine.SpyObj<LocalStorageStore>;

  beforeEach(waitForAsync(() => {
    mockLocalStorageStore = jasmine.createSpyObj('LocalStorageStore', ['setGameProgress']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, SettingsComponent], // Import SettingsComponent since it's standalone
      providers: [
        { provide: LocalStorageStore, useValue: mockLocalStorageStore }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset game data when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    component.resetGameData();

    expect(window.confirm).toHaveBeenCalledWith('Du bist dabei, alle deine Spielstände zu löschen. Also wirklich ALLE. ALLE ALLE ALLE. Bist du sicher?');
    expect(mockLocalStorageStore.setGameProgress).toHaveBeenCalledWith({ categoryProgress: [] });
  });

  it('should not reset game data when not confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.resetGameData();

    expect(window.confirm).toHaveBeenCalledWith('Du bist dabei, alle deine Spielstände zu löschen. Also wirklich ALLE. ALLE ALLE ALLE. Bist du sicher?');
    expect(mockLocalStorageStore.setGameProgress).not.toHaveBeenCalled();
  });
});
