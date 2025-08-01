# 🚀 Supabase Implementation Guide - Bank Sampah RW 10

## 📋 Overview

Guide lengkap untuk mengintegrasikan Supabase sebagai backend cloud database untuk aplikasi Bank Sampah RW 10. Supabase dipilih karena cocok dengan struktur relational data dan memberikan developer experience yang optimal.

## 🎯 Why Supabase?

- ✅ **PostgreSQL**: Database relational yang powerful
- ✅ **TypeScript Native**: Auto-generated types dari schema
- ✅ **Real-time**: Built-in real-time subscriptions
- ✅ **Simple Setup**: Minimal configuration required
- ✅ **Cost Effective**: Free tier yang generous
- ✅ **SQL Familiar**: Query menggunakan SQL standard

## 🚀 Step-by-Step Implementation

### **Step 1: Setup Supabase Project**

#### 1.1 Create Supabase Account

1. Buka [Supabase.com](https://supabase.com)
2. Sign up dengan GitHub/Google account
3. Click "New Project"
4. Pilih organization atau create new
5. Project settings:
   - **Name**: `bank-sampah-rw10`
   - **Database Password**: Generate strong password (simpan!)
   - **Region**: Singapore (closest to Indonesia)
6. Click "Create new project"
7. Wait ~2 minutes untuk project setup

#### 1.2 Get API Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   ```
   Project URL: https://xxx.supabase.co
   Project API Key (anon, public): eyJhbG...
   Project API Key (service_role, secret): eyJhbG... (jangan share!)
   ```

### **Step 2: Database Schema Setup**

#### 2.1 Create Tables via SQL Editor

1. Go to **SQL Editor** in Supabase dashboard
2. Create new query
3. Copy-paste dan execute SQL berikut:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create RT (Rukun Tetangga) table
CREATE TABLE rt (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nomor TEXT UNIQUE NOT NULL,
  ketua_rt TEXT NOT NULL,
  jumlah_kk INTEGER DEFAULT 0,
  alamat TEXT,
  kontak TEXT,
  saldo DECIMAL(15,2) DEFAULT 0,
  total_transaksi INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create waste types table
CREATE TABLE waste_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  price_per_kg DECIMAL(10,2) DEFAULT 0,
  unit TEXT DEFAULT 'kg',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create waste transactions table
CREATE TABLE waste_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rt_id UUID REFERENCES rt(id) ON DELETE CASCADE,
  waste_type_id UUID REFERENCES waste_types(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight DECIMAL(10,2) NOT NULL,
  price_per_kg DECIMAL(10,2) NOT NULL,
  total_value DECIMAL(15,2) GENERATED ALWAYS AS (weight * price_per_kg) STORED,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create savings transactions table
CREATE TABLE savings_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rt_id UUID REFERENCES rt(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('deposit', 'withdrawal')) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_waste_transactions_rt_id ON waste_transactions(rt_id);
CREATE INDEX idx_waste_transactions_date ON waste_transactions(date);
CREATE INDEX idx_savings_transactions_rt_id ON savings_transactions(rt_id);
CREATE INDEX idx_savings_transactions_date ON savings_transactions(date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to RT table
CREATE TRIGGER update_rt_updated_at
  BEFORE UPDATE ON rt
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### 2.2 Insert Default Data

Execute SQL untuk data awal:

```sql
-- Insert default waste types
INSERT INTO waste_types (name, price_per_kg, unit, description) VALUES
('Plastik', 2000, 'kg', 'Botol plastik, kemasan makanan, kantong plastik'),
('Kertas', 1500, 'kg', 'Kertas bekas, koran, majalah, buku'),
('Logam', 5000, 'kg', 'Kaleng minuman, aluminium, besi bekas'),
('Kaca', 1000, 'kg', 'Botol kaca, pecahan kaca'),
('Kardus', 1800, 'kg', 'Kardus bekas, karton packaging');

-- Insert sample RT data (optional)
INSERT INTO rt (nomor, ketua_rt, jumlah_kk, alamat) VALUES
('01', 'Pak Budi Santoso', 25, 'Jl. Mawar No. 1-25'),
('02', 'Ibu Siti Rahayu', 30, 'Jl. Melati No. 1-30'),
('03', 'Pak Ahmad Wijaya', 28, 'Jl. Kenanga No. 1-28');
```

#### 2.3 Setup Row Level Security (RLS)

Execute SQL untuk security:

```sql
-- Enable RLS on all tables
ALTER TABLE rt ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies (untuk saat ini allow all, nanti bisa diperbaiki)
CREATE POLICY "Enable all operations for all users" ON rt FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON waste_types FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON waste_transactions FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON savings_transactions FOR ALL USING (true);
```

### **Step 3: Install Supabase Client**

#### 3.1 Install Dependencies

```bash
npm install @supabase/supabase-js
```

#### 3.2 Create Environment File

Create `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**⚠️ Security:** Add `.env.local` to `.gitignore`

### **Step 4: Supabase Configuration**

#### 4.1 Supabase Client Setup

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types akan di-generate otomatis oleh Supabase CLI (optional)
export type Database = {
  public: {
    Tables: {
      rt: {
        Row: {
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
        };
        Insert: {
          nomor: string;
          ketua_rt: string;
          jumlah_kk?: number;
          alamat?: string;
          kontak?: string;
          saldo?: number;
          total_transaksi?: number;
        };
        Update: {
          nomor?: string;
          ketua_rt?: string;
          jumlah_kk?: number;
          alamat?: string;
          kontak?: string;
          saldo?: number;
          total_transaksi?: number;
        };
      };
      waste_types: {
        Row: {
          id: string;
          name: string;
          price_per_kg: number;
          unit: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          name: string;
          price_per_kg?: number;
          unit?: string;
          description?: string;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          price_per_kg?: number;
          unit?: string;
          description?: string;
          is_active?: boolean;
        };
      };
      waste_transactions: {
        Row: {
          id: string;
          rt_id: string;
          waste_type_id: string;
          date: string;
          weight: number;
          price_per_kg: number;
          total_value: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          rt_id: string;
          waste_type_id: string;
          date?: string;
          weight: number;
          price_per_kg: number;
          notes?: string;
        };
      };
      savings_transactions: {
        Row: {
          id: string;
          rt_id: string;
          type: "deposit" | "withdrawal";
          amount: number;
          description: string | null;
          date: string;
          created_at: string;
        };
        Insert: {
          rt_id: string;
          type: "deposit" | "withdrawal";
          amount: number;
          description?: string;
          date?: string;
        };
      };
    };
  };
};
```

### **Step 5: Create Supabase Hook**

Create `src/hooks/useSupabaseData.ts`:

```typescript
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";

type RT = Database["public"]["Tables"]["rt"]["Row"];
type WasteType = Database["public"]["Tables"]["waste_types"]["Row"];
type WasteTransaction =
  Database["public"]["Tables"]["waste_transactions"]["Row"];
type SavingsTransaction =
  Database["public"]["Tables"]["savings_transactions"]["Row"];

export const useSupabaseData = () => {
  const [rtList, setRTList] = useState<RT[]>([]);
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([]);
  const [transactions, setTransactions] = useState<WasteTransaction[]>([]);
  const [savingsTransactions, setSavingsTransactions] = useState<
    SavingsTransaction[]
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

    return () => {
      rtChannel.unsubscribe();
      transactionsChannel.unsubscribe();
    };
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
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
    return data;
  };

  const deleteRT = async (id: string) => {
    const { error } = await supabase.from("rt").delete().eq("id", id);

    if (error) throw error;
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

    // Update RT saldo
    const { error: updateError } = await supabase.rpc("update_rt_saldo", {
      rt_id: transactionData.rt_id,
      amount: transactionData.weight * transactionData.price_per_kg,
    });

    if (updateError) console.error("Failed to update RT saldo:", updateError);

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
    const { error: updateError } = await supabase.rpc("update_rt_saldo", {
      rt_id: transactionData.rt_id,
      amount: adjustment,
    });

    if (updateError) console.error("Failed to update RT saldo:", updateError);

    return data;
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

    // Transaction Methods
    addWasteTransaction,
    addSavingsTransaction,

    // Statistics
    getTodayStats,
    getRecentTransactions,
  };
};
```

### **Step 6: Create Database Functions**

Go back to Supabase SQL Editor dan execute:

```sql
-- Function to update RT saldo
CREATE OR REPLACE FUNCTION update_rt_saldo(rt_id UUID, amount DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE rt
  SET
    saldo = saldo + amount,
    total_transaksi = total_transaksi + 1,
    updated_at = NOW()
  WHERE id = rt_id;
END;
$$ LANGUAGE plpgsql;
```

### **Step 7: Update Components**

#### 7.1 Update App.tsx

Replace `useDatabase.mock` dengan `useSupabaseData`:

```typescript
import { useSupabaseData } from "@/hooks/useSupabaseData";

const AppContent = () => {
  const { isLoading, error } = useSupabaseData();

  // ... rest of component
};
```

#### 7.2 Update Dashboard.tsx

Replace hook usage:

```typescript
import { useSupabaseData } from "@/hooks/useSupabaseData";

export const Dashboard = () => {
  const { rtList, getTodayStats, getRecentTransactions } = useSupabaseData();

  const stats = getTodayStats();
  const recentTransactions = getRecentTransactions();

  // ... rest of component
};
```

### **Step 8: Migration from LocalStorage**

Create `src/utils/migrateToSupabase.ts`:

```typescript
import { supabase } from "@/lib/supabase";

export const migrateLocalStorageToSupabase = async () => {
  try {
    // Get existing localStorage data
    const rtData = JSON.parse(
      localStorage.getItem("bankSampahData") ||
        '{"rtList": [], "transactions": []}'
    );

    console.log("Migrating data to Supabase...");

    // Migrate RT data
    for (const rt of rtData.rtList) {
      const { error } = await supabase.from("rt").insert({
        nomor: rt.name,
        ketua_rt: rt.leader,
        jumlah_kk: rt.households,
        alamat: rt.address,
        saldo: rt.balance || 0,
      });

      if (error && error.code !== "23505") {
        // Ignore unique constraint errors
        throw error;
      }
    }

    // Clear localStorage after successful migration
    localStorage.removeItem("bankSampahData");
    console.log("Migration completed!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
};
```

### **Step 9: Environment Variables for Netlify**

1. Go to Netlify dashboard
2. Select your project
3. Go to **Site settings** → **Environment variables**
4. Add variables:
   ```
   VITE_SUPABASE_URL = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY = your-anon-key
   ```

### **Step 10: Testing & Deployment**

#### 10.1 Local Testing

```bash
npm run dev
```

- Test CRUD operations
- Check real-time updates
- Verify data persistence

#### 10.2 Production Deployment

```bash
npm run build
```

- Deploy to Netlify
- Test from multiple devices
- Verify real-time sync

## ✅ Success Checklist

- [ ] Supabase project created
- [ ] Database schema setup
- [ ] Environment variables configured
- [ ] Supabase client installed
- [ ] Hook created and integrated
- [ ] Components updated
- [ ] Migration completed
- [ ] Local testing passed
- [ ] Production deployment successful
- [ ] Multi-device sync verified

## 🎯 Benefits Achieved

- ✅ **Multi-device sync**: Data tersinkron real-time
- ✅ **Cloud backup**: Data aman di cloud
- ✅ **Scalability**: Bisa handle banyak user
- ✅ **Performance**: Query SQL yang optimal
- ✅ **Type Safety**: Full TypeScript support

## 🔧 Troubleshooting

### Common Issues:

**1. Environment variables not found**

- Check `.env.local` file exists
- Restart development server
- Verify variable names (VITE\_ prefix required)

**2. RLS (Row Level Security) errors**

- Check policies in Supabase dashboard
- Temporarily disable RLS for testing
- Verify API key permissions

**3. Real-time not working**

- Check if RLS allows SELECT
- Verify subscription setup
- Check browser network tab

**4. Migration issues**

- Check console for error messages
- Verify localStorage data format
- Test with small data sets first

## 🚀 Next Steps

After successful implementation:

1. **Add Authentication** (optional)
2. **Improve RLS policies** untuk security
3. **Add data backup/export** features
4. **Monitor usage** via Supabase dashboard
5. **Optimize queries** berdasarkan usage patterns

---

**Supabase implementation akan memberikan foundation yang solid untuk aplikasi Bank Sampah RW 10 yang scalable dan modern! 🎉**
