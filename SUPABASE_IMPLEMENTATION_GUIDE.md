# 🗃️ Panduan Implementasi Database Supabase - Bank Sampah RW 10

## 🎯 Tujuan
Panduan step-by-step untuk mengimplementasikan database schema Bank Sampah RW 10 di Supabase dengan sistem pajak 10% dan konfigurasi lengkap.

---

## ⚠️ PERSIAPAN PENTING

### 1. **BACKUP Data Existing (WAJIB!)**
Jika Anda sudah memiliki data di Supabase, backup terlebih dahulu:

```sql
-- Copy semua data existing ke file backup
SELECT * FROM rt;
SELECT * FROM waste_types; 
SELECT * FROM waste_transactions;
SELECT * FROM savings_transactions;
```

### 2. **Akses Supabase SQL Editor**
1. Login ke dashboard Supabase
2. Pilih project Bank Sampah RW 10
3. Buka menu **SQL Editor** di sidebar kiri
4. Klik **"New query"**

---

## 🚀 IMPLEMENTASI STEP-BY-STEP

### **STEP 1: Enable Extensions dan Cek Status**

**Copy dan execute script ini:**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cek extension berhasil
SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';
```

**✅ Expected Result:** 
- Menampilkan 1 row dengan `extname = uuid-ossp`
- Jika sudah ada, akan muncul notice "extension already exists"

---

### **STEP 2: Create Core Tables**

**Execute satu per satu untuk kontrol yang lebih baik:**

#### 2A. Create RT Table
```sql
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
```

**✅ Verification:**
```sql
-- Cek table RT berhasil dibuat
\d rt
-- ATAU
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'rt' ORDER BY ordinal_position;
```

#### 2B. Create Waste Types Table
```sql
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
```

#### 2C. Create Waste Transactions Table
```sql
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
```

---

### **STEP 3: Create Enhanced Savings Transactions Table**

**⚠️ PENTING: Jika table `savings_transactions` sudah ada dengan data:**

#### Option A: Table Baru (Fresh Install)
```sql
-- Create savings transactions table dengan kolom pajak
CREATE TABLE IF NOT EXISTS savings_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rt_id UUID REFERENCES rt(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('deposit', 'withdrawal')) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  amount_after_tax DECIMAL(15,2),
  tax_rate DECIMAL(5,4) DEFAULT 0,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Option B: Table Sudah Ada (Add Columns)
```sql
-- HANYA jika table savings_transactions sudah ada
ALTER TABLE savings_transactions 
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(15,2) DEFAULT 0;

ALTER TABLE savings_transactions 
ADD COLUMN IF NOT EXISTS amount_after_tax DECIMAL(15,2);

ALTER TABLE savings_transactions 
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,4) DEFAULT 0;
```

**✅ Verification:**
```sql
-- Cek kolom pajak sudah ada
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'savings_transactions' 
AND column_name IN ('tax_amount', 'amount_after_tax', 'tax_rate');
-- Should return 3 rows
```

---

### **STEP 4: Create App Settings Table**

```sql
-- Create app settings table untuk konfigurasi
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  data_type TEXT CHECK (data_type IN ('string', 'number', 'boolean', 'json')) DEFAULT 'string',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**✅ Verification:**
```sql
-- Cek app_settings table
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'app_settings';
-- Should return 1
```

---

### **STEP 5: Create Indexes untuk Performance**

```sql
-- Create indexes untuk performance
CREATE INDEX IF NOT EXISTS idx_waste_transactions_rt_id ON waste_transactions(rt_id);
CREATE INDEX IF NOT EXISTS idx_waste_transactions_date ON waste_transactions(date);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_rt_id ON savings_transactions(rt_id);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_date ON savings_transactions(date);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_type ON savings_transactions(type);
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(setting_key);
```

**✅ Verification:**
```sql
-- Cek indexes berhasil dibuat
SELECT indexname FROM pg_indexes WHERE tablename IN ('waste_transactions', 'savings_transactions', 'app_settings');
```

---

### **STEP 6: Create Functions dan Triggers**

#### 6A. Updated At Trigger Function
```sql
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

#### 6B. Add Triggers
```sql
-- Add trigger to RT table
DROP TRIGGER IF EXISTS update_rt_updated_at ON rt;
CREATE TRIGGER update_rt_updated_at
  BEFORE UPDATE ON rt
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to app_settings table
DROP TRIGGER IF EXISTS update_app_settings_updated_at ON app_settings;
CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### 6C. Business Logic Functions
```sql
-- Helper function untuk update RT saldo
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
```

```sql
-- Function untuk kalkulasi pajak withdrawal
CREATE OR REPLACE FUNCTION calculate_withdrawal_tax(withdrawal_amount DECIMAL)
RETURNS TABLE(
  tax_amount DECIMAL,
  amount_after_tax DECIMAL,
  tax_rate DECIMAL
) AS $$
DECLARE
  current_tax_rate DECIMAL;
