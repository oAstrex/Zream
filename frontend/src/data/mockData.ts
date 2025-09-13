import { WatchProgress } from '../types/content';

// Mock progress data for development/testing
export const MOCK_PROGRESS: WatchProgress[] = [
  {
    contentId: '550', // Fight Club
    position: 3420, // 57 minutes
    duration: 8280, // 2h 18m
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    type: 'movie',
  },
  {
    contentId: '1399', // Game of Thrones
    position: 1800, // 30 minutes
    duration: 3600, // 1 hour
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    type: 'show',
    episodeId: 's1e1',
    seasonNumber: 1,
    episodeNumber: 1,
  },
  {
    contentId: '680', // Pulp Fiction
    position: 4500, // 75 minutes
    duration: 9240, // 2h 34m
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    type: 'movie',
  },
];

// Initialize mock data if none exists
export const initializeMockProgress = () => {
  const existing = localStorage.getItem('zream_watch_progress');
  if (!existing) {
    localStorage.setItem('zream_watch_progress', JSON.stringify(MOCK_PROGRESS));
  }
};