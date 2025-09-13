import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserPreferences, ThemeMode, LayoutDensity } from '../types/content';
import { preferencesService } from '../services/preferences';

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  setTheme: (theme: ThemeMode) => void;
  setLayout: (layout: LayoutDensity) => void;
  setLandingTab: (tab: 'home' | 'movies' | 'shows') => void;
  setAutoplayPreview: (enabled: boolean) => void;
  toggleShelfVisibility: (shelfId: string) => void;
  updateShelfOrder: (order: string[]) => void;
  isShelfHidden: (shelfId: string) => boolean;
  getVisibleShelves: () => string[];
  resetToDefaults: () => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

interface PreferencesProviderProps {
  children: ReactNode;
}

export const PreferencesProvider: React.FC<PreferencesProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(preferencesService.getPreferences());

  useEffect(() => {
    // Apply theme and layout on mount and when preferences change
    preferencesService.applyTheme();
    preferencesService.applyLayout();
  }, [preferences.theme, preferences.layout]);

  useEffect(() => {
    // Listen for system theme changes when using auto theme
    if (preferences.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        preferencesService.applyTheme();
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [preferences.theme]);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    preferencesService.updatePreferences(updates);
    setPreferences(preferencesService.getPreferences());
  };

  const setTheme = (theme: ThemeMode) => {
    preferencesService.setTheme(theme);
    setPreferences(preferencesService.getPreferences());
  };

  const setLayout = (layout: LayoutDensity) => {
    preferencesService.setLayout(layout);
    setPreferences(preferencesService.getPreferences());
  };

  const setLandingTab = (tab: 'home' | 'movies' | 'shows') => {
    preferencesService.setLandingTab(tab);
    setPreferences(preferencesService.getPreferences());
  };

  const setAutoplayPreview = (enabled: boolean) => {
    preferencesService.setAutoplayPreview(enabled);
    setPreferences(preferencesService.getPreferences());
  };

  const toggleShelfVisibility = (shelfId: string) => {
    preferencesService.toggleShelfVisibility(shelfId);
    setPreferences(preferencesService.getPreferences());
  };

  const updateShelfOrder = (order: string[]) => {
    preferencesService.updateShelfOrder(order);
    setPreferences(preferencesService.getPreferences());
  };

  const isShelfHidden = (shelfId: string) => {
    return preferencesService.isShelfHidden(shelfId);
  };

  const getVisibleShelves = () => {
    return preferencesService.getVisibleShelves();
  };

  const resetToDefaults = () => {
    preferencesService.resetToDefaults();
    setPreferences(preferencesService.getPreferences());
  };

  const value: PreferencesContextType = {
    preferences,
    updatePreferences,
    setTheme,
    setLayout,
    setLandingTab,
    setAutoplayPreview,
    toggleShelfVisibility,
    updateShelfOrder,
    isShelfHidden,
    getVisibleShelves,
    resetToDefaults
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = (): PreferencesContextType => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};