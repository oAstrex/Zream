import React from 'react';
import { WatchProgress } from '../../types/content';
import { Button } from '../ui/Button';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

interface ContinueWatchingItemProps {
  progress: WatchProgress;
  onResume: (progress: WatchProgress) => void;
  onRemove: (progress: WatchProgress) => void;
}

const ContinueWatchingItem: React.FC<ContinueWatchingItemProps> = ({
  progress,
  onResume,
  onRemove
}) => {
  const progressPercentage = (progress.position / progress.duration) * 100;
  const remainingTime = progress.duration - progress.position;
  const timeRemaining = formatTime(remainingTime);

  return (
    <div className="relative group bg-surface-800 rounded-content overflow-hidden hover:bg-surface-700 transition-all duration-300">
      <div className="flex">
        {/* Thumbnail */}
        <div className="relative w-32 h-20 bg-surface-700 flex-shrink-0">
          {/* TODO: Add actual thumbnail once we have backdrop images */}
          <div className="w-full h-full flex items-center justify-center text-text-tertiary">
            <span className="text-2xl">
              {progress.type === 'movie' ? '🎬' : '📺'}
            </span>
          </div>
          
          {/* Progress overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-900/60">
            <div 
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-text-primary truncate">
                Content #{progress.contentId}
                {progress.episodeId && ` - Episode ${progress.episodeId}`}
              </h4>
              <p className="text-sm text-text-tertiary mt-1">
                {Math.round(progressPercentage)}% watched • {timeRemaining} remaining
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                size="sm"
                onClick={() => onResume(progress)}
                className="whitespace-nowrap"
              >
                Resume
              </Button>
              <button
                onClick={() => onRemove(progress)}
                className="text-text-tertiary hover:text-red-400 transition-colors duration-200 p-1 rounded focus-ring"
                aria-label="Remove from continue watching"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ContinueWatchingShelfProps {
  items: WatchProgress[];
  onResumeItem: (progress: WatchProgress) => void;
  onRemoveItem: (progress: WatchProgress) => void;
  onClearAll: () => void;
}

export const ContinueWatchingShelf: React.FC<ContinueWatchingShelfProps> = ({
  items,
  onResumeItem,
  onRemoveItem,
  onClearAll
}) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">Continue Watching</h2>
        <button
          onClick={onClearAll}
          className="text-sm text-text-tertiary hover:text-red-400 transition-colors duration-200 focus-ring rounded px-2 py-1"
        >
          Clear All
        </button>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((progress) => (
          <ContinueWatchingItem
            key={`${progress.contentId}_${progress.episodeId || ''}`}
            progress={progress}
            onResume={onResumeItem}
            onRemove={onRemoveItem}
          />
        ))}
      </div>
    </div>
  );
};

// Helper function to format time
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}