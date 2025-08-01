import { supabase } from "@/lib/supabase";

interface LocalStorageRT {
  id: number;
  name: string;
  leader: string;
  households: number;
  address?: string;
  balance?: number;
}

interface LocalStorageTransaction {
  id: number;
  rtId: number;
  date: string;
  wasteType: string;
  weight: number;
  pricePerKg: number;
  totalValue: number;
  notes?: string;
}

interface LocalStorageData {
  rtList: LocalStorageRT[];
  transactions: LocalStorageTransaction[];
  wasteTypes?: { name: string; price: number }[];
}

export const migrateLocalStorageToSupabase = async () => {
  try {
    console.log("🚀 Starting migration from localStorage to Supabase...");

    // Get existing localStorage data
    const localData = localStorage.getItem("bankSampahData");
    if (!localData) {
      console.log("📝 No localStorage data found to migrate");
      return { success: true, message: "No data to migrate" };
    }

    const parsedData: LocalStorageData = JSON.parse(localData);
    console.log("📊 Found data:", {
      rtCount: parsedData.rtList?.length || 0,
      transactionCount: parsedData.transactions?.length || 0,
      wasteTypeCount: parsedData.wasteTypes?.length || 0,
    });

    // 1. Migrate waste types first (if any)
    const defaultWasteTypes = [
      {
        name: "Plastik",
        price_per_kg: 2000,
        unit: "kg",
        description: "Botol plastik, kemasan makanan, kantong plastik",
      },
      {
        name: "Kertas",
        price_per_kg: 1500,
        unit: "kg",
        description: "Kertas bekas, koran, majalah, buku",
      },
      {
        name: "Logam",
        price_per_kg: 5000,
        unit: "kg",
        description: "Kaleng minuman, aluminium, besi bekas",
      },
      {
        name: "Kaca",
        price_per_kg: 1000,
        unit: "kg",
        description: "Botol kaca, pecahan kaca",
      },
      {
        name: "Kardus",
        price_per_kg: 1800,
        unit: "kg",
        description: "Kardus bekas, karton packaging",
      },
    ];

    console.log("🗂️ Migrating waste types...");
    const wasteTypeMap = new Map<string, string>(); // name -> id mapping

    for (const wasteType of defaultWasteTypes) {
      const { data, error } = await supabase
        .from("waste_types")
        .upsert(wasteType, { onConflict: "name" })
        .select("id, name")
        .single();

      if (error && error.code !== "23505") {
        // Ignore unique constraint errors
        console.warn("⚠️ Error inserting waste type:", wasteType.name, error);
      } else if (data) {
        wasteTypeMap.set(data.name, data.id);
        console.log("✅ Waste type migrated:", data.name);
      }
    }

    // 2. Migrate RT data
    console.log("🏠 Migrating RT data...");
    const rtIdMap = new Map<number, string>(); // old_id -> new_uuid mapping

    if (parsedData.rtList && parsedData.rtList.length > 0) {
      for (const rt of parsedData.rtList) {
        const rtData = {
          nomor: rt.name.replace(/\D/g, "") || rt.id.toString(), // Extract number from name
          ketua_rt: rt.leader,
          jumlah_kk: rt.households,
          alamat: rt.address || null,
          saldo: rt.balance || 0,
          total_transaksi: 0,
        };

        const { data, error } = await supabase
          .from("rt")
          .upsert(rtData, { onConflict: "nomor" })
          .select("id, nomor")
          .single();

        if (error && error.code !== "23505") {
          console.warn("⚠️ Error inserting RT:", rt.name, error);
        } else if (data) {
          rtIdMap.set(rt.id, data.id);
          console.log("✅ RT migrated:", `RT ${data.nomor} - ${rt.leader}`);
        }
      }
    }

    // 3. Migrate transactions
    console.log("💰 Migrating transactions...");
    let migratedTransactions = 0;

    if (parsedData.transactions && parsedData.transactions.length > 0) {
      for (const transaction of parsedData.transactions) {
        const rtId = rtIdMap.get(transaction.rtId);
        const wasteTypeId =
          wasteTypeMap.get(transaction.wasteType) ||
          wasteTypeMap.get("Plastik"); // fallback to Plastik

        if (!rtId || !wasteTypeId) {
          console.warn(
            "⚠️ Skipping transaction - missing RT or waste type:",
            transaction
          );
          continue;
        }

        const transactionData = {
          rt_id: rtId,
          waste_type_id: wasteTypeId,
          date: transaction.date,
          weight: transaction.weight,
          price_per_kg: transaction.pricePerKg,
          notes: transaction.notes || null,
        };

        const { error } = await supabase
          .from("waste_transactions")
          .insert(transactionData);

        if (error) {
          console.warn("⚠️ Error inserting transaction:", transaction, error);
        } else {
          migratedTransactions++;

          // Update RT saldo and transaction count
          const { data: currentRT } = await supabase
            .from("rt")
            .select("saldo, total_transaksi")
            .eq("id", rtId)
            .single();

          if (currentRT) {
            await supabase
              .from("rt")
              .update({
                saldo: currentRT.saldo + transaction.totalValue,
                total_transaksi: currentRT.total_transaksi + 1,
              })
              .eq("id", rtId);
          }
        }
      }
    }

    // 4. Create backup of localStorage data before clearing
    const backupData = {
      ...parsedData,
      migrationDate: new Date().toISOString(),
      migratedCounts: {
        rtCount: rtIdMap.size,
        transactionCount: migratedTransactions,
        wasteTypeCount: wasteTypeMap.size,
      },
    };

    localStorage.setItem("bankSampahData_backup", JSON.stringify(backupData));
    localStorage.removeItem("bankSampahData");

    const result = {
      success: true,
      message: "Migration completed successfully!",
      migrated: {
        rtCount: rtIdMap.size,
        transactionCount: migratedTransactions,
        wasteTypeCount: wasteTypeMap.size,
      },
    };

    console.log("🎉 Migration completed:", result);
    return result;
  } catch (error) {
    console.error("❌ Migration failed:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
      error,
    };
  }
};

// Function to restore from backup if needed
export const restoreFromBackup = () => {
  const backup = localStorage.getItem("bankSampahData_backup");
  if (backup) {
    const { migrationDate, migratedCounts, ...originalData } =
      JSON.parse(backup);
    localStorage.setItem("bankSampahData", JSON.stringify(originalData));
    return true;
  }
  return false;
};

// Function to check if migration is needed
export const needsMigration = () => {
  const hasLocalData = localStorage.getItem("bankSampahData") !== null;
  const hasBackup = localStorage.getItem("bankSampahData_backup") !== null;
  return hasLocalData && !hasBackup;
};
