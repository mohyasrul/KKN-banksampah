import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://demo.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "demo-key";

// For development without Supabase setup
const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

if (isDemoMode) {
  console.warn("🚧 Running in DEMO mode - Supabase env variables not found");
  console.log("📝 Create .env.local file with your Supabase credentials for full functionality");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export { isDemoMode };

// Database types untuk TypeScript
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
        Update: {
          rt_id?: string;
          waste_type_id?: string;
          date?: string;
          weight?: number;
          price_per_kg?: number;
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
        Update: {
          rt_id?: string;
          type?: "deposit" | "withdrawal";
          amount?: number;
          description?: string;
          date?: string;
        };
      };
    };
  };
};
