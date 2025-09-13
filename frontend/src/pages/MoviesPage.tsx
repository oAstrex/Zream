import React, { useState, useEffect } from 'react';
import { MediaItem } from '../api';
import { getPopularMovies, discoverMovies } from '../api';
import { ContentCarousel } from '../components/content/ContentCarousel';
import { ContinueWatchingShelf } from '../components/content/ContinueWatchingShelf';
import { useProgress } from '../contexts/ProgressContext';
import { MOVIE_CATEGORIES } from '../data/categories';
import { WatchProgress } from '../types/content';

export const MoviesPage: React.FC = () => {
  const [movieShelves, setMovieShelves] = useState<Record<string, MediaItem[]>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const { getContinueWatching, removeProgress, clearAllProgress } = useProgress();

  useEffect(() => {
    const loadMovieCategories = async () => {
      try {
        setError(null);
        
        // Load each category
        for (const category of MOVIE_CATEGORIES) {
          setLoadingStates(prev => ({ ...prev, [category.id]: true }));
          
          try {
            let data;
            if (category.id === 'popular') {
              data = await getPopularMovies(1);
            } else if (category.id === 'recently-added') {
              data = await discoverMovies({ sort_by: 'release_date.desc', page: 1 });
            } else {
              // For other categories, use popular for now as placeholder
              // TODO: Implement actual endpoints
              data = await getPopularMovies(1);
            }
            
            setMovieShelves(prev => ({
              ...prev,
              [category.id]: data.results.map(item => ({ ...item, type: 'movie' as const }))
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

    loadMovieCategories();
  }, []);

  const continueWatchingItems = getContinueWatching().filter(item => item.type === 'movie');

  const handleItemSelect = (item: MediaItem) => {
    console.log('Selected movie:', item);
    // TODO: Navigate to movie detail page
  };

  const handleResumeWatching = (progress: WatchProgress) => {
    console.log('Resume watching movie:', progress);
    // TODO: Start playback from saved position
  };

  const handleRemoveFromContinueWatching = (progress: WatchProgress) => {
    removeProgress(progress.contentId, progress.episodeId);
  };

  const handleClearAllProgress = () => {
    if (confirm('Are you sure you want to clear all movie watch progress?')) {
      clearAllProgress();
    }
  };

  return (
    <div className="space-y-section">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-content">
          <p>Error loading movies: {error}</p>
        </div>
      )}

      {/* Continue Watching Movies */}
      {continueWatchingItems.length > 0 && (
        <ContinueWatchingShelf
          items={continueWatchingItems}
          onResumeItem={handleResumeWatching}
          onRemoveItem={handleRemoveFromContinueWatching}
          onClearAll={handleClearAllProgress}
        />
      )}

      {/* Movie Categories */}
      {MOVIE_CATEGORIES.map((category) => (
        <ContentCarousel
          key={category.id}
          title={category.name}
          items={movieShelves[category.id] || []}
          isLoading={loadingStates[category.id] || false}
          aspectRatio="poster"
          onItemSelect={handleItemSelect}
        />
      ))}
    </div>
  );
};