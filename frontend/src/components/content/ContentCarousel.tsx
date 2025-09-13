import React, { useRef, useState, useEffect } from 'react';
import { ContentItem } from '../../types/content';
import { ContentCard } from './ContentCard';
import { ContentCardSkeleton } from '../ui/Skeleton';
import { IconButton } from '../ui/Button';

interface ContentCarouselProps {
  title: string;
  items: ContentItem[];
  isLoading?: boolean;
  aspectRatio?: 'poster' | 'backdrop';
  showProgress?: boolean;
  onItemSelect?: (item: ContentItem) => void;
  onViewAll?: () => void;
  error?: string | null;
}

export const ContentCarousel: React.FC<ContentCarouselProps> = ({
  title,
  items,
  isLoading = false,
  aspectRatio = 'poster',
  showProgress = false,
  onItemSelect,
  onViewAll,
  error
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);

  const itemWidth = aspectRatio === 'poster' ? 160 : 256; // w-40 and w-64 in pixels
  const gap = 16; // space-x-4 in pixels

  const checkScrollButtons = () => {
    if (!scrollRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftButton(scrollLeft > 0);
    setShowRightButton(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScrollButtons();
  }, [items]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScrollButtons);
      return () => scrollElement.removeEventListener('scroll', checkScrollButtons);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;

    const scrollAmount = itemWidth * 4 + gap * 3; // Scroll 4 items at a time
    const newScrollLeft = direction === 'left' 
      ? scrollRef.current.scrollLeft - scrollAmount
      : scrollRef.current.scrollLeft + scrollAmount;

    scrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scroll('left');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scroll('right');
    }
  };

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
        <div className="p-8 text-center bg-surface-800 rounded-content">
          <p className="text-text-secondary">Failed to load content: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
        {onViewAll && !isLoading && items.length > 0 && (
          <button
            onClick={onViewAll}
            className="text-sm text-primary-400 hover:text-primary-300 transition-colors duration-200 focus-ring rounded px-2 py-1"
          >
            View All →
          </button>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        {/* Left scroll button */}
        {showLeftButton && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <IconButton
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              }
              label="Scroll left"
              onClick={() => scroll('left')}
              className="bg-surface-900/90 backdrop-blur-sm hover:bg-surface-800/90 shadow-lg"
            />
          </div>
        )}

        {/* Right scroll button */}
        {showRightButton && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <IconButton
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              }
              label="Scroll right"
              onClick={() => scroll('right')}
              className="bg-surface-900/90 backdrop-blur-sm hover:bg-surface-800/90 shadow-lg"
            />
          </div>
        )}

        {/* Carousel Content */}
        <div
          ref={scrollRef}
          className="flex space-x-4 overflow-x-auto carousel-container focus-ring rounded-content"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          role="region"
          aria-label={`${title} carousel`}
        >
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 8 }).map((_, index) => (
              <div 
                key={`skeleton-${index}`} 
                className={aspectRatio === 'poster' ? 'w-40' : 'w-64'}
              >
                <ContentCardSkeleton aspectRatio={aspectRatio} />
              </div>
            ))
          ) : items.length > 0 ? (
            // Content items
            items.map((item) => (
              <ContentCard
                key={`${item.type}-${item.id}`}
                item={item}
                aspectRatio={aspectRatio}
                showProgress={showProgress}
                onSelect={onItemSelect}
              />
            ))
          ) : (
            // Empty state
            <div className="w-full p-8 text-center text-text-secondary">
              <p>No content available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};