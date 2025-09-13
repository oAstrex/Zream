import { UserPreferences, ThemeMode, LayoutDensity } from '../types/content';
import { DEFAULT_SHELF_ORDER } from '../data/categories';

const STORAGE_KEY = 'zream_user_preferences';

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'auto',
  layout: 'comfortable',
  shelfOrder: DEFAULT_SHELF_ORDER,
  hiddenShelves: [],
  landingTab: 'home',
  autoplayPreview: false
};

export class PreferencesService {
  private preferences: UserPreferences;

  constructor() {
    this.preferences = this.loadFromStorage();
  }

  private loadFromStorage(): UserPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_PREFERENCES, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load preferences from storage:', error);
    }
    return { ...DEFAULT_PREFERENCES };
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.preferences));
    } catch (error) {
      console.warn('Failed to save preferences to storage:', error);
    }
  }

  public getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  public updatePreferences(updates: Partial<UserPreferences>): void {
    this.preferences = { ...this.preferences, ...updates };
    this.saveToStorage();
  }

  public setTheme(theme: ThemeMode): void {
    this.updatePreferences({ theme });
  }

  public setLayout(layout: LayoutDensity): void {
    this.updatePreferences({ layout });
  }

  public setLandingTab(landingTab: 'home' | 'movies' | 'shows'): void {
    this.updatePreferences({ landingTab });
  }

  public setAutoplayPreview(autoplayPreview: boolean): void {
    this.updatePreferences({ autoplayPreview });
  }

  public updateShelfOrder(shelfOrder: string[]): void {
    this.updatePreferences({ shelfOrder });
  }

  public toggleShelfVisibility(shelfId: string): void {
    const { hiddenShelves } = this.preferences;
    const isHidden = hiddenShelves.includes(shelfId);
    
    if (isHidden) {
      this.updatePreferences({
        hiddenShelves: hiddenShelves.filter(id => id !== shelfId)
      });
    } else {
      this.updatePreferences({
        hiddenShelves: [...hiddenShelves, shelfId]
      });
    }
  }

  public isShelfHidden(shelfId: string): boolean {
    return this.preferences.hiddenShelves.includes(shelfId);
  }

  public resetToDefaults(): void {
    this.preferences = { ...DEFAULT_PREFERENCES };
    this.saveToStorage();
  }

  public getVisibleShelves(): string[] {
    return this.preferences.shelfOrder.filter(
      shelfId => !this.preferences.hiddenShelves.includes(shelfId)
    );
  }

  public getEffectiveTheme(): 'light' | 'dark' | 'high-contrast' {
    if (this.preferences.theme === 'auto') {
      // Check system preference
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'dark'; // Default fallback
    }
    return this.preferences.theme;
  }

  public applyTheme(): void {
    const theme = this.getEffectiveTheme();
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('theme-light', 'theme-dark', 'theme-high-contrast');
    
    // Add current theme class
    root.classList.add(`theme-${theme}`);
    
    // Update data attribute for CSS variables
    root.setAttribute('data-theme', theme);
  }

  public applyLayout(): void {
    const root = document.documentElement;
    root.setAttribute('data-layout', this.preferences.layout);
  }
}

export const preferencesService = new PreferencesService();