import React from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { RefreshCw, Wifi, WifiOff, CloudOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function SyncStatus() {
  const { 
    isOnline, 
    pendingCount, 
    syncing, 
    lastSync, 
    error,
    manualSync,
    refreshData,
    clearError
  } = useOfflineSync();

  const handleManualSync = async () => {
    try {
      await manualSync();
      toast.success('Sinkronisasi berhasil!');
    } catch (error) {
      toast.error('Sinkronisasi gagal!');
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshData();
      toast.success('Data berhasil diperbarui!');
    } catch (error) {
      toast.error('Gagal memperbarui data!');
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b bg-background">
      {/* Status Online/Offline */}
      <div className="flex items-center gap-2">
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4 text-green-600" />
            <Badge variant="outline" className="text-green-600 border-green-200">
              Online
            </Badge>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-orange-600" />
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              Offline
            </Badge>
          </>
        )}
      </div>

      {/* Pending Sync Count */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-2">
          <CloudOff className="h-4 w-4 text-blue-600" />
          <Badge variant="secondary" className="text-blue-600">
            {pendingCount} data menunggu sync
          </Badge>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <Badge variant="destructive" className="cursor-pointer" onClick={clearError}>
            {error}
          </Badge>
        </div>
      )}

      {/* Last Sync Time */}
      {lastSync && (
        <div className="text-sm text-muted-foreground">
          Terakhir sync: {lastSync.toLocaleTimeString('id-ID')}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 ml-auto">
        {isOnline && pendingCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualSync}
            disabled={syncing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        )}

        {isOnline && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={syncing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>
    </div>
  );
}

// Komponen mini untuk ditampilkan di header
export function MiniSyncStatus() {
  const { isOnline, pendingCount, syncing } = useOfflineSync();

  if (!isOnline && pendingCount === 0) {
    return (
      <div className="flex items-center gap-1 text-orange-600">
        <WifiOff className="h-3 w-3" />
        <span className="text-xs">Offline</span>
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <div className="flex items-center gap-1 text-blue-600">
        <CloudOff className="h-3 w-3" />
        <span className="text-xs">{pendingCount} pending</span>
        {syncing && <RefreshCw className="h-3 w-3 animate-spin ml-1" />}
      </div>
    );
  }

  if (isOnline) {
    return (
      <div className="flex items-center gap-1 text-green-600">
        <Wifi className="h-3 w-3" />
        <span className="text-xs">Online</span>
      </div>
    );
  }

  return null;
}
