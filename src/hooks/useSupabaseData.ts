import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";

type RT = Database["public"]["Tables"]["rt"]["Row"];
type WasteType = Database["public"]["Tables"]["waste_types"]["Row"];
type WasteTransaction =
  Database["public"]["Tables"]["waste_transactions"]["Row"];
type SavingsTransaction =
  Database["public"]["Tables"]["savings_transactions"]["Row"];

// Extended types dengan relasi
type WasteTransactionWithDetails = WasteTransaction & {
  rt?: { nomor: string; ketua_rt: string };
  waste_type?: { name: string };
};

type SavingsTransactionWithDetails = SavingsTransaction & {
  rt?: { nomor: string; ketua_rt: string };
};

export const useSupabaseData = () => {
  const [rtList, setRTList] = useState<RT[]>([]);
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([]);
  const [transactions, setTransactions] = useState<
    WasteTransactionWithDetails[]
  >([]);
  const [savingsTransactions, setSavingsTransactions] = useState<
    SavingsTransactionWithDetails[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Setup real-time subscriptions
  useEffect(() => {
    const rtChannel = supabase
      .channel("rt-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rt" },
        () => loadRTList()
      )
      .subscribe();

    const transactionsChannel = supabase
      .channel("transactions-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "waste_transactions" },
        () => loadTransactions()
      )
      .subscribe();

    const savingsChannel = supabase
      .channel("savings-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "savings_transactions" },
        () => loadSavingsTransactions()
      )
      .subscribe();

    return () => {
      rtChannel.unsubscribe();
      transactionsChannel.unsubscribe();
      savingsChannel.unsubscribe();
    };
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await Promise.all([
        loadRTList(),
        loadWasteTypes(),
        loadTransactions(),
        loadSavingsTransactions(),
      ]);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const loadRTList = async () => {
    const { data, error } = await supabase
      .from("rt")
      .select("*")
      .order("nomor");

    if (error) throw error;
    setRTList(data || []);
  };

  const loadWasteTypes = async () => {
    const { data, error } = await supabase
      .from("waste_types")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    setWasteTypes(data || []);
  };

  const loadTransactions = async () => {
    const { data, error } = await supabase
      .from("waste_transactions")
      .select(
        `
        *,
        rt:rt_id (nomor, ketua_rt),
        waste_type:waste_type_id (name)
      `
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    setTransactions(data || []);
  };

  const loadSavingsTransactions = async () => {
    const { data, error } = await supabase
      .from("savings_transactions")
      .select(
        `
        *,
        rt:rt_id (nomor, ketua_rt)
      `
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    setSavingsTransactions(data || []);
  };

  // RT Management
  const addRT = async (
    rtData: Database["public"]["Tables"]["rt"]["Insert"]
  ) => {
    const { data, error } = await supabase
      .from("rt")
      .insert(rtData)
      .select()
      .single();

    if (error) throw error;
    await loadRTList(); // Refresh data
    return data;
  };

  const updateRT = async (
    id: string,
    rtData: Database["public"]["Tables"]["rt"]["Update"]
  ) => {
    const { data, error } = await supabase
      .from("rt")
      .update(rtData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    await loadRTList(); // Refresh data
    return data;
  };

  const deleteRT = async (id: string) => {
    const { error } = await supabase.from("rt").delete().eq("id", id);

    if (error) throw error;
    await loadRTList(); // Refresh data
  };

  // Waste Type Management
  const addWasteType = async (
    wasteTypeData: Database["public"]["Tables"]["waste_types"]["Insert"]
  ) => {
    const { data, error } = await supabase
      .from("waste_types")
      .insert(wasteTypeData)
      .select()
      .single();

    if (error) throw error;
    await loadWasteTypes(); // Refresh data
    return data;
  };

  // Transaction Management
  const addWasteTransaction = async (
    transactionData: Database["public"]["Tables"]["waste_transactions"]["Insert"]
  ) => {
    const { data, error } = await supabase
      .from("waste_transactions")
      .insert(transactionData)
      .select()
      .single();

    if (error) throw error;

    // Update RT saldo dan total transaksi
    const totalValue = transactionData.weight * transactionData.price_per_kg;
    await updateRTSaldo(transactionData.rt_id, totalValue);

    await loadTransactions(); // Refresh data
    await loadRTList(); // Refresh RT data
    return data;
  };

  const addSavingsTransaction = async (
    transactionData: Database["public"]["Tables"]["savings_transactions"]["Insert"]
  ) => {
    const { data, error } = await supabase
      .from("savings_transactions")
      .insert(transactionData)
      .select()
      .single();

    if (error) throw error;

    // Update RT saldo
    const adjustment =
      transactionData.type === "withdrawal"
        ? -transactionData.amount
        : transactionData.amount;
    await updateRTSaldo(transactionData.rt_id, adjustment);

    await loadSavingsTransactions(); // Refresh data
    await loadRTList(); // Refresh RT data
    return data;
  };

  // Helper function untuk update saldo RT
  const updateRTSaldo = async (rtId: string, amount: number) => {
    const rt = rtList.find((r) => r.id === rtId);
    if (rt) {
      await supabase
        .from("rt")
        .update({
          saldo: rt.saldo + amount,
          total_transaksi: rt.total_transaksi + 1,
        })
        .eq("id", rtId);
    }
  };

  // Statistics
  const getTodayStats = () => {
    const today = new Date().toISOString().split("T")[0];
    const todayTransactions = transactions.filter((t) => t.date === today);

    return {
      totalWeight: todayTransactions.reduce((sum, t) => sum + t.weight, 0),
      totalValue: todayTransactions.reduce((sum, t) => sum + t.total_value, 0),
      transactionCount: todayTransactions.length,
      totalRTs: rtList.length,
      totalSaldo: rtList.reduce((sum, rt) => sum + rt.saldo, 0),
    };
  };

  const getRecentTransactions = (limit: number = 5) => {
    return transactions.slice(0, limit);
  };

  // Get RT by ID
  const getRTById = (id: string) => {
    return rtList.find((rt) => rt.id === id);
  };

  // Get waste type by ID
  const getWasteTypeById = (id: string) => {
    return wasteTypes.find((wt) => wt.id === id);
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

    // RT Methods
    addRT,
    updateRT,
    deleteRT,
    getRTById,

    // Waste Type Methods
    addWasteType,
    getWasteTypeById,

    // Transaction Methods
    addWasteTransaction,
    addSavingsTransaction,

    // Statistics
    getTodayStats,
    getRecentTransactions,

    // Refresh methods
    loadInitialData,
  };
};
