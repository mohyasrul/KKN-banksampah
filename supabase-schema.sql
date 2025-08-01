-- Bank Sampah RW 10 Database Schema
-- Execute this script in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create RT (Rukun Tetangga) table
CREATE TABLE IF NOT EXISTS rt (
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
CREATE TABLE IF NOT EXISTS waste_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  price_per_kg DECIMAL(10,2) DEFAULT 0,
  unit TEXT DEFAULT 'kg',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create waste transactions table
CREATE TABLE IF NOT EXISTS waste_transactions (
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
CREATE TABLE IF NOT EXISTS savings_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rt_id UUID REFERENCES rt(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('deposit', 'withdrawal')) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_waste_transactions_rt_id ON waste_transactions(rt_id);
CREATE INDEX IF NOT EXISTS idx_waste_transactions_date ON waste_transactions(date);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_rt_id ON savings_transactions(rt_id);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_date ON savings_transactions(date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to RT table
DROP TRIGGER IF EXISTS update_rt_updated_at ON rt;
CREATE TRIGGER update_rt_updated_at
  BEFORE UPDATE ON rt
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default waste types
INSERT INTO waste_types (name, price_per_kg, unit, description) VALUES
('Plastik', 2000, 'kg', 'Botol plastik, kemasan makanan, kantong plastik'),
('Kertas', 1500, 'kg', 'Kertas bekas, koran, majalah, buku'),
('Logam', 5000, 'kg', 'Kaleng minuman, aluminium, besi bekas'),
('Kaca', 1000, 'kg', 'Botol kaca, pecahan kaca'),
('Kardus', 1800, 'kg', 'Kardus bekas, karton packaging')
ON CONFLICT (name) DO NOTHING;

-- Insert sample RT data (optional for testing)
INSERT INTO rt (nomor, ketua_rt, jumlah_kk, alamat) VALUES
('01', 'Pak Budi Santoso', 25, 'Jl. Mawar No. 1-25'),
('02', 'Ibu Siti Rahayu', 30, 'Jl. Melati No. 1-30'),
('03', 'Pak Ahmad Wijaya', 28, 'Jl. Kenanga No. 1-28')
ON CONFLICT (nomor) DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE rt ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies (for now allow all operations, can be refined later)
DROP POLICY IF EXISTS "Enable all operations for all users" ON rt;
CREATE POLICY "Enable all operations for all users" ON rt FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for all users" ON waste_types;
CREATE POLICY "Enable all operations for all users" ON waste_types FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for all users" ON waste_transactions;
CREATE POLICY "Enable all operations for all users" ON waste_transactions FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for all users" ON savings_transactions;
CREATE POLICY "Enable all operations for all users" ON savings_transactions FOR ALL USING (true);

-- Helper function to update RT saldo
CREATE OR REPLACE FUNCTION update_rt_saldo(rt_uuid UUID, amount_change DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE rt
  SET
    saldo = saldo + amount_change,
    total_transaksi = total_transaksi + 1,
    updated_at = NOW()
  WHERE id = rt_uuid;
END;
$$ LANGUAGE plpgsql;
