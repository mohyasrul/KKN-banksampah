import { useState, useEffect } from "react";

// Storage keys
const STORAGE_KEYS = {
  RT_LIST: "banksampah_rt_list",
  WASTE_TRANSACTIONS: "banksampah_waste_transactions",
  WASTE_TYPES: "banksampah_waste_types",
} as const;

// Types
export interface RT {
  id: string;
  nomor: string;
  ketuaRT: string;
  jumlahKK: number;
  alamat: string;
  createdAt: string;
  kontak?: string;
  saldo: number;
  totalTransaksi: number;
}

export interface WasteType {
  id: string;
  name: string;
  pricePerKg: number;
  unit: string;
  description?: string;
}

export interface WasteTransaction {
  id: string;
  date: string;
  rt: string;
  wasteType: string;
  wasteTypeName: string;
  weight: number;
  pricePerKg: number;
  totalValue: number;
  createdAt: string;
}

// Default data
const DEFAULT_RT_LIST: RT[] = [
  {
    id: "rt01",
    nomor: "RT 01",
    ketuaRT: "Bapak Suharto",
    jumlahKK: 25,
    alamat: "Jl. Mawar No. 1-15",
    createdAt: new Date().toISOString(),
    kontak: "081234567890",
    saldo: 0,
    totalTransaksi: 0,
  },
  {
    id: "rt02",
    nomor: "RT 02",
    ketuaRT: "Bapak Sutrisno",
    jumlahKK: 30,
    alamat: "Jl. Melati No. 16-30",
    createdAt: new Date().toISOString(),
    kontak: "081234567891",
    saldo: 0,
    totalTransaksi: 0,
  },
  {
    id: "rt03",
    nomor: "RT 03",
    ketuaRT: "Bapak Sudarman",
    jumlahKK: 28,
    alamat: "Jl. Anggrek No. 31-45",
    createdAt: new Date().toISOString(),
    kontak: "081234567892",
    saldo: 0,
    totalTransaksi: 0,
  },
  {
    id: "rt04",
    nomor: "RT 04",
    ketuaRT: "Bapak Bambang",
    jumlahKK: 32,
    alamat: "Jl. Kenanga No. 46-60",
    createdAt: new Date().toISOString(),
    kontak: "081234567893",
    saldo: 0,
    totalTransaksi: 0,
  },
  {
    id: "rt05",
    nomor: "RT 05",
    ketuaRT: "Bapak Wahid",
    jumlahKK: 27,
    alamat: "Jl. Dahlia No. 61-75",
    createdAt: new Date().toISOString(),
    kontak: "081234567894",
    saldo: 0,
    totalTransaksi: 0,
  },
];
const DEFAULT_WASTE_TYPES: WasteType[] = [
  {
    id: "plastik",
    name: "Plastik",
    pricePerKg: 5000,
    unit: "kg",
    description: "Botol plastik, kemasan makanan, kantong belanja",
  },
  {
    id: "kertas",
    name: "Kertas",
    pricePerKg: 3000,
    unit: "kg",
    description: "Koran bekas, majalah, kertas HVS",
  },
  {
    id: "logam",
    name: "Logam",
    pricePerKg: 8000,
    unit: "kg",
    description: "Kaleng minuman, aluminium, besi bekas",
  },
  {
    id: "kaca",
    name: "Kaca",
    pricePerKg: 2000,
    unit: "kg",
    description: "Botol kaca, gelas bekas",
  },
  {
    id: "kardus",
    name: "Kardus",
    pricePerKg: 2500,
    unit: "kg",
    description: "Kotak kemasan, kardus bekas",
  },
];

// Utility functions for localStorage
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Custom hooks for data management
export const usePersistedRT = () => {
  const [rtList, setRTList] = useState<RT[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedRT = loadFromStorage(STORAGE_KEYS.RT_LIST, DEFAULT_RT_LIST);
    setRTList(savedRT);
    setLoading(false);
  }, []);

  const addRT = (
    rtData: Omit<RT, "id" | "createdAt" | "saldo" | "totalTransaksi">
  ) => {
    const newRT: RT = {
      ...rtData,
      id: `rt_${Date.now()}`,
      createdAt: new Date().toISOString(),
      saldo: 0,
      totalTransaksi: 0,
    };

    const updatedList = [...rtList, newRT];
    setRTList(updatedList);
    saveToStorage(STORAGE_KEYS.RT_LIST, updatedList);
    return newRT;
  };
  const updateRT = (id: string, updates: Partial<RT>) => {
    const updatedList = rtList.map((rt) =>
      rt.id === id ? { ...rt, ...updates } : rt
    );
    setRTList(updatedList);
    saveToStorage(STORAGE_KEYS.RT_LIST, updatedList);
  };

  const deleteRT = (id: string) => {
    const updatedList = rtList.filter((rt) => rt.id !== id);
    setRTList(updatedList);
    saveToStorage(STORAGE_KEYS.RT_LIST, updatedList);
  };

  return {
    rtList,
    loading,
    addRT,
    updateRT,
    deleteRT,
  };
};

