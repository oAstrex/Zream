import { Genre } from '../types/content';

export const GENRES: Genre[] = [
  { id: '28', name: 'Action', slug: 'action', icon: '⚡' },
  { id: '12', name: 'Adventure', slug: 'adventure', icon: '🗺️' },
  { id: '16', name: 'Animation', slug: 'animation', icon: '🎨' },
  { id: '35', name: 'Comedy', slug: 'comedy', icon: '😄' },
  { id: '80', name: 'Crime', slug: 'crime', icon: '🔍' },
  { id: '99', name: 'Documentary', slug: 'documentary', icon: '📚' },
  { id: '18', name: 'Drama', slug: 'drama', icon: '🎭' },
  { id: '10751', name: 'Family', slug: 'family', icon: '👨‍👩‍👧‍👦' },
  { id: '14', name: 'Fantasy', slug: 'fantasy', icon: '🧙‍♂️' },
  { id: '36', name: 'History', slug: 'history', icon: '🏛️' },
  { id: '27', name: 'Horror', slug: 'horror', icon: '👻' },
  { id: '10402', name: 'Music', slug: 'music', icon: '🎵' },
  { id: '9648', name: 'Mystery', slug: 'mystery', icon: '🔮' },
  { id: '10749', name: 'Romance', slug: 'romance', icon: '💕' },
  { id: '878', name: 'Science Fiction', slug: 'sci-fi', icon: '🚀' },
  { id: '10770', name: 'TV Movie', slug: 'tv-movie', icon: '📺' },
  { id: '53', name: 'Thriller', slug: 'thriller', icon: '😰' },
  { id: '10752', name: 'War', slug: 'war', icon: '⚔️' },
  { id: '37', name: 'Western', slug: 'western', icon: '🤠' },
];

// TV Show specific genres
export const TV_GENRES: Genre[] = [
  { id: '10759', name: 'Action & Adventure', slug: 'action-adventure', icon: '⚡' },
  { id: '16', name: 'Animation', slug: 'animation', icon: '🎨' },
  { id: '35', name: 'Comedy', slug: 'comedy', icon: '😄' },
  { id: '80', name: 'Crime', slug: 'crime', icon: '🔍' },
  { id: '99', name: 'Documentary', slug: 'documentary', icon: '📚' },
  { id: '18', name: 'Drama', slug: 'drama', icon: '🎭' },
  { id: '10751', name: 'Family', slug: 'family', icon: '👨‍👩‍👧‍👦' },
  { id: '10762', name: 'Kids', slug: 'kids', icon: '🧸' },
  { id: '9648', name: 'Mystery', slug: 'mystery', icon: '🔮' },
  { id: '10763', name: 'News', slug: 'news', icon: '📰' },
  { id: '10764', name: 'Reality', slug: 'reality', icon: '📹' },
  { id: '10765', name: 'Sci-Fi & Fantasy', slug: 'sci-fi-fantasy', icon: '🚀' },
  { id: '10766', name: 'Soap', slug: 'soap', icon: '💭' },
  { id: '10767', name: 'Talk', slug: 'talk', icon: '💬' },
  { id: '10768', name: 'War & Politics', slug: 'war-politics', icon: '🏛️' },
  { id: '37', name: 'Western', slug: 'western', icon: '🤠' },
];

export const getAllGenres = (): Genre[] => {
  const movieGenres = GENRES.map(g => ({ ...g, type: 'movie' as const }));
  const tvGenres = TV_GENRES.map(g => ({ ...g, type: 'tv' as const }));
  
  // Merge and deduplicate by name
  const combined = [...movieGenres, ...tvGenres];
  const unique = combined.reduce((acc, genre) => {
    if (!acc.find(g => g.name === genre.name)) {
      acc.push(genre);
    }
    return acc;
  }, [] as Genre[]);
  
  return unique.sort((a, b) => a.name.localeCompare(b.name));
};

export const getGenreById = (id: string): Genre | undefined => {
  return [...GENRES, ...TV_GENRES].find(g => g.id === id);
};

export const getGenreBySlug = (slug: string): Genre | undefined => {
  return [...GENRES, ...TV_GENRES].find(g => g.slug === slug);
};