import React, { useState } from 'react';
import { ContentItem } from '../../types/content';
import { useProgress } from '../../contexts/ProgressContext';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

interface ContentCardProps {
  item: ContentItem;
  size?: 'sm' | 'md' | 'lg';
  aspectRatio?: 'poster' | 'backdrop';
  showProgress?: boolean;
  showTitle?: boolean;
  onSelect?: (item: ContentItem) => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  item,
  size = 'md',
  aspectRatio = 'poster',
  showProgress = false,
  showTitle = true,
  onSelect
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { getProgressPercentage } = useProgress();

  const sizeClasses = {
    sm: aspectRatio === 'poster' ? 'w-32' : 'w-48',
    md: aspectRatio === 'poster' ? 'w-40' : 'w-64',
    lg: aspectRatio === 'poster' ? 'w-48' : 'w-80'
  };

  const imageSize = size === 'lg' ? 'w500' : size === 'md' ? 'w342' : 'w185';
  const imagePath = aspectRatio === 'poster' ? item.poster_path : item.backdrop_path;
  const imageUrl = imagePath ? `${IMAGE_BASE_URL}${imageSize}${imagePath}` : null;
  
  const title = item.title || item.name || 'Unknown Title';
  const year = item.release_date ? new Date(item.release_date).getFullYear() : 
               item.first_air_date ? new Date(item.first_air_date).getFullYear() : null;

  const progressPercentage = showProgress ? getProgressPercentage(item.id.toString()) : 0;

  const handleClick = () => {
    if (onSelect) {
      onSelect(item);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        flex-shrink-0 
        cursor-pointer 
        group 
        transition-all 
        duration-300 
        hover:scale-105 
        focus-ring 
        rounded-card 
        overflow-hidden
        animate-fade-in
      `}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`View details for ${title}`}
    >
      <div className={`relative ${aspectRatio === 'poster' ? 'aspect-[2/3]' : 'aspect-video'} overflow-hidden rounded-card bg-surface-800`}>
        {!imageLoaded && (
          <div className="absolute inset-0 shimmer" />
        )}
        
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={title}
            className={`
              w-full h-full object-cover transition-all duration-300
              group-hover:scale-110
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}
            `}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-700 text-text-tertiary">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Content type indicator */}
        {item.type && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 text-xs font-medium bg-surface-900/80 text-text-primary rounded-full backdrop-blur-sm">
              {item.type === 'movie' ? '🎬' : '📺'}
            </span>
          </div>
        )}

        {/* Rating indicator */}
        {item.vote_average && item.vote_average > 0 && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 text-xs font-medium bg-surface-900/80 text-accent rounded-full backdrop-blur-sm">
              ⭐ {item.vote_average.toFixed(1)}
            </span>
          </div>
        )}

        {/* Progress bar */}
        {showProgress && progressPercentage > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-surface-900/60 backdrop-blur-sm">
            <div 
              className="h-full bg-accent transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Title and metadata */}
      {showTitle && (
        <div className="mt-3 space-y-1">
          <h3 className="font-medium text-text-primary line-clamp-2 group-hover:text-primary-400 transition-colors duration-200">
            {title}
          </h3>
          {year && (
            <p className="text-sm text-text-tertiary">
              {year}
            </p>
          )}
          {showProgress && progressPercentage > 0 && (
            <p className="text-xs text-accent font-medium">
              {progressPercentage.toFixed(0)}% watched
            </p>
          )}
        </div>
      )}
    </div>
  );
};