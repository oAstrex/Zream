import React from 'react';
import { IconButton } from '../ui/Button';

export type TabType = 'home' | 'movies' | 'shows';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onSettingsClick: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  onSettingsClick
}) => {
  const tabs = [
    { id: 'home' as const, label: 'Home', icon: '🏠' },
    { id: 'movies' as const, label: 'Movies', icon: '🎬' },
    { id: 'shows' as const, label: 'TV Shows', icon: '📺' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-surface-950/90 backdrop-blur-sm border-b border-surface-800">
      <div className="max-w-7xl mx-auto px-content">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Z</span>
              </div>
              <h1 className="text-xl font-bold text-text-primary">Zream</h1>
            </div>
          </div>

          {/* Main Navigation Tabs */}
          <div className="flex items-center space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-content text-sm font-medium transition-all duration-200 focus-ring
                  ${activeTab === tab.id 
                    ? 'bg-primary-600 text-white' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-800'
                  }
                `}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                <span className="text-base">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Settings Button */}
          <div className="flex items-center">
            <IconButton
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              label="Settings"
              onClick={onSettingsClick}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};