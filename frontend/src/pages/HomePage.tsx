import React, { useState, useEffect } from 'react';
import { MediaItem } from '../api';
import { getPopularMovies, getPopularTVShows } from '../api';
import { ContentCarousel } from '../components/content/ContentCarousel';
import { ContinueWatchingShelf } from '../components/content/ContinueWatchingShelf';
import { useProgress } from '../contexts/ProgressContext';
import { WatchProgress } from '../types/content';

export const HomePage: React.FC = () => {
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([]);
  const [popularTVShows, setPopularTVShows] = useState<MediaItem[]>([]);
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [isLoadingTVShows, setIsLoadingTVShows] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getContinueWatching, removeProgress, clearAllProgress } = useProgress();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load popular movies
        setIsLoadingMovies(true);
        const moviesData = await getPopularMovies(1);
        setPopularMovies(moviesData.results.map(item => ({ ...item, type: 'movie' as const })));
        setIsLoadingMovies(false);

        // Load popular TV shows
        setIsLoadingTVShows(true);
        const tvData = await getPopularTVShows(1);
        setPopularTVShows(tvData.results.map(item => ({ ...item, type: 'show' as const })));
        setIsLoadingTVShows(false);
      } catch (err: any) {
        setError(err.message);
        setIsLoadingMovies(false);
        setIsLoadingTVShows(false);
      }
    };

    loadData();
  }, []);

  const continueWatchingItems = getContinueWatching();

  const handleItemSelect = (item: MediaItem) => {
    console.log('Selected item:', item);
    // TODO: Navigate to item detail page
  };

  const handleResumeWatching = (progress: WatchProgress) => {
    console.log('Resume watching:', progress);
    // TODO: Start playback from saved position
  };

  const handleRemoveFromContinueWatching = (progress: WatchProgress) => {
    removeProgress(progress.contentId, progress.episodeId);
  };

  const handleClearAllProgress = () => {
    if (confirm('Are you sure you want to clear all watch progress?')) {
      clearAllProgress();
    }
  };

  return (
    <div className="space-y-section">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-content">
          <p>Error loading content: {error}</p>
        </div>
      )}

      {/* Continue Watching */}
      <ContinueWatchingShelf
        items={continueWatchingItems}
        onResumeItem={handleResumeWatching}
        onRemoveItem={handleRemoveFromContinueWatching}
        onClearAll={handleClearAllProgress}
      />

      {/* Popular Movies */}
      <ContentCarousel
        title="Popular Movies"
        items={popularMovies}
        isLoading={isLoadingMovies}
        aspectRatio="poster"
        onItemSelect={handleItemSelect}
      />

      {/* Popular TV Shows */}
      <ContentCarousel
        title="Popular TV Shows"
        items={popularTVShows}
        isLoading={isLoadingTVShows}
        aspectRatio="poster"
        onItemSelect={handleItemSelect}
      />
    </div>
  );
};