import { Category } from '../types/content';

export const MOVIE_CATEGORIES: Category[] = [
  {
    id: 'popular',
    name: 'Popular Movies',
    slug: 'popular',
    description: 'Movies that are trending and popular right now',
    endpoint: '/api/movies/popular'
  },
  {
    id: 'trending',
    name: 'Trending Now',
    slug: 'trending',
    description: 'Movies that are currently trending',
    endpoint: '/api/movies/trending' // TODO: Add trending endpoint
  },
  {
    id: 'top-rated',
    name: 'Top Rated',
    slug: 'top-rated',
    description: 'Highest rated movies of all time',
    endpoint: '/api/movies/top-rated' // TODO: Add top-rated endpoint
  },
  {
    id: 'now-playing',
    name: 'Now Playing',
    slug: 'now-playing',
    description: 'Movies currently in theaters',
    endpoint: '/api/movies/now-playing' // TODO: Add now-playing endpoint
  },
  {
    id: 'upcoming',
    name: 'Upcoming',
    slug: 'upcoming',
    description: 'Movies coming soon to theaters',
    endpoint: '/api/movies/upcoming' // TODO: Add upcoming endpoint
  },
  {
    id: 'recently-added',
    name: 'Recently Added',
    slug: 'recently-added',
    description: 'Latest movies added to the platform',
    endpoint: '/api/movies/discover?sort_by=release_date.desc'
  },
];

export const TV_CATEGORIES: Category[] = [
  {
    id: 'popular-tv',
    name: 'Popular TV Shows',
    slug: 'popular',
    description: 'TV shows that are trending and popular right now',
    endpoint: '/api/tv/popular'
  },
  {
    id: 'trending-tv',
    name: 'Trending Now',
    slug: 'trending',
    description: 'TV shows that are currently trending',
    endpoint: '/api/tv/trending' // TODO: Add trending endpoint
  },
  {
    id: 'top-rated-tv',
    name: 'Top Rated',
    slug: 'top-rated',
    description: 'Highest rated TV shows of all time',
    endpoint: '/api/tv/top-rated' // TODO: Add top-rated endpoint
  },
  {
    id: 'on-air',
    name: 'On The Air',
    slug: 'on-air',
    description: 'TV shows currently airing new episodes',
    endpoint: '/api/tv/on-air' // TODO: Add on-air endpoint
  },
  {
    id: 'airing-today',
    name: 'Airing Today',
    slug: 'airing-today',
    description: 'TV shows with episodes airing today',
    endpoint: '/api/tv/airing-today' // TODO: Add airing-today endpoint
  },
  {
    id: 'recently-added-tv',
    name: 'Recently Added',
    slug: 'recently-added',
    description: 'Latest TV shows added to the platform',
    endpoint: '/api/tv/discover?sort_by=first_air_date.desc' // TODO: Add TV discover endpoint
  },
];

export const DEFAULT_SHELF_ORDER = [
  'continue-watching',
  'popular',
  'trending',
  'top-rated',
  'recently-added',
  'on-air',
  'now-playing',
  'upcoming'
];

export const getCategoriesByType = (type: 'movie' | 'tv'): Category[] => {
  return type === 'movie' ? MOVIE_CATEGORIES : TV_CATEGORIES;
};

export const getCategoryById = (id: string, type?: 'movie' | 'tv'): Category | undefined => {
  const categories = type ? getCategoriesByType(type) : [...MOVIE_CATEGORIES, ...TV_CATEGORIES];
  return categories.find(c => c.id === id);
};

export const getCategoryBySlug = (slug: string, type?: 'movie' | 'tv'): Category | undefined => {
  const categories = type ? getCategoriesByType(type) : [...MOVIE_CATEGORIES, ...TV_CATEGORIES];
  return categories.find(c => c.slug === slug);
};