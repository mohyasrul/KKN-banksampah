import { useState, useEffect } from "react";
import { offlineDataManager } from "../utils/offlineDataManager";
import type { Database } from "../lib/supabase";

type RT = Database["public"]["Tables"]["rt"]["Row"];
type WasteType = Database["public"]["Tables"]["waste_types"]["Row"];
type WasteTransaction = Database["public"]["Tables"]["waste_transactions"]["Row"];
type SavingsTransaction = Database["public"]["Tables"]["savings_transactions"]["Row"];

// Extended types dengan relasi
type WasteTransactionWithDetails = WasteTransaction & {
  rt?: { nomor: string; ketua_rt: string };
  waste_type?: { name: string };
};

type SavingsTransactionWithDetails = SavingsTransaction & {
  rt?: { nomor: string; ketua_rt: string };
};

export const useOfflineSupabaseData = () => {
  const [rtList, setRTList] = useState<RT[]>([]);
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([]);
  const [transactions, setTransactions] = useState<WasteTransactionWithDetails[]>([]);
  const [savingsTransactions, setSavingsTransactions] = useState<SavingsTransactionWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if we're online
      const isOnline = navigator.onLine;
      
      if (!isOnline) {
        console.log("Offline mode detected, loading from IndexedDB only");
        // Load from IndexedDB only when offline
        await Promise.all([
          loadRTListOffline(),
          loadWasteTypesOffline(),
          loadWasteTransactionsOffline(),
          loadSavingsTransactionsOffline()
        ]);
      } else {
        // Try to load from online sources, fallback to offline
        await Promise.all([
          loadRTList(),
          loadWasteTypes(),
          loadWasteTransactions(),
          loadSavingsTransactions()
        ]);
      }
    } catch (err) {
      console.error("Error loading initial data:", err);
      // If online loading fails, try offline
      if (navigator.onLine) {
        console.log("Online loading failed, trying offline fallback");
        try {
          await Promise.all([
            loadRTListOffline(),
            loadWasteTypesOffline(),
            loadWasteTransactionsOffline(),
            loadSavingsTransactionsOffline()
          ]);
        } catch (offlineErr) {
          console.error("Offline fallback also failed:", offlineErr);
          setError("Failed to load data. Please check your connection or try again later.");
        }
      } else {
        setError("Offline mode: Some data may not be available.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Offline-specific loaders
  const loadRTListOffline = async () => {
    try {
      const data = await offlineDataManager.getRTList();
      setRTList(data);
    } catch (err) {
      console.error("Error loading RT list offline:", err);
      // Set default data if no offline data exists
      setRTList([]);
    }
  };

  const loadWasteTypesOffline = async () => {
    try {
      const data = await offlineDataManager.getWasteTypes();
      if (data.length === 0) {
        // Set default waste types if none exist
        const defaultWasteTypes = [
          { id: 'plastik', name: 'Plastik', price_per_kg: 5000, unit: 'kg', description: 'Limbah plastik', is_active: true, created_at: new Date().toISOString() },
          { id: 'kertas', name: 'Kertas', price_per_kg: 3000, unit: 'kg', description: 'Limbah kertas', is_active: true, created_at: new Date().toISOString() },
          { id: 'logam', name: 'Logam', price_per_kg: 8000, unit: 'kg', description: 'Limbah logam', is_active: true, created_at: new Date().toISOString() },
          { id: 'kaca', name: 'Kaca', price_per_kg: 2000, unit: 'kg', description: 'Limbah kaca', is_active: true, created_at: new Date().toISOString() },
          { id: 'kardus', name: 'Kardus', price_per_kg: 2500, unit: 'kg', description: 'Limbah kardus', is_active: true, created_at: new Date().toISOString() },
        ];
        setWasteTypes(defaultWasteTypes);
        // Default waste types will be available for offline use
      } else {
        setWasteTypes(data);
      }
    } catch (err) {
      console.error("Error loading waste types offline:", err);
      setWasteTypes([]);
    }
  };

  const loadWasteTransactionsOffline = async () => {
    try {
      const data = await offlineDataManager.getWasteTransactions();
      setTransactions(data.map(transaction => ({
        ...transaction,
        rt: rtList.find(r => r.id === transaction.rt_id) ? 
          { nomor: rtList.find(r => r.id === transaction.rt_id)!.nomor, 
            ketua_rt: rtList.find(r => r.id === transaction.rt_id)!.ketua_rt } : undefined,
        waste_type: wasteTypes.find(wt => wt.id === transaction.waste_type_id) ? 
          { name: wasteTypes.find(wt => wt.id === transaction.waste_type_id)!.name } : undefined
      })));
    } catch (err) {
      console.error("Error loading waste transactions offline:", err);
      setTransactions([]);
    }
  };

  const loadSavingsTransactionsOffline = async () => {
    try {
      const data = await offlineDataManager.getSavingsTransactions();
      setSavingsTransactions(data.map(transaction => ({
        ...transaction,
        rt: rtList.find(r => r.id === transaction.rt_id) ? 
          { nomor: rtList.find(r => r.id === transaction.rt_id)!.nomor, 
            ketua_rt: rtList.find(r => r.id === transaction.rt_id)!.ketua_rt } : undefined
      })));
    } catch (err) {
      console.error("Error loading savings transactions offline:", err);
      setSavingsTransactions([]);
    }
  };

  const loadRTList = async () => {
    try {
      const data = await offlineDataManager.getRTList();
      setRTList(data);
    } catch (err) {
      console.error("Error loading RT list:", err);
      throw err;
    }
  };

  const loadWasteTypes = async () => {
    try {
      const data = await offlineDataManager.getWasteTypes();
      setWasteTypes(data);
    } catch (err) {
      console.error("Error loading waste types:", err);
      throw err;
    }
  };

  const loadWasteTransactions = async () => {
    try {
      const data = await offlineDataManager.getWasteTransactions();
      
      // Enhance dengan data RT dan waste type
      const enhancedData: WasteTransactionWithDetails[] = data.map(transaction => {
        const rt = rtList.find(r => r.id === transaction.rt_id);
        const wasteType = wasteTypes.find(wt => wt.id === transaction.waste_type_id);
        
        return {
          ...transaction,
          rt: rt ? { nomor: rt.nomor, ketua_rt: rt.ketua_rt } : undefined,
          waste_type: wasteType ? { name: wasteType.name } : undefined
        };
      });
      
      setTransactions(enhancedData);
    } catch (err) {
      console.error("Error loading waste transactions:", err);
      throw err;
    }
  };

  const loadSavingsTransactions = async () => {
    try {
      const data = await offlineDataManager.getSavingsTransactions();
      
      // Enhance dengan data RT
      const enhancedData: SavingsTransactionWithDetails[] = data.map(transaction => {
        const rt = rtList.find(r => r.id === transaction.rt_id);
        
        return {
          ...transaction,
          rt: rt ? { nomor: rt.nomor, ketua_rt: rt.ketua_rt } : undefined
        };
      });
      
      setSavingsTransactions(enhancedData);
    } catch (err) {
      console.error("Error loading savings transactions:", err);
      throw err;
    }
  };

  // RT Operations
  const createRT = async (data: Database["public"]["Tables"]["rt"]["Insert"]) => {
    try {
      const newRT = await offlineDataManager.createRT(data);
      await loadRTList(); // Refresh list
      return newRT;
    } catch (err) {
      console.error("Error creating RT:", err);
      throw err;
    }
  };

  const updateRT = async (id: string, data: Database["public"]["Tables"]["rt"]["Update"]) => {
    try {
      await offlineDataManager.updateRT(id, data);
      await loadRTList(); // Refresh list
    } catch (err) {
      console.error("Error updating RT:", err);
      throw err;
    }
  };

  // Waste Transaction Operations
  const createWasteTransaction = async (data: Database["public"]["Tables"]["waste_transactions"]["Insert"]) => {
    try {
      const newTransaction = await offlineDataManager.createWasteTransaction(data);
      await Promise.all([
        loadWasteTransactions(),
        loadRTList() // Update RT saldo
      ]);
      return newTransaction;
    } catch (err) {
      console.error("Error creating waste transaction:", err);
      throw err;
    }
  };

  // Savings Transaction Operations
  const createSavingsTransaction = async (data: Database["public"]["Tables"]["savings_transactions"]["Insert"]) => {
    try {
      const newTransaction = await offlineDataManager.createSavingsTransaction(data);
      await Promise.all([
        loadSavingsTransactions(),
        loadRTList() // Update RT saldo
      ]);
      return newTransaction;
    } catch (err) {
      console.error("Error creating savings transaction:", err);
      throw err;
    }
  };

  // Utility functions
  const getRTById = (id: string): RT | undefined => {
    return rtList.find(rt => rt.id === id);
  };

  const getWasteTypeById = (id: string): WasteType | undefined => {
    return wasteTypes.find(wt => wt.id === id);
  };

  const refreshData = async () => {
    await loadInitialData();
  };

  // Stats calculations
  const stats = {
    totalRT: rtList.length,
    totalSaldo: rtList.reduce((sum, rt) => sum + rt.saldo, 0),
    totalTransaksi: rtList.reduce((sum, rt) => sum + rt.total_transaksi, 0),
    totalSetoran: transactions.reduce((sum, t) => sum + t.total_value, 0),
    totalTabungan: savingsTransactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0),
    totalPenarikan: savingsTransactions
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0)
  };

  return {
    // Data
    rtList,
    wasteTypes,
    transactions,
    savingsTransactions,
    
    // State
    isLoading,
    error,
    
    // Operations
    createRT,
    updateRT,
    createWasteTransaction,
    createSavingsTransaction,
    
    // Utilities
    getRTById,
    getWasteTypeById,
    refreshData,
    
    // Stats
    stats,
    
    // Individual loaders (for specific refreshes)
    loadRTList,
    loadWasteTypes,
    loadWasteTransactions,
    loadSavingsTransactions
  };
};
