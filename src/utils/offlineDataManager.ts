import { supabase, isDemoMode } from '../lib/supabase';
import { localDB, PendingSync } from '../lib/localDatabase';
import type { Database } from '../lib/supabase';
import { testSupabaseConnection, setupInitialData } from './setupSupabase';

type RT = Database["public"]["Tables"]["rt"]["Row"];
type WasteType = Database["public"]["Tables"]["waste_types"]["Row"];
type WasteTransaction = Database["public"]["Tables"]["waste_transactions"]["Row"];
type SavingsTransaction = Database["public"]["Tables"]["savings_transactions"]["Row"];

export class OfflineDataManager {
  private isOnline = navigator.onLine;
  private syncInProgress = false;
  private listeners: Array<(isOnline: boolean) => void> = [];
  private syncListeners: Array<(count: number) => void> = [];

  constructor() {
    this.setupOnlineListener();
    this.initializeDatabase();
    
    if (isDemoMode) {
      this.seedDemoData();
    } else {
      // Test Supabase connection and setup initial data
      this.initializeSupabase();
    }
  }

  private async initializeSupabase() {
    try {
      console.log('🔗 Initializing Supabase connection...');
      const isConnected = await testSupabaseConnection();
      
      if (isConnected) {
        await setupInitialData();
        console.log('✅ Supabase initialization completed');
      } else {
        console.warn('⚠️ Supabase connection failed, running in offline-only mode');
      }
    } catch (error) {
      console.error('❌ Supabase initialization failed:', error);
    }
  }

  // Helper method for demo mode
  private async seedDemoData() {
    try {
      // Seed some demo waste types if empty
      const existingWasteTypes = await localDB.waste_types.count();
      if (existingWasteTypes === 0) {
        await localDB.waste_types.bulkAdd([
          {
            id: 'demo-1',
            name: 'Plastik',
            price_per_kg: 2000,
            unit: 'kg',
            description: 'Botol plastik, kemasan plastik',
            is_active: true,
            created_at: new Date().toISOString(),
            synced: false
          },
          {
            id: 'demo-2', 
            name: 'Kertas',
            price_per_kg: 1500,
            unit: 'kg',
            description: 'Kertas bekas, koran, majalah',
            is_active: true,
            created_at: new Date().toISOString(),
            synced: false
          },
          {
            id: 'demo-3',
            name: 'Kaleng',
            price_per_kg: 3000,
            unit: 'kg', 
            description: 'Kaleng minuman, kaleng makanan',
            is_active: true,
            created_at: new Date().toISOString(),
            synced: false
          }
        ]);
        console.log('🌱 Demo waste types seeded');
      }
    } catch (error) {
      console.error('Failed to seed demo data:', error);
    }
  }

  private async initializeDatabase() {
    try {
      await localDB.open();
      console.log('Local database initialized');
    } catch (error) {
      console.error('Failed to initialize local database:', error);
    }
  }