export const usePersistedWasteTypes = () => {
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedTypes = loadFromStorage(
      STORAGE_KEYS.WASTE_TYPES,
      DEFAULT_WASTE_TYPES
    );
    setWasteTypes(savedTypes);
    setLoading(false);
  }, []);

  const addWasteType = (typeData: Omit<WasteType, "id">) => {
    const newType: WasteType = {
      ...typeData,
      id: `waste_${Date.now()}`,
    };

    const updatedList = [...wasteTypes, newType];
    setWasteTypes(updatedList);
    saveToStorage(STORAGE_KEYS.WASTE_TYPES, updatedList);
    return newType;
  };

  const updateWasteType = (id: string, updates: Partial<WasteType>) => {
    const updatedList = wasteTypes.map((type) =>
      type.id === id ? { ...type, ...updates } : type
    );
    setWasteTypes(updatedList);
    saveToStorage(STORAGE_KEYS.WASTE_TYPES, updatedList);
  };

  const deleteWasteType = (id: string) => {
    const updatedList = wasteTypes.filter((type) => type.id !== id);
    setWasteTypes(updatedList);
    saveToStorage(STORAGE_KEYS.WASTE_TYPES, updatedList);
  };

  return {
    wasteTypes,
    loading,
    addWasteType,
    updateWasteType,
    deleteWasteType,
  };
};

export const usePersistedTransactions = () => {
  const [transactions, setTransactions] = useState<WasteTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedTransactions = loadFromStorage(
      STORAGE_KEYS.WASTE_TRANSACTIONS,
      []
    );
    setTransactions(savedTransactions);
    setLoading(false);
  }, []);

  const addTransaction = (
    transactionData: Omit<WasteTransaction, "id" | "createdAt">
  ) => {
    const newTransaction: WasteTransaction = {
      ...transactionData,
      id: `trans_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updatedList = [newTransaction, ...transactions];
    setTransactions(updatedList);
    saveToStorage(STORAGE_KEYS.WASTE_TRANSACTIONS, updatedList);
    return newTransaction;
  };

  const updateTransaction = (
    id: string,
    updates: Partial<WasteTransaction>
  ) => {
    const updatedList = transactions.map((transaction) =>
      transaction.id === id ? { ...transaction, ...updates } : transaction
    );
    setTransactions(updatedList);
    saveToStorage(STORAGE_KEYS.WASTE_TRANSACTIONS, updatedList);
  };

  const deleteTransaction = (id: string) => {
    const updatedList = transactions.filter(
      (transaction) => transaction.id !== id
    );
    setTransactions(updatedList);
    saveToStorage(STORAGE_KEYS.WASTE_TRANSACTIONS, updatedList);
  };

  // Get transactions for specific date
  const getTransactionsByDate = (date: string) => {
    return transactions.filter((transaction) => transaction.date === date);
  };

  // Get transactions for specific RT
  const getTransactionsByRT = (rt: string) => {
    return transactions.filter((transaction) => transaction.rt === rt);
  };

  // Get today's stats
  const getTodayStats = () => {
    const today = new Date().toISOString().split("T")[0];
    const todayTransactions = getTransactionsByDate(today);

    return {
      totalWeight: todayTransactions.reduce((sum, t) => sum + t.weight, 0),
      totalValue: todayTransactions.reduce((sum, t) => sum + t.totalValue, 0),
      totalTransactions: todayTransactions.length,
      totalRT: new Set(todayTransactions.map((t) => t.rt)).size,
    };
  };

  // Get recent transactions (last 10)
  const getRecentTransactions = (limit: number = 10) => {
    return transactions.slice(0, limit);
  };

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsByDate,
    getTransactionsByRT,
    getTodayStats,
    getRecentTransactions,
  };
};

// Combined hook for easy access to all data
export const useBankSampahData = () => {
  const rtData = usePersistedRT();
  const wasteTypeData = usePersistedWasteTypes();
  const transactionData = usePersistedTransactions();

  const isLoading =
    rtData.loading || wasteTypeData.loading || transactionData.loading;

  // Enhanced addTransaction that also updates RT balance
  const addTransactionWithBalance = (
    transactionInput: Omit<WasteTransaction, "id" | "createdAt">
  ) => {
    // Add the transaction
    const newTransaction = transactionData.addTransaction(transactionInput);

    // Update RT balance and transaction count
    const targetRT = rtData.rtList.find(
      (rt) => rt.nomor === transactionInput.rt
    );
    if (targetRT) {
      rtData.updateRT(targetRT.id, {
        saldo: targetRT.saldo + transactionInput.totalValue,
        totalTransaksi: targetRT.totalTransaksi + 1,
      });
    }

    return newTransaction;
  };

  return {
    // RT data
    rtList: rtData.rtList,
    addRT: rtData.addRT,
    updateRT: rtData.updateRT,
    deleteRT: rtData.deleteRT,

    // Waste types data
    wasteTypes: wasteTypeData.wasteTypes,
    addWasteType: wasteTypeData.addWasteType,
    updateWasteType: wasteTypeData.updateWasteType,
    deleteWasteType: wasteTypeData.deleteWasteType,

    // Transactions data
    transactions: transactionData.transactions,
    addTransaction: addTransactionWithBalance, // Use enhanced version
    updateTransaction: transactionData.updateTransaction,
    deleteTransaction: transactionData.deleteTransaction,
    getTransactionsByDate: transactionData.getTransactionsByDate,
    getTransactionsByRT: transactionData.getTransactionsByRT,
    getTodayStats: transactionData.getTodayStats,
    getRecentTransactions: transactionData.getRecentTransactions,

    // Loading state
    isLoading,
  };
};
