// Interfaces for our expected data structures
export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date?: string;
  first_air_date?: string;
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface JackettResult {
  Title: string;
  MagnetUri?: string;
  Seeders?: number;
  Size?: number;
  Tracker?: string;
  _score?: number;
  torboxCached?: boolean; // NEW
}

export interface JackettSearchResponse {
  query: string;
  count: number;
  results: JackettResult[];
}

export interface TorrentStatus {
  localId: string;
  magnet: string;
  hash: string | null;
  torboxId?: number;
  status: 'initializing' | 'downloading' | 'completed' | 'error' | string;
  lastSnapshot?: any;
  created: number;
}

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, options);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'API request failed' }));
    throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export const getPopularMovies = (page = 1) =>
  api<PaginatedResponse<MediaItem>>(`/api/movies/popular?page=${page}`);

export const searchSources = (title: string, year?: number) =>
  api<JackettSearchResponse>('/api/sources/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, year }),
  });

export const addTorrent = (magnet: string, name?: string) =>
  api<{ localId: string }>('/api/torbox/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ magnet, name }),
  });

export const getTorrentStatus = (localId: string) =>
  api<TorrentStatus>(`/api/torbox/status/${localId}`);

export function createTorrentStatusStream(
  localId: string,
  onUpdate: (status: TorrentStatus) => void,
  onDone: () => void,
  onError: (e: Event) => void
): () => void {
  const es = new EventSource(`/api/torbox/stream/${localId}`);
  es.addEventListener('update', (event) => {
    try {
      const status = JSON.parse((event as MessageEvent).data);
      onUpdate(status);
    } catch (e) {
      console.error('Failed to parse SSE update', e);
    }
  });
  es.addEventListener('done', () => {
    onDone();
    es.close();
  });
  es.onerror = (e) => {
    onError(e);
    es.close();
  };
  return () => es.close();
}
