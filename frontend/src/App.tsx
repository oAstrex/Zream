import { useEffect, useState } from 'react';
import { getPopularMovies, searchSources, addTorrent, createTorrentStatusStream } from './api';
import type { MediaItem, JackettResult, TorrentStatus } from './api';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

function MediaCarousel({ title, items, onSelect }: { title: string, items: MediaItem[], onSelect: (item: MediaItem) => void }) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-100">{title}</h2>
      <div className="flex overflow-x-auto space-x-4 pb-4">
        {items.map((item) => (
          <div key={item.id} className="flex-shrink-0 w-40 cursor-pointer group" onClick={() => onSelect(item)}>
            <img
              src={`${IMAGE_BASE_URL}w342${item.poster_path}`}
              alt={item.title || item.name}
              className="rounded-lg shadow-lg group-hover:opacity-75 transition-opacity"
            />
            <p className="text-sm mt-2 text-gray-300 truncate">{item.title || item.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SourceResults({ sources, onAdd }: { sources: JackettResult[], onAdd: (source: JackettResult) => void }) {
  const formatSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <div className="mt-6 bg-gray-800 p-4 rounded-lg">
      <h3 className="text-xl font-semibold mb-3">Available Sources</h3>
      <ul className="space-y-2">
        {sources.slice(0, 20).map((source, index) => (
          <li key={index} className="p-3 bg-gray-700 rounded-md flex justify-between items-center">
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-sm font-medium text-gray-200 truncate flex items-center">
                {source.Title}
                {source.torboxCached && (
                  <span
                    className="ml-2 text-yellow-400"
                    title="Cached on TorBox (instant)"
                    aria-label="Cached on TorBox"
                  >
                    ★
                  </span>
                )}
              </p>
              <div className="text-xs text-gray-400 flex space-x-4 mt-1">
                <span>Seeders: <span className="font-semibold text-green-400">{source.Seeders ?? 0}</span></span>
                <span>Size: <span className="font-semibold text-blue-400">{formatSize(source.Size)}</span></span>
                {source.torboxCached && <span className="text-yellow-400 font-semibold">Instant</span>}
              </div>
            </div>
            <button
              onClick={() => onAdd(source)}
              className="relative px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-50"
              disabled={!source.MagnetUri}
            >
              Add
              {source.torboxCached && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center shadow">
                  ★
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TorrentProgress({ status }: { status: TorrentStatus }) {
  const getProgress = () => {
    if (status.status === 'completed') return 100;
    return status.lastSnapshot?.progress ?? 0;
  }
  const progress = getProgress();

  return (
    <div className="mt-6 bg-gray-800 p-4 rounded-lg">
      <h3 className="text-xl font-semibold mb-3">Download Status</h3>
      <p className="text-sm truncate mb-1">{status.lastSnapshot?.name || 'Fetching details...'}</p>
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div className="bg-green-500 h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="flex justify-between text-xs mt-1 text-gray-400">
        <span>{status.status}</span>
        <span>{progress}%</span>
      </div>
    </div>
  )
}

export default function App() {
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [sources, setSources] = useState<JackettResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTorrent, setActiveTorrent] = useState<TorrentStatus | null>(null);

  useEffect(() => {
    getPopularMovies()
      .then(data => setPopularMovies(data.results))
      .catch(err => setError(err.message));
  }, []);

  const handleSelectMedia = async (item: MediaItem) => {
    setSelectedMedia(item);
    setSources(null);
    setActiveTorrent(null);
    setIsLoading(true);
    setError(null);
    try {
      const year = item.release_date ? parseInt(item.release_date.split('-')[0]) : undefined;
      const data = await searchSources(item.title || item.name || '', year);
      setSources(data.results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTorrent = async (source: JackettResult) => {
    if (!source.MagnetUri) {
      setError('This source does not have a magnet link.');
      return;
    }
    setError(null);
    try {
      const { localId } = await addTorrent(source.MagnetUri, selectedMedia?.title || selectedMedia?.name);
      const placeholderStatus: TorrentStatus = { localId, magnet: source.MagnetUri, hash: null, created: Date.now(), status: 'initializing' };
      setActiveTorrent(placeholderStatus);
      createTorrentStatusStream(
        localId,
        (statusUpdate) => setActiveTorrent(statusUpdate),
        () => {},
        (e) => {
          console.error('SSE Error:', e);
          setError('Connection to status stream lost.');
        }
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">StreamHub</h1>
        <p className="text-gray-400 mt-1">Your personal media hub.</p>
      </header>

      {error && <div className="bg-red-500 text-white p-3 rounded-md mb-4">{error}</div>}

      <main>
        {!selectedMedia && <MediaCarousel title="Popular Movies" items={popularMovies} onSelect={handleSelectMedia} />}

        {selectedMedia && (
          <div>
            <button onClick={() => setSelectedMedia(null)} className="mb-4 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md">
              &larr; Back to Popular
            </button>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <img src={`${IMAGE_BASE_URL}w500${selectedMedia.poster_path}`} alt={selectedMedia.title} className="rounded-lg shadow-xl" />
              </div>
              <div className="md:w-2/3">
                <h2 className="text-3xl font-bold">{selectedMedia.title || selectedMedia.name}</h2>
                <p className="text-gray-400 mt-2">{selectedMedia.overview}</p>

                {isLoading && <div className="mt-6 text-lg">Searching for sources...</div>}
                {sources && <SourceResults sources={sources} onAdd={handleAddTorrent} />}
                {activeTorrent && <TorrentProgress status={activeTorrent} />}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