BEGIN
  -- Get current tax rate from settings
  SELECT CAST(setting_value AS DECIMAL) INTO current_tax_rate
  FROM app_settings 
  WHERE setting_key = 'tax_rate' AND is_active = true;
  
  -- Default to 10% if not found
  IF current_tax_rate IS NULL THEN
    current_tax_rate := 0.10;
  END IF;
  
  RETURN QUERY SELECT 
    withdrawal_amount * current_tax_rate,
    withdrawal_amount - (withdrawal_amount * current_tax_rate),
    current_tax_rate;
END;
$$ LANGUAGE plpgsql;
```

```sql
-- Function untuk get minimum withdrawal amount
CREATE OR REPLACE FUNCTION get_min_withdrawal_amount()
RETURNS DECIMAL AS $$
DECLARE
  min_amount DECIMAL;
BEGIN
  SELECT CAST(setting_value AS DECIMAL) INTO min_amount
  FROM app_settings 
  WHERE setting_key = 'min_withdrawal_amount' AND is_active = true;
  
  -- Default to 50000 if not found
  IF min_amount IS NULL THEN
    min_amount := 50000;
  END IF;
  
  RETURN min_amount;
END;
$$ LANGUAGE plpgsql;
```

**✅ Test Functions:**
```sql
-- Test tax calculation function
SELECT * FROM calculate_withdrawal_tax(100000);
-- Expected: tax_amount: 10000, amount_after_tax: 90000, tax_rate: 0.10

-- Test min withdrawal function  
SELECT get_min_withdrawal_amount();
-- Expected: 50000 (default value)
```

---

### **STEP 7: Insert Default Data**

#### 7A. Insert Default Waste Types
```sql
-- Insert default waste types
INSERT INTO waste_types (name, price_per_kg, unit, description) VALUES
('Plastik', 2000, 'kg', 'Botol plastik, kemasan makanan, kantong plastik'),
('Kertas', 1500, 'kg', 'Kertas bekas, koran, majalah, buku'),
('Logam', 5000, 'kg', 'Kaleng minuman, aluminium, besi bekas'),
('Kaca', 1000, 'kg', 'Botol kaca, pecahan kaca'),
('Kardus', 1800, 'kg', 'Kardus bekas, karton packaging')
ON CONFLICT (name) DO NOTHING;
```

**✅ Verification:**
```sql
SELECT name, price_per_kg FROM waste_types ORDER BY name;
-- Should return 5 rows
```

#### 7B. Insert App Settings
```sql
-- Insert default app settings
INSERT INTO app_settings (setting_key, setting_value, data_type, description) VALUES
('tax_rate', '0.10', 'number', 'Tax rate for withdrawals (10%)'),
('min_withdrawal_amount', '50000', 'number', 'Minimum withdrawal amount in Rupiah'),
('app_name', 'Bank Sampah RW 10', 'string', 'Application name'),
('price_per_kg_default', '2000', 'number', 'Default price per kg for waste'),
('auto_backup_enabled', 'true', 'boolean', 'Enable automatic backup')
ON CONFLICT (setting_key) DO NOTHING;
```

**✅ Verification:**
```sql
SELECT setting_key, setting_value FROM app_settings ORDER BY setting_key;
-- Should return 5 rows with correct values
```

#### 7C. Insert Sample RT Data (Optional)
```sql
-- Insert sample RT data untuk testing
INSERT INTO rt (nomor, ketua_rt, jumlah_kk, alamat) VALUES
('01', 'Pak Budi Santoso', 25, 'Jl. Mawar No. 1-25'),
('02', 'Ibu Siti Rahayu', 30, 'Jl. Melati No. 1-30'),
('03', 'Pak Ahmad Wijaya', 28, 'Jl. Kenanga No. 1-28')
ON CONFLICT (nomor) DO NOTHING;
```

**✅ Verification:**
```sql
SELECT nomor, ketua_rt, saldo FROM rt ORDER BY nomor;
-- Should return 3 rows with saldo = 0
```

---

### **STEP 8: Setup Row Level Security (RLS)**

```sql
-- Enable RLS pada semua tables
ALTER TABLE rt ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
```

```sql
-- Create policies (sementara allow all, bisa refined nanti)
DROP POLICY IF EXISTS "Enable all operations for all users" ON rt;
CREATE POLICY "Enable all operations for all users" ON rt FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for all users" ON waste_types;
CREATE POLICY "Enable all operations for all users" ON waste_types FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for all users" ON waste_transactions;
CREATE POLICY "Enable all operations for all users" ON waste_transactions FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for all users" ON savings_transactions;
CREATE POLICY "Enable all operations for all users" ON savings_transactions FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for all users" ON app_settings;
CREATE POLICY "Enable all operations for all users" ON app_settings FOR ALL USING (true);
```

---

## ✅ FINAL VERIFICATION

### **Database Health Check**

```sql
-- 1. Cek semua tables ada
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
-- Expected: app_settings, rt, savings_transactions, waste_transactions, waste_types

