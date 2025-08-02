import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface WastePrice {
  id: string;
  name: string;
  price: number;
  unit: string;
}

interface AppSettings {
  autoBackup: boolean;
  notifications: boolean;
  emailReports: boolean;
  whatsappNotifications: boolean;
  dataRetentionDays: number;
  rwName: string;
  contactPerson: string;
  contactPhone: string;
  address: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  autoBackup: true,
  notifications: true,
  emailReports: false,
  whatsappNotifications: true,
  dataRetentionDays: 365,
  rwName: "RW 10 Kelurahan Mawar",
  contactPerson: "Ketua RW",
  contactPhone: "081234567890",
  address: "Jl. Mawar Raya No. 123, Jakarta",
};

export const useSettings = () => {
  const [wastePrices, setWastePrices] = useState<WastePrice[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings from localStorage and Supabase
  useEffect(() => {
    loadSettings();
    loadWastePrices();
  }, []);

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem("bank_sampah_settings");
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        setAppSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const loadWastePrices = async () => {
    try {
      setIsLoading(true);

      // Load from Supabase waste_types table
      const { data, error } = await supabase
        .from("waste_types")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;

      if (data && data.length > 0) {
        const prices = data.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price_per_kg,
          unit: item.unit || "kg",
        }));
        setWastePrices(prices);
      } else {
        // Fallback to default prices if no data in Supabase
        const defaultPrices = [
          { id: "plastik", name: "Plastik", price: 5000, unit: "kg" },
          { id: "kertas", name: "Kertas", price: 3000, unit: "kg" },
          { id: "logam", name: "Logam", price: 8000, unit: "kg" },
          { id: "kaca", name: "Kaca", price: 2000, unit: "kg" },
          { id: "kardus", name: "Kardus", price: 2500, unit: "kg" },
        ];
        setWastePrices(defaultPrices);
      }
    } catch (err) {
      console.error("Error loading waste prices:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      // Save to localStorage
      localStorage.setItem("bank_sampah_settings", JSON.stringify(appSettings));

      // Save waste prices to Supabase
      for (const price of wastePrices) {
        const { error } = await supabase.from("waste_types").upsert({
          id: price.id,
          name: price.name,
          price_per_kg: price.price,
          unit: price.unit,
          is_active: true,
        });

        if (error) throw error;
      }

      return { success: true };
    } catch (error) {
      console.error("Error saving settings:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  const updateWastePrice = (id: string, newPrice: number) => {
    setWastePrices((prev) =>
      prev.map((item) => (item.id === id ? { ...item, price: newPrice } : item))
    );
  };

  const updateAppSettings = (newSettings: Partial<AppSettings>) => {
    setAppSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Backup data to JSON file
  const backupData = async () => {
    try {
      // Get all data from Supabase
      const [rtData, transactionsData, savingsData] = await Promise.all([
        supabase.from("rt").select("*"),
        supabase.from("waste_transactions").select("*"),
        supabase.from("savings_transactions").select("*"),
      ]);

      const backupData = {
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        data: {
          rt: rtData.data || [],
          waste_transactions: transactionsData.data || [],
          savings_transactions: savingsData.data || [],
          waste_types: wastePrices,
          settings: appSettings,
        },
      };

      // Create and download backup file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bank_sampah_backup_${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error("Error backing up data:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  // Restore data from JSON file
  const restoreData = (
    file: File
  ): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const backupData = JSON.parse(e.target?.result as string);

          // Validate backup structure
          if (!backupData.data) {
            throw new Error("Invalid backup file format");
          }

          // Restore data to Supabase (in real app, would need proper restoration logic)
          console.log("Restoring data:", backupData);

          // Update local state
          if (backupData.data.waste_types) {
            setWastePrices(backupData.data.waste_types);
          }
          if (backupData.data.settings) {
            setAppSettings(backupData.data.settings);
          }

          resolve({ success: true });
        } catch (error) {
          console.error("Error restoring data:", error);
          resolve({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      };
      reader.readAsText(file);
    });
  };

  // Reset all data
  const resetData = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem("bank_sampah_settings");

      // Reset states
      setAppSettings(DEFAULT_SETTINGS);
      setWastePrices([
        { id: "plastik", name: "Plastik", price: 5000, unit: "kg" },
        { id: "kertas", name: "Kertas", price: 3000, unit: "kg" },
        { id: "logam", name: "Logam", price: 8000, unit: "kg" },
        { id: "kaca", name: "Kaca", price: 2000, unit: "kg" },
        { id: "kardus", name: "Kardus", price: 2500, unit: "kg" },
      ]);

      return { success: true };
    } catch (error) {
      console.error("Error resetting data:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  // Get system stats
  const getSystemStats = async () => {
    try {
      const [rtCount, transactionCount] = await Promise.all([
        supabase.from("rt").select("id", { count: "exact" }),
        supabase.from("waste_transactions").select("id", { count: "exact" }),
      ]);

      // Calculate database size (approximate)
      const estimatedSize = (
        (rtCount.count || 0) * 0.5 + // ~0.5KB per RT
        (transactionCount.count || 0) * 1.0
      ) // ~1KB per transaction
        .toFixed(1);

      return {
        totalRTs: rtCount.count || 0,
        totalTransactions: transactionCount.count || 0,
        databaseSize: `${estimatedSize} KB`,
        version: "1.0.0",
        status: "Online",
      };
    } catch (error) {
      console.error("Error getting system stats:", error);
      return {
        totalRTs: 0,
        totalTransactions: 0,
        databaseSize: "0 KB",
        version: "1.0.0",
        status: "Error",
      };
    }
  };

  // Sync data between local and remote
  const syncData = async () => {
    try {
      // Reload waste prices from Supabase
      await loadWastePrices();

      // Sync could also include other data synchronization logic
      return { success: true };
    } catch (error) {
      console.error("Error syncing data:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  return {
    // State
    wastePrices,
    appSettings,
    isLoading,
    error,

    // Actions
    updateWastePrice,
    updateAppSettings,
    saveSettings,
    backupData,
    restoreData,
    resetData,
    getSystemStats,
    syncData,
    loadWastePrices,
  };
};
