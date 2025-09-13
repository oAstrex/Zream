import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { WatchProgress } from '../types/content';
import { progressService } from '../services/progress';

interface ProgressContextType {
  getAllProgress: () => WatchProgress[];
  getContinueWatching: () => WatchProgress[];
  getProgress: (contentId: string, episodeId?: string) => WatchProgress | undefined;
  getProgressPercentage: (contentId: string, episodeId?: string) => number;
  updateProgress: (progress: WatchProgress) => void;
  removeProgress: (contentId: string, episodeId?: string) => void;
  markAsWatched: (contentId: string, duration: number, episodeId?: string) => void;
  clearAllProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

interface ProgressProviderProps {
  children: ReactNode;
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({ children }) => {
  // Use a state variable to trigger re-renders when progress changes
  const [, setUpdateTrigger] = useState(0);
  
  const triggerUpdate = useCallback(() => {
    setUpdateTrigger(prev => prev + 1);
  }, []);

  const getAllProgress = useCallback(() => {
    return progressService.getAllProgress();
  }, []);

  const getContinueWatching = useCallback(() => {
    return progressService.getContinueWatching();
  }, []);

  const getProgress = useCallback((contentId: string, episodeId?: string) => {
    return progressService.getProgress(contentId, episodeId);
  }, []);

  const getProgressPercentage = useCallback((contentId: string, episodeId?: string) => {
    return progressService.getProgressPercentage(contentId, episodeId);
  }, []);

  const updateProgress = useCallback((progress: WatchProgress) => {
    progressService.updateProgress(progress);
    triggerUpdate();
  }, [triggerUpdate]);

  const removeProgress = useCallback((contentId: string, episodeId?: string) => {
    progressService.removeProgress(contentId, episodeId);
    triggerUpdate();
  }, [triggerUpdate]);

  const markAsWatched = useCallback((contentId: string, duration: number, episodeId?: string) => {
    progressService.markAsWatched(contentId, duration, episodeId);
    triggerUpdate();
  }, [triggerUpdate]);

  const clearAllProgress = useCallback(() => {
    progressService.clearAllProgress();
    triggerUpdate();
  }, [triggerUpdate]);

  const value: ProgressContextType = {
    getAllProgress,
    getContinueWatching,
    getProgress,
    getProgressPercentage,
    updateProgress,
    removeProgress,
    markAsWatched,
    clearAllProgress
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = (): ProgressContextType => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};