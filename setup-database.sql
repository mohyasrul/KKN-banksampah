-- Setup Database untuk Bank Sampah RW 10
-- Execute this script in Supabase SQL Editor

-- 1. Run the main schema first (from supabase-schema.sql)
-- 2. Then run this script for sample data

-- Insert sample RT data
INSERT INTO rt (nomor, ketua_rt, jumlah_kk, alamat, kontak, saldo) VALUES
('001', 'Bapak Sumarno', 25, 'Jl. Merdeka No. 1', '081234567801', 150000),
('002', 'Ibu Sari Wahyuni', 30, 'Jl. Merdeka No. 2', '081234567802', 200000),
('003', 'Bapak Ahmad Yani', 28, 'Jl. Merdeka No. 3', '081234567803', 175000),
('004', 'Ibu Dewi Sartika', 22, 'Jl. Merdeka No. 4', '081234567804', 125000),
('005', 'Bapak Bambang Sutrisno', 35, 'Jl. Merdeka No. 5', '081234567805', 250000)
ON CONFLICT (nomor) DO NOTHING;

-- Insert sample waste types
INSERT INTO waste_types (name, price_per_kg, unit, description, is_active) VALUES
('Plastik', 2000, 'kg', 'Botol plastik, kemasan plastik, kantong plastik bersih', true),
('Kertas', 1500, 'kg', 'Kertas bekas, koran, majalah, kardus', true),
('Kaleng', 3000, 'kg', 'Kaleng minuman, kaleng makanan', true),
('Botol Kaca', 500, 'kg', 'Botol kaca bening, botol kaca warna', true),
('Logam', 4000, 'kg', 'Besi, aluminium, tembaga', true),
('Elektronik', 1000, 'kg', 'Komponen elektronik, kabel', true)
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE rt ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your needs)
-- For development/demo purposes, allowing full access
-- In production, you should implement proper auth-based policies

CREATE POLICY "Allow all operations on rt" ON rt
FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on waste_types" ON waste_types
FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on waste_transactions" ON waste_transactions
FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on savings_transactions" ON savings_transactions
FOR ALL TO public USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rt_nomor ON rt(nomor);
CREATE INDEX IF NOT EXISTS idx_waste_transactions_rt_id ON waste_transactions(rt_id);
CREATE INDEX IF NOT EXISTS idx_waste_transactions_date ON waste_transactions(date);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_rt_id ON savings_transactions(rt_id);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_date ON savings_transactions(date);

-- Create function to update RT saldo automatically
CREATE OR REPLACE FUNCTION update_rt_saldo()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update saldo for waste transactions
    IF TG_TABLE_NAME = 'waste_transactions' THEN
      UPDATE rt 
      SET saldo = saldo + NEW.total_value,
          total_transaksi = total_transaksi + 1,
          updated_at = NOW()
      WHERE id = NEW.rt_id;
    END IF;
    
    -- Update saldo for savings transactions
    IF TG_TABLE_NAME = 'savings_transactions' THEN
      UPDATE rt 
      SET saldo = CASE 
        WHEN NEW.type = 'deposit' THEN saldo + NEW.amount
        WHEN NEW.type = 'withdrawal' THEN saldo - NEW.amount
        ELSE saldo
      END,
      updated_at = NOW()
      WHERE id = NEW.rt_id;
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_rt_saldo_waste ON waste_transactions;
CREATE TRIGGER trigger_update_rt_saldo_waste
  AFTER INSERT ON waste_transactions
  FOR EACH ROW EXECUTE FUNCTION update_rt_saldo();

DROP TRIGGER IF EXISTS trigger_update_rt_saldo_savings ON savings_transactions;
CREATE TRIGGER trigger_update_rt_saldo_savings
  AFTER INSERT ON savings_transactions
  FOR EACH ROW EXECUTE FUNCTION update_rt_saldo();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for RT table
DROP TRIGGER IF EXISTS update_rt_updated_at ON rt;
CREATE TRIGGER update_rt_updated_at
    BEFORE UPDATE ON rt
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample transactions for demo
WITH rt_sample AS (
  SELECT id, nomor FROM rt LIMIT 3
),
waste_sample AS (
  SELECT id, name FROM waste_types WHERE name IN ('Plastik', 'Kertas', 'Kaleng')
)
INSERT INTO waste_transactions (rt_id, waste_type_id, weight, price_per_kg, date, notes)
SELECT 
  rt.id,
  wt.id,
  (RANDOM() * 10 + 1)::DECIMAL(10,2), -- Random weight between 1-11 kg
  CASE 
    WHEN wt.name = 'Plastik' THEN 2000
    WHEN wt.name = 'Kertas' THEN 1500
    WHEN wt.name = 'Kaleng' THEN 3000
  END,
  CURRENT_DATE - (RANDOM() * 30)::INTEGER, -- Random date within last 30 days
  'Sample transaction for demo'
FROM rt_sample rt, waste_sample wt
ON CONFLICT DO NOTHING;

-- Verify setup
SELECT 'RT Count' as table_name, COUNT(*) as count FROM rt
UNION ALL
SELECT 'Waste Types Count', COUNT(*) FROM waste_types
UNION ALL
SELECT 'Waste Transactions Count', COUNT(*) FROM waste_transactions
UNION ALL
SELECT 'Savings Transactions Count', COUNT(*) FROM savings_transactions;

-- Show sample data
SELECT 'Sample RT data:' as info;
SELECT nomor, ketua_rt, saldo FROM rt LIMIT 5;

SELECT 'Sample Waste Types:' as info;
SELECT name, price_per_kg FROM waste_types WHERE is_active = true;

SELECT 'Recent Transactions:' as info;
SELECT 
  rt.nomor,
  wt.name as waste_type,
  tr.weight,
  tr.total_value,
  tr.date
FROM waste_transactions tr
JOIN rt ON rt.id = tr.rt_id
JOIN waste_types wt ON wt.id = tr.waste_type_id
ORDER BY tr.created_at DESC
LIMIT 10;