-- 2. Cek tax system columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'savings_transactions' 
AND column_name IN ('tax_amount', 'amount_after_tax', 'tax_rate');
-- Expected: 3 rows

-- 3. Cek settings configured
SELECT setting_key, setting_value FROM app_settings 
WHERE setting_key IN ('tax_rate', 'min_withdrawal_amount');
-- Expected: tax_rate = 0.10, min_withdrawal_amount = 50000

-- 4. Test functions
SELECT * FROM calculate_withdrawal_tax(100000);
-- Expected: tax=10000, after_tax=90000, rate=0.10

SELECT get_min_withdrawal_amount();
-- Expected: 50000

-- 5. Cek RLS enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
-- Expected: 5 tables dengan RLS enabled
```

### **Test Tax System**

```sql
-- Test withdrawal dengan pajak
INSERT INTO savings_transactions (
  rt_id, 
  type, 
  amount, 
  tax_amount, 
  amount_after_tax, 
  tax_rate, 
  description
) 
SELECT 
  r.id,
  'withdrawal',
  100000,
  tax.tax_amount,
  tax.amount_after_tax,
  tax.tax_rate,
  'Test withdrawal dengan pajak'
FROM rt r, calculate_withdrawal_tax(100000) tax
WHERE r.nomor = '01'
LIMIT 1;

-- Verify hasil
SELECT 
  s.amount,
  s.tax_amount,
  s.amount_after_tax,
  s.tax_rate,
  r.nomor
FROM savings_transactions s
JOIN rt r ON s.rt_id = r.id
WHERE s.description = 'Test withdrawal dengan pajak';
-- Expected: amount=100000, tax=10000, after_tax=90000, rate=0.10
```

---

## 🎯 SUCCESS CRITERIA

### ✅ **Checklist Implementasi Berhasil:**

- [ ] Semua 5 tables berhasil dibuat
- [ ] Kolom pajak ada di `savings_transactions` table
- [ ] App settings terisi dengan konfigurasi default
- [ ] Functions untuk kalkulasi pajak berfungsi
- [ ] Sample data RT tersedia
- [ ] RLS enabled pada semua tables
- [ ] Test withdrawal dengan pajak berhasil

### ✅ **Ready for Application Integration:**

- [ ] Database schema complete
- [ ] Tax system functional
- [ ] Minimum withdrawal validation ready
- [ ] Settings configurable
- [ ] Sample data available for testing

---

## 🚨 **Troubleshooting Common Issues**

### **Issue: "relation already exists"**
**Solution:** Normal, script menggunakan `IF NOT EXISTS`

### **Issue: "column already exists"**  
**Solution:** Skip ALTER TABLE ADD COLUMN, lanjut ke step berikutnya

### **Issue: "function already exists"**
**Solution:** Normal, script menggunakan `CREATE OR REPLACE`

### **Issue: Permission denied**
**Solution:** Pastikan user Supabase punya CREATE privileges

### **Issue: Foreign key constraint fails**
**Solution:** Pastikan parent tables sudah dibuat sebelum child tables

---

## 📋 **Next Steps Setelah Database Ready**

1. **Update Application Code** untuk menggunakan kolom pajak baru
2. **Test Integration** dengan existing components
3. **Update UI Components** untuk menampilkan breakdown pajak
4. **Implement Validation** untuk minimum withdrawal
5. **Create Admin Settings** untuk mengubah konfigurasi

---

**🎉 Selamat! Database Supabase siap dengan sistem pajak 10% dan fitur lengkap Bank Sampah RW 10.**

---

**Document Version**: 1.0  
**Last Updated**: August 2025  
**Database Schema Version**: v2.0 (with tax system)
