import { useState, useEffect } from 'react';
import { offlineDataManager } from '../utils/offlineDataManager';

export interface SyncStatus {
  isOnline: boolean;
  pendingCount: number;
  syncing: boolean;
  lastSync: Date | null;
  error: string | null;
}

export function useOfflineSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    pendingCount: 0,
    syncing: false,
    lastSync: null,
    error: null
  });

  useEffect(() => {
    // Update online status
    const handleOnlineStatus = (isOnline: boolean) => {
      setSyncStatus(prev => ({
        ...prev,
        isOnline,
        error: null
      }));
    };

    // Update pending sync count
    const handleSyncCount = (count: number) => {
      setSyncStatus(prev => ({
        ...prev,
        pendingCount: count
      }));
    };

    // Add listeners
    offlineDataManager.addOnlineListener(handleOnlineStatus);
    offlineDataManager.addSyncListener(handleSyncCount);

    // Initial load of pending count
    const loadInitialCount = async () => {
      try {
        const count = await offlineDataManager.getPendingSyncCount();
        setSyncStatus(prev => ({
          ...prev,
          pendingCount: count
        }));
      } catch (error) {
        console.error('Failed to get initial pending count:', error);
      }
    };

    loadInitialCount();

    // Cleanup listeners
    return () => {
      offlineDataManager.removeOnlineListener(handleOnlineStatus);
      offlineDataManager.removeSyncListener(handleSyncCount);
    };
  }, []);

  const manualSync = async () => {
    if (!syncStatus.isOnline) {
      setSyncStatus(prev => ({
        ...prev,
        error: 'Tidak dapat sinkronisasi saat offline'
      }));
      return;
    }

    setSyncStatus(prev => ({
      ...prev,
      syncing: true,
      error: null
    }));

    try {
      await offlineDataManager.manualSync();
      setSyncStatus(prev => ({
        ...prev,
        syncing: false,
        lastSync: new Date(),
        error: null
      }));
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        syncing: false,
        error: error instanceof Error ? error.message : 'Sinkronisasi gagal'
      }));
    }
  };

  const refreshData = async () => {
    if (!syncStatus.isOnline) {
      setSyncStatus(prev => ({
        ...prev,
        error: 'Tidak dapat refresh saat offline'
      }));
      return;
    }

    setSyncStatus(prev => ({
      ...prev,
      syncing: true,
      error: null
    }));

    try {
      await offlineDataManager.refreshFromServer();
      setSyncStatus(prev => ({
        ...prev,
        syncing: false,
        lastSync: new Date(),
        error: null
      }));
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        syncing: false,
        error: error instanceof Error ? error.message : 'Refresh data gagal'
      }));
    }
  };

  const clearError = () => {
    setSyncStatus(prev => ({
      ...prev,
      error: null
    }));
  };

  return {
    ...syncStatus,
    manualSync,
    refreshData,
    clearError
  };
}
