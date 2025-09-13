import { WatchProgress } from '../types/content';

const STORAGE_KEY = 'zream_watch_progress';

export class ProgressService {
  private progress: Map<string, WatchProgress> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const progressArray: WatchProgress[] = JSON.parse(stored);
        this.progress = new Map(progressArray.map(p => [`${p.contentId}_${p.episodeId || ''}`, p]));
      }
    } catch (error) {
      console.warn('Failed to load watch progress from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const progressArray = Array.from(this.progress.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progressArray));
    } catch (error) {
      console.warn('Failed to save watch progress to storage:', error);
    }
  }

  private getKey(contentId: string, episodeId?: string): string {
    return `${contentId}_${episodeId || ''}`;
  }

  public updateProgress(progress: WatchProgress): void {
    const key = this.getKey(progress.contentId, progress.episodeId);
    this.progress.set(key, {
      ...progress,
      updatedAt: new Date().toISOString()
    });
    this.saveToStorage();
  }

  public getProgress(contentId: string, episodeId?: string): WatchProgress | undefined {
    const key = this.getKey(contentId, episodeId);
    return this.progress.get(key);
  }

  public getAllProgress(): WatchProgress[] {
    return Array.from(this.progress.values())
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public getContinueWatching(): WatchProgress[] {
    const threshold = 0.9; // Consider as "finished" if 90% watched
    const minWatchTime = 300; // At least 5 minutes watched

    return this.getAllProgress().filter(p => {
      const progressPercent = p.position / p.duration;
      return progressPercent > 0.05 && progressPercent < threshold && p.position > minWatchTime;
    });
  }

  public removeProgress(contentId: string, episodeId?: string): void {
    const key = this.getKey(contentId, episodeId);
    this.progress.delete(key);
    this.saveToStorage();
  }

  public clearAllProgress(): void {
    this.progress.clear();
    this.saveToStorage();
  }

  public markAsWatched(contentId: string, duration: number, episodeId?: string): void {
    this.updateProgress({
      contentId,
      position: duration,
      duration,
      updatedAt: new Date().toISOString(),
      type: episodeId ? 'show' : 'movie',
      episodeId
    });
  }

  public getProgressPercentage(contentId: string, episodeId?: string): number {
    const progress = this.getProgress(contentId, episodeId);
    if (!progress || progress.duration === 0) return 0;
    return Math.min(100, (progress.position / progress.duration) * 100);
  }
}

export const progressService = new ProgressService();