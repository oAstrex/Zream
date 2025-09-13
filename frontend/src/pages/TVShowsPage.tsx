import React, { useState, useEffect } from 'react';
import { MediaItem } from '../api';
import { getPopularTVShows } from '../api';
import { ContentCarousel } from '../components/content/ContentCarousel';
import { ContinueWatchingShelf } from '../components/content/ContinueWatchingShelf';
import { useProgress } from '../contexts/ProgressContext';
import { TV_CATEGORIES } from '../data/categories';
import { WatchProgress } from '../types/content';

export const TVShowsPage: React.FC = () => {
  const [tvShelves, setTvShelves] = useState<Record<string, MediaItem[]>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const { getContinueWatching, removeProgress, clearAllProgress } = useProgress();

  useEffect(() => {
    const loadTVCategories = async () => {
      try {
        setError(null);
        
        // Load each category
        for (const category of TV_CATEGORIES) {
          setLoadingStates(prev => ({ ...prev, [category.id]: true }));
          
          try {
            let data;
            if (category.id === 'popular-tv') {
              data = await getPopularTVShows(1);
            } else {
              // For other categories, use popular for now as placeholder
              // TODO: Implement actual endpoints for TV shows
              data = await getPopularTVShows(1);
            }
            
            setTvShelves(prev => ({
              ...prev,
              [category.id]: data.results.map(item => ({ ...item, type: 'show' as const }))
            }));
          } catch (err) {
            console.warn(`Failed to load ${category.name}:`, err);
          }
          
          setLoadingStates(prev => ({ ...prev, [category.id]: false }));
        }
      } catch (err: any) {
        setError(err.message);
      }
    };

    loadTVCategories();
  }, []);

  const continueWatchingItems = getContinueWatching().filter(item => item.type === 'show');

  const handleItemSelect = (item: MediaItem) => {
    console.log('Selected TV show:', item);
    // TODO: Navigate to TV show detail page
  };

  const handleResumeWatching = (progress: WatchProgress) => {
    console.log('Resume watching TV show:', progress);
    // TODO: Start playback from saved position
  };

  const handleRemoveFromContinueWatching = (progress: WatchProgress) => {
    removeProgress(progress.contentId, progress.episodeId);
  };

  const handleClearAllProgress = () => {
    if (confirm('Are you sure you want to clear all TV show watch progress?')) {
      clearAllProgress();
    }
  };

  return (
    <div className="space-y-section">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-content">
          <p>Error loading TV shows: {error}</p>
        </div>
      )}

      {/* Continue Watching TV Shows */}
      {continueWatchingItems.length > 0 && (
        <ContinueWatchingShelf
          items={continueWatchingItems}
          onResumeItem={handleResumeWatching}
          onRemoveItem={handleRemoveFromContinueWatching}
          onClearAll={handleClearAllProgress}
        />
      )}

      {/* TV Show Categories */}
      {TV_CATEGORIES.map((category) => (
        <ContentCarousel
          key={category.id}
          title={category.name}
          items={tvShelves[category.id] || []}
          isLoading={loadingStates[category.id] || false}
          aspectRatio="poster"
          onItemSelect={handleItemSelect}
        />
      ))}
    </div>
  );
};