  private setupOnlineListener() {
    const handleOnline = () => {
      console.log('🟢 Back online - starting sync...');
      this.isOnline = true;
      this.notifyListeners(true);
      this.syncPendingData();
    };

    const handleOffline = () => {
      console.log('🔴 Gone offline - switching to local mode...');
      this.isOnline = false;
      this.notifyListeners(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  }

  // Listeners untuk status online/offline
  addOnlineListener(callback: (isOnline: boolean) => void) {
    this.listeners.push(callback);
  }

  removeOnlineListener(callback: (isOnline: boolean) => void) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  private notifyListeners(isOnline: boolean) {
    this.listeners.forEach(callback => callback(isOnline));
  }

  // Helper method untuk handle demo mode
  private async handleSupabaseOperation(operation: () => Promise<any>): Promise<any> {
    if (isDemoMode) {
      console.log('🚧 Demo mode - Supabase operation skipped');
      return { data: null, error: null };
    }
    
    try {
      return await operation();
    } catch (error) {
      console.error('Supabase operation failed:', error);
      throw error;
    }
  }

  // Listeners untuk sync count
  addSyncListener(callback: (count: number) => void) {
    this.syncListeners.push(callback);
  }

  removeSyncListener(callback: (count: number) => void) {
    this.syncListeners = this.syncListeners.filter(cb => cb !== callback);
  }

  private async notifySyncListeners() {
    const count = await this.getPendingSyncCount();
    this.syncListeners.forEach(callback => callback(count));
  }

  // RT Operations
  async createRT(data: Database["public"]["Tables"]["rt"]["Insert"]): Promise<RT> {
    const rtData: RT = {
      id: localDB.generateLocalId(),
      nomor: data.nomor,
      ketua_rt: data.ketua_rt,
      jumlah_kk: data.jumlah_kk || 0,
      alamat: data.alamat || null,
      kontak: data.kontak || null,
      saldo: data.saldo || 0,
      total_transaksi: data.total_transaksi || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save to local storage first
    await localDB.rt.add({ ...rtData, synced: false, local_id: rtData.id });

    if (this.isOnline) {
      try {
        const result = await this.handleSupabaseOperation(async () => {
          return await supabase.from('rt').insert(data).select().single();
        });
        
        const { data: remoteData, error } = result;
        if (!error && remoteData) {
          // Update local with remote ID
          await localDB.rt.update(rtData.id, { 
            ...remoteData, 
            synced: true, 
            local_id: rtData.id 
          });
          return remoteData;
        } else if (!isDemoMode) {
          throw error;
        }
      } catch (error) {
        console.error('Failed to sync RT to server:', error);
        await localDB.addPendingSync({
          table: 'rt',
          action: 'create',
          data: { ...data, local_id: rtData.id }
        });
        this.notifySyncListeners();
      }
    } else {
      await localDB.addPendingSync({
        table: 'rt',
        action: 'create',
        data: { ...data, local_id: rtData.id }
      });
      this.notifySyncListeners();
    }

    return rtData;
  }

  async updateRT(id: string, data: Database["public"]["Tables"]["rt"]["Update"]): Promise<void> {
    // Update local first
    await localDB.rt.update(id, { ...data, synced: false, updated_at: new Date().toISOString() });

    if (this.isOnline) {
      try {
        const { error } = await supabase.from('rt').update(data).eq('id', id);
        
        if (!error) {
          await localDB.rt.update(id, { synced: true });
        } else {
          throw error;
        }
      } catch (error) {
        console.error('Failed to sync RT update to server:', error);
        await localDB.addPendingSync({
          table: 'rt',
          action: 'update',
          data: { id, ...data }
        });
        this.notifySyncListeners();
      }
    } else {
      await localDB.addPendingSync({
        table: 'rt',
        action: 'update',
        data: { id, ...data }
      });
      this.notifySyncListeners();
    }
  }

  async deleteRT(id: string): Promise<void> {
    if (this.isOnline) {
      try {
        const { error } = await supabase.from('rt').delete().eq('id', id);
        if (!error) {
          // Remove from local cache
          await localDB.rt.delete(id);
          return;
        }
      } catch (error) {
        console.error('Failed to delete RT from server, queuing for later sync:', error);
      }
    }

    // Queue for sync when online
    await localDB.rt.delete(id);
    await localDB.pending_sync.add({
      id: localDB.generateLocalId(),
      table: 'rt',
      action: 'delete',
      data: { id },
      timestamp: Date.now()
    });
    this.notifySyncListeners();
  }

  async getRTList(): Promise<RT[]> {
    if (this.isOnline) {
      try {
        const { data, error } = await supabase.from('rt').select('*').order('nomor');
        
        if (!error && data) {
          // Update local cache
          for (const item of data) {
            await localDB.rt.put({ ...item, synced: true });
          }
          return data;
        }
      } catch (error) {
        console.error('Failed to fetch RT from server, using local data:', error);
      }
    }

    // Fallback to local data
    const localData = await localDB.rt.orderBy('nomor').toArray();
    return localData.map(item => {
      const { synced, local_id, ...rtData } = item;
      return rtData;
    });
  }

  // Waste Transaction Operations
  async createWasteTransaction(data: Database["public"]["Tables"]["waste_transactions"]["Insert"]): Promise<WasteTransaction> {
    const transactionData: WasteTransaction = {
      id: localDB.generateLocalId(),
      rt_id: data.rt_id,
      waste_type_id: data.waste_type_id,
      date: data.date || new Date().toISOString().split('T')[0],
      weight: data.weight,
      price_per_kg: data.price_per_kg,
      total_value: data.weight * data.price_per_kg,
      notes: data.notes || null,
      created_at: new Date().toISOString()
    };

    // Save to local storage first
    await localDB.waste_transactions.add({ 
      ...transactionData, 
      synced: false, 
      local_id: transactionData.id 
    });

    // Update RT saldo locally
    const rt = await localDB.rt.get(data.rt_id);
    if (rt) {
      await localDB.rt.update(data.rt_id, {
        saldo: rt.saldo + transactionData.total_value,
        total_transaksi: rt.total_transaksi + 1,
        synced: false
      });
    }

    if (this.isOnline) {
      try {
        const { data: remoteData, error } = await supabase
          .from('waste_transactions')
          .insert(data)
          .select()
          .single();
        
        if (!error && remoteData) {
          await localDB.waste_transactions.update(transactionData.id, { 
            ...remoteData, 
            synced: true,
            local_id: transactionData.id
          });
          return remoteData;
        } else {
          throw error;
        }
      } catch (error) {
        console.error('Failed to sync waste transaction to server:', error);
        await localDB.addPendingSync({
          table: 'waste_transactions',
          action: 'create',
          data: { ...data, local_id: transactionData.id }
        });
        this.notifySyncListeners();
      }
    } else {
      await localDB.addPendingSync({
        table: 'waste_transactions',
        action: 'create',
        data: { ...data, local_id: transactionData.id }
      });
      this.notifySyncListeners();
    }

    return transactionData;
  }

  async getWasteTransactions(): Promise<WasteTransaction[]> {
    if (this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('waste_transactions')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          // Update local cache
          for (const item of data) {
            await localDB.waste_transactions.put({ ...item, synced: true });
          }
          return data;
        }
      } catch (error) {
        console.error('Failed to fetch waste transactions from server, using local data:', error);
      }
    }

    // Fallback to local data
    const localData = await localDB.waste_transactions
      .orderBy('created_at')
      .reverse()
      .toArray();
    
    return localData.map(item => {
      const { synced, local_id, ...transactionData } = item;
      return transactionData;
    });
  }

  // Savings Transaction Operations
  async createSavingsTransaction(data: Database["public"]["Tables"]["savings_transactions"]["Insert"]): Promise<SavingsTransaction> {
    const transactionData: SavingsTransaction = {
      id: localDB.generateLocalId(),
      rt_id: data.rt_id,
      type: data.type,
      amount: data.amount,
      description: data.description || null,
      date: data.date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };

    // Save to local storage first
    await localDB.savings_transactions.add({ 
      ...transactionData, 
      synced: false,
      local_id: transactionData.id
    });

    // Update RT saldo locally
    const rt = await localDB.rt.get(data.rt_id);
    if (rt) {
      const newSaldo = data.type === 'withdrawal' 
        ? rt.saldo - data.amount 
        : rt.saldo + data.amount;
      
      await localDB.rt.update(data.rt_id, {
        saldo: newSaldo,
        synced: false
      });
    }

    if (this.isOnline) {
      try {
        const { data: remoteData, error } = await supabase
          .from('savings_transactions')
          .insert(data)
          .select()
          .single();
        
        if (!error && remoteData) {
          await localDB.savings_transactions.update(transactionData.id, { 
            ...remoteData, 
            synced: true,
            local_id: transactionData.id
          });
          return remoteData;
        } else {
          throw error;
        }
      } catch (error) {
        console.error('Failed to sync savings transaction to server:', error);
        await localDB.addPendingSync({
          table: 'savings_transactions',
          action: 'create',
          data: { ...data, local_id: transactionData.id }
        });
        this.notifySyncListeners();
      }
    } else {
      await localDB.addPendingSync({
        table: 'savings_transactions',
        action: 'create',
        data: { ...data, local_id: transactionData.id }
      });
      this.notifySyncListeners();
    }

    return transactionData;
  }

  async getSavingsTransactions(): Promise<SavingsTransaction[]> {
    if (this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('savings_transactions')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          // Update local cache
          for (const item of data) {
            await localDB.savings_transactions.put({ ...item, synced: true });
          }
          return data;
        }
      } catch (error) {
        console.error('Failed to fetch savings transactions from server, using local data:', error);
      }
    }

