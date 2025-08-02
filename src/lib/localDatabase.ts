import Dexie, { Table } from 'dexie';

// Types untuk local storage
export interface PendingSync {
  id: string;
  table: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount?: number;
}

export interface LocalRT {
  id: string;
  nomor: string;
  ketua_rt: string;
  jumlah_kk: number;
  alamat: string | null;
  kontak: string | null;
  saldo: number;
  total_transaksi: number;
  created_at: string;
  updated_at: string;
  synced?: boolean;
  local_id?: string;
}

export interface LocalWasteTransaction {
  id: string;
  rt_id: string;
  waste_type_id: string;
  date: string;
  weight: number;
  price_per_kg: number;
  total_value: number;
  notes: string | null;
  created_at: string;
  synced?: boolean;
  local_id?: string;
}

export interface LocalSavingsTransaction {
  id: string;
  rt_id: string;
  type: "deposit" | "withdrawal";
  amount: number;
  description: string | null;
  date: string;
  created_at: string;
  synced?: boolean;
  local_id?: string;
}

export interface LocalWasteType {
  id: string;
  name: string;
  price_per_kg: number;
  unit: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  synced?: boolean;
}

export class LocalDatabase extends Dexie {
  rt!: Table<LocalRT>;
  waste_transactions!: Table<LocalWasteTransaction>;
  savings_transactions!: Table<LocalSavingsTransaction>;
  waste_types!: Table<LocalWasteType>;
  pending_sync!: Table<PendingSync>;

  constructor() {
    super('BankSampahDB');
    
    this.version(1).stores({
      rt: 'id, nomor, ketua_rt, synced',
      waste_transactions: 'id, rt_id, date, synced, local_id',
      savings_transactions: 'id, rt_id, date, type, synced, local_id',
      waste_types: 'id, name, is_active, synced',
      pending_sync: 'id, table, action, timestamp, retryCount'
    });
  }

  // Helper methods
  async addPendingSync(data: Omit<PendingSync, 'id' | 'timestamp'>): Promise<string> {
    const syncData: PendingSync = {
      ...data,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retryCount: 0
    };
    
    await this.pending_sync.add(syncData);
    return syncData.id;
  }

  async getPendingSync(): Promise<PendingSync[]> {
    return await this.pending_sync.orderBy('timestamp').toArray();
  }

  async removePendingSync(id: string): Promise<void> {
    await this.pending_sync.delete(id);
  }

  async incrementRetryCount(id: string): Promise<void> {
    const item = await this.pending_sync.get(id);
    if (item) {
      await this.pending_sync.update(id, { 
        retryCount: (item.retryCount || 0) + 1 
      });
    }
  }

  // Utility untuk generate local ID
  generateLocalId(): string {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Clear all data (untuk testing/reset)
  async clearAllData(): Promise<void> {
    await Promise.all([
      this.rt.clear(),
      this.waste_transactions.clear(),
      this.savings_transactions.clear(),
      this.waste_types.clear(),
      this.pending_sync.clear()
    ]);
  }
}

export const localDB = new LocalDatabase();
