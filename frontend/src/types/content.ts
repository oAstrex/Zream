// Core content type definitions
export type ContentType = 'movie' | 'show';

export interface Genre {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  endpoint: string; // API endpoint for this category
}

export interface ContentItem {
  id: number;
  type: ContentType;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  vote_average?: number;
  
  // TV Show specific fields
  seasons?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  
  // Progress tracking
  progress?: WatchProgress;
}

export interface WatchProgress {
  contentId: string;
  position: number; // seconds
  duration: number; // seconds
  updatedAt: string;
  type: ContentType;
  episodeId?: string; // for TV shows
  seasonNumber?: number;
  episodeNumber?: number;
}

export interface Episode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path?: string;
  air_date?: string;
  runtime?: number;
  progress?: WatchProgress;
}

export interface Season {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  poster_path?: string;
  air_date?: string;
  episode_count: number;
  episodes?: Episode[];
}

export interface TVShowDetails extends ContentItem {
  type: 'show';
  seasons: Season[];
  created_by?: Array<{ id: number; name: string }>;
  networks?: Array<{ id: number; name: string; logo_path?: string }>;
  status: string;
  in_production: boolean;
}

// User preferences
export type ThemeMode = 'auto' | 'light' | 'dark' | 'high-contrast';
export type LayoutDensity = 'comfortable' | 'compact';

export interface UserPreferences {
  theme: ThemeMode;
  layout: LayoutDensity;
  shelfOrder: string[];
  hiddenShelves: string[];
  landingTab: 'home' | 'movies' | 'shows';
  autoplayPreview: boolean;
}

// Sorting and filtering
export type SortOption = 'title' | 'release_date' | 'vote_average' | 'popularity';
export type SortDirection = 'asc' | 'desc';

export interface FilterOptions {
  genres?: string[];
  sort?: SortOption;
  direction?: SortDirection;
  year?: number;
  rating?: number;
}