    // Fallback to local data
    const localData = await localDB.savings_transactions
      .orderBy('created_at')
      .reverse()
      .toArray();
    
    return localData.map(item => {
      const { synced, local_id, ...transactionData } = item;
      return transactionData;
    });
  }

  // Waste Types Operations
  async getWasteTypes(): Promise<WasteType[]> {
    if (this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('waste_types')
          .select('*')
          .eq('is_active', true)
          .order('name');
        
        if (!error && data) {
          // Update local cache
          for (const item of data) {
            await localDB.waste_types.put({ ...item, synced: true });
          }
          return data;
        }
      } catch (error) {
        console.error('Failed to fetch waste types from server, using local data:', error);
      }
    }

    // Fallback to local data
    const localData = await localDB.waste_types
      .where('is_active')
      .equals(1)
      .sortBy('name');
    
    return localData.map(item => {
      const { synced, ...wasteTypeData } = item;
      return wasteTypeData;
    });
  }

  // Sync Operations
  async syncPendingData(): Promise<void> {
    if (!this.isOnline || this.syncInProgress) {
      return;
    }

    this.syncInProgress = true;
    console.log('🔄 Starting sync process...');

    try {
      const pendingItems = await localDB.getPendingSync();
      console.log(`📤 Found ${pendingItems.length} items to sync`);

      for (const item of pendingItems) {
        try {
          await this.syncItem(item);
          await localDB.removePendingSync(item.id);
          console.log(`✅ Synced ${item.table} ${item.action}`);
        } catch (error) {
          console.error(`❌ Failed to sync ${item.table} ${item.action}:`, error);
          
          // Increment retry count
          await localDB.incrementRetryCount(item.id);
          
          // Remove item if max retries reached
          if ((item.retryCount || 0) >= 3) {
            console.warn(`🗑️ Removing item after max retries: ${item.id}`);
            await localDB.removePendingSync(item.id);
          }
        }
      }

      this.notifySyncListeners();
      console.log('✅ Sync process completed');
    } catch (error) {
      console.error('❌ Sync process failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncItem(item: PendingSync): Promise<void> {
    const { table, action, data } = item;

    switch (table) {
      case 'rt':
        if (action === 'create') {
          const { local_id, ...createData } = data;
          const { data: remoteData, error } = await supabase
            .from('rt')
            .insert(createData)
            .select()
            .single();
          
          if (error) throw error;
          
          // Update local record with remote ID
          if (remoteData && local_id) {
            await localDB.rt.update(local_id, { 
              ...remoteData, 
              synced: true,
              local_id 
            });
          }
        } else if (action === 'update') {
          const { id, ...updateData } = data;
          const { error } = await supabase.from('rt').update(updateData).eq('id', id);
          if (error) throw error;
          
          await localDB.rt.update(id, { synced: true });
        }
        break;

      case 'waste_transactions':
        if (action === 'create') {
          const { local_id, ...createData } = data;
          const { data: remoteData, error } = await supabase
            .from('waste_transactions')
            .insert(createData)
            .select()
            .single();
          
          if (error) throw error;
          
          if (remoteData && local_id) {
            await localDB.waste_transactions.update(local_id, { 
              ...remoteData, 
              synced: true,
              local_id 
            });
          }
        }
        break;

      case 'savings_transactions':
        if (action === 'create') {
          const { local_id, ...createData } = data;
          const { data: remoteData, error } = await supabase
            .from('savings_transactions')
            .insert(createData)
            .select()
            .single();
          
          if (error) throw error;
          
          if (remoteData && local_id) {
            await localDB.savings_transactions.update(local_id, { 
              ...remoteData, 
              synced: true,
              local_id 
            });
          }
        }
        break;
    }
  }

  async getPendingSyncCount(): Promise<number> {
    return await localDB.pending_sync.count();
  }

  async manualSync(): Promise<void> {
    if (this.isOnline) {
      await this.syncPendingData();
    } else {
      throw new Error('Cannot sync while offline');
    }
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  // Force refresh data from server
  async refreshFromServer(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot refresh while offline');
    }

    // Clear local cache and refetch
    await Promise.all([
      this.getRTList(),
      this.getWasteTypes(),
      this.getWasteTransactions(),
      this.getSavingsTransactions()
    ]);
  }
}

export const offlineDataManager = new OfflineDataManager();
