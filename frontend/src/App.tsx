import React, { useState, useEffect } from 'react';
import { PreferencesProvider } from './contexts/PreferencesContext';
import { ProgressProvider } from './contexts/ProgressContext';
import { Navigation, TabType } from './components/layout/Navigation';
import { SettingsModal } from './components/settings/SettingsModal';
import { HomePage } from './pages/HomePage';
import { MoviesPage } from './pages/MoviesPage';
import { TVShowsPage } from './pages/TVShowsPage';
import { initializeMockProgress } from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    // Initialize mock data for development
    initializeMockProgress();
  }, []);

  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'movies':
        return <MoviesPage />;
      case 'shows':
        return <TVShowsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <PreferencesProvider>
      <ProgressProvider>
        <div className="min-h-screen bg-surface-950">
          <Navigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onSettingsClick={() => setIsSettingsOpen(true)}
          />
          
          <main className="max-w-7xl mx-auto px-content py-section">
            {renderCurrentPage()}
          </main>

          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
        </div>
      </ProgressProvider>
    </PreferencesProvider>
  );
}