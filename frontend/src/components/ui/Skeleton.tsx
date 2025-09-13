import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width = 'w-full', 
  height = 'h-4', 
  rounded = false 
}) => {
  return (
    <div 
      className={`
        shimmer 
        ${width} 
        ${height} 
        ${rounded ? 'rounded-full' : 'rounded-content'}
        ${className}
      `}
    />
  );
};

interface ContentCardSkeletonProps {
  aspectRatio?: 'poster' | 'backdrop';
  showText?: boolean;
}

export const ContentCardSkeleton: React.FC<ContentCardSkeletonProps> = ({ 
  aspectRatio = 'poster',
  showText = true 
}) => {
  const imageClass = aspectRatio === 'poster' ? 'aspect-[2/3]' : 'aspect-video';
  
  return (
    <div className="animate-fade-in">
      <Skeleton className={`${imageClass} mb-3`} />
      {showText && (
        <div className="space-y-2">
          <Skeleton height="h-4" width="w-3/4" />
          <Skeleton height="h-3" width="w-1/2" />
        </div>
      )}
    </div>
  );
};

interface CarouselSkeletonProps {
  itemCount?: number;
  aspectRatio?: 'poster' | 'backdrop';
}

export const CarouselSkeleton: React.FC<CarouselSkeletonProps> = ({ 
  itemCount = 8,
  aspectRatio = 'poster'
}) => {
  const itemWidth = aspectRatio === 'poster' ? 'w-40' : 'w-64';
  
  return (
    <div className="space-y-4">
      <Skeleton height="h-6" width="w-48" />
      <div className="flex space-x-4 overflow-hidden">
        {Array.from({ length: itemCount }).map((_, index) => (
          <div key={index} className={`${itemWidth} flex-shrink-0`}>
            <ContentCardSkeleton aspectRatio={aspectRatio} />
          </div>
        ))}
      </div>
    </div>
  );
};