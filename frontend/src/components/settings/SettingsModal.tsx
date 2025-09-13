import React from 'react';
import { ThemeMode, LayoutDensity } from '../../types/content';
import { usePreferences } from '../../contexts/PreferencesContext';
import { Button } from '../ui/Button';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    preferences,
    setTheme,
    setLayout,
    setLandingTab,
    setAutoplayPreview,
    resetToDefaults
  } = usePreferences();

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-surface-950/80 backdrop-blur-sm transition-opacity" />

        {/* Modal panel */}
        <div className="relative bg-surface-800 rounded-content shadow-xl transform transition-all w-full max-w-lg mx-auto animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-surface-700">
            <h2 className="text-lg font-semibold text-text-primary">Settings</h2>
            <button
              onClick={onClose}
              className="text-text-tertiary hover:text-text-primary transition-colors duration-200 focus-ring rounded p-1"
              aria-label="Close settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Theme Selection */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['auto', 'light', 'dark', 'high-contrast'] as ThemeMode[]).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setTheme(theme)}
                    className={`
                      px-4 py-2 rounded-content text-sm font-medium transition-all duration-200 focus-ring
                      ${preferences.theme === theme
                        ? 'bg-primary-600 text-white'
                        : 'bg-surface-700 text-text-secondary hover:bg-surface-600 hover:text-text-primary'
                      }
                    `}
                  >
                    {theme === 'auto' && '🔄 Auto'}
                    {theme === 'light' && '☀️ Light'}
                    {theme === 'dark' && '🌙 Dark'}
                    {theme === 'high-contrast' && '⚡ High Contrast'}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Density */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                Layout Density
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['comfortable', 'compact'] as LayoutDensity[]).map((layout) => (
                  <button
                    key={layout}
                    onClick={() => setLayout(layout)}
                    className={`
                      px-4 py-2 rounded-content text-sm font-medium transition-all duration-200 focus-ring
                      ${preferences.layout === layout
                        ? 'bg-primary-600 text-white'
                        : 'bg-surface-700 text-text-secondary hover:bg-surface-600 hover:text-text-primary'
                      }
                    `}
                  >
                    {layout === 'comfortable' ? '📏 Comfortable' : '📐 Compact'}
                  </button>
                ))}
              </div>
            </div>

            {/* Landing Tab */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                Default Landing Page
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['home', 'movies', 'shows'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setLandingTab(tab)}
                    className={`
                      px-4 py-2 rounded-content text-sm font-medium transition-all duration-200 focus-ring
                      ${preferences.landingTab === tab
                        ? 'bg-primary-600 text-white'
                        : 'bg-surface-700 text-text-secondary hover:bg-surface-600 hover:text-text-primary'
                      }
                    `}
                  >
                    {tab === 'home' && '🏠 Home'}
                    {tab === 'movies' && '🎬 Movies'}
                    {tab === 'shows' && '📺 Shows'}
                  </button>
                ))}
              </div>
            </div>

            {/* Autoplay Preview Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-text-primary">
                  Autoplay Previews
                </label>
                <p className="text-xs text-text-tertiary mt-1">
                  Automatically play video previews when hovering over content
                </p>
              </div>
              <button
                onClick={() => setAutoplayPreview(!preferences.autoplayPreview)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus-ring
                  ${preferences.autoplayPreview ? 'bg-primary-600' : 'bg-surface-600'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                    ${preferences.autoplayPreview ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-6 border-t border-surface-700">
            <Button
              variant="ghost"
              onClick={resetToDefaults}
              size="sm"
            >
              Reset to Defaults
            </Button>
            <Button onